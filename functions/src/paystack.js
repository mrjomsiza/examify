import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, admin } from './admin.js';
import { functionConfig } from './config.js';

const sessionPricing = {
  online: 220,
  inPerson: 250,
};

const getRecommendedSessionCount = (latestMark = 0) => {
  if (latestMark <= 50) return 4;
  if (latestMark <= 70) return 2;
  return 1;
};

const calculateSubscriptionQuote = ({ latestMark = 0, sessionType = 'online' }) => {
  const sessionCount = getRecommendedSessionCount(latestMark);
  const unitPrice = sessionPricing[sessionType] ?? sessionPricing.online;
  return {
    latestMark,
    sessionType,
    sessionCount,
    unitPrice,
    amount: Number((sessionCount * unitPrice).toFixed(2)),
  };
};

const paystackRequest = async (path, payload) => {
  if (!functionConfig.paystackSecretKey) {
    throw new HttpsError('failed-precondition', 'Missing PAYSTACK_SECRET_KEY configuration.');
  }

  const response = await fetch(`${functionConfig.paystackBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${functionConfig.paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || data.status === false) {
    throw new HttpsError('internal', data.message ?? 'Paystack request failed.');
  }

  return data.data;
};

export const initializePaystackTransaction = onCall(async (request) => {
  const { email, studentId, latestMark, sessionType } = request.data ?? {};
  if (!email || !studentId) {
    throw new HttpsError('invalid-argument', 'email and studentId are required');
  }

  const quote = calculateSubscriptionQuote({ latestMark, sessionType });
  const reference = `examify-${studentId}-${Date.now()}`;

  const transaction = await paystackRequest('/transaction/initialize', {
    email,
    amount: Math.round(quote.amount * 100),
    currency: 'ZAR',
    reference,
    callback_url: functionConfig.paystackCallbackUrl,
    metadata: {
      studentId,
      sessionType: quote.sessionType,
      sessionCount: quote.sessionCount,
      latestMark: quote.latestMark,
      subject: 'Mathematics',
    },
  });

  await db.collection('payments').doc(reference).set({
    reference,
    studentId,
    email,
    amount: quote.amount,
    currency: 'ZAR',
    sessionType: quote.sessionType,
    sessionCount: quote.sessionCount,
    status: 'initialized',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    authorizationUrl: transaction.authorization_url,
    accessCode: transaction.access_code,
    reference,
    quote,
  };
});

export const verifyPaystackTransaction = onCall(async (request) => {
  const { reference } = request.data ?? {};
  if (!reference) throw new HttpsError('invalid-argument', 'reference is required');

  if (!functionConfig.paystackSecretKey) {
    throw new HttpsError('failed-precondition', 'Missing PAYSTACK_SECRET_KEY configuration.');
  }

  const response = await fetch(`${functionConfig.paystackBaseUrl}/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${functionConfig.paystackSecretKey}`,
    },
  });

  const payload = await response.json();
  if (!response.ok || payload.status === false) {
    throw new HttpsError('internal', payload.message ?? 'Unable to verify Paystack payment.');
  }

  const transaction = payload.data;
  const authorization = transaction.authorization ?? null;
  const metadata = transaction.metadata ?? {};

  await db.collection('payments').doc(reference).set({
    reference,
    amount: transaction.amount / 100,
    currency: transaction.currency,
    status: transaction.status,
    gatewayResponse: transaction.gateway_response,
    paidAt: transaction.paid_at,
    channel: transaction.channel,
    studentId: metadata.studentId ?? null,
    email: transaction.customer?.email ?? null,
    metadata,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  if (authorization?.authorization_code && metadata.studentId) {
    await db.collection('subscriptionAuthorizations').doc(metadata.studentId).set({
      studentId: metadata.studentId,
      email: transaction.customer?.email ?? null,
      authorizationCode: authorization.authorization_code,
      bin: authorization.bin,
      last4: authorization.last4,
      expMonth: authorization.exp_month,
      expYear: authorization.exp_year,
      cardType: authorization.card_type,
      bank: authorization.bank,
      reusable: authorization.reusable,
      signature: authorization.signature,
      storedAt: admin.firestore.FieldValue.serverTimestamp(),
      reference,
    }, { merge: true });

    await db.collection('subscriptions').doc(metadata.studentId).set({
      studentId: metadata.studentId,
      status: transaction.status === 'success' ? 'active' : 'pending',
      amount: transaction.amount / 100,
      currency: transaction.currency,
      latestReference: reference,
      sessionType: metadata.sessionType ?? 'online',
      sessionCount: metadata.sessionCount ?? 1,
      renewedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  return {
    status: transaction.status,
    reference,
    authorizationStored: Boolean(authorization?.authorization_code),
  };
});

export const chargeStoredAuthorization = onCall(async (request) => {
  const { studentId, email, amount, authorizationCode, metadata = {} } = request.data ?? {};
  if (!studentId || !email || !amount || !authorizationCode) {
    throw new HttpsError('invalid-argument', 'studentId, email, amount, and authorizationCode are required.');
  }

  const charge = await paystackRequest('/transaction/charge_authorization', {
    email,
    amount: Math.round(amount * 100),
    authorization_code: authorizationCode,
    metadata: {
      ...metadata,
      studentId,
      subject: 'Mathematics',
      recurring: true,
    },
  });

  await db.collection('payments').doc(charge.reference).set({
    reference: charge.reference,
    studentId,
    email,
    amount,
    currency: 'ZAR',
    status: charge.status ?? 'processing',
    recurring: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return charge;
});
