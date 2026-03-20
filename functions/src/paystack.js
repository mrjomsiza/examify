import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { getDb, admin } from './admin.js';
import {
  paystackConfigSecret,
  appConfigSecret,
  getPaystackConfig,
} from './config.js';

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

const paystackRequest = async ({ path, method = 'POST', payload }) => {
  const { paystackSecretKey, paystackBaseUrl } = getPaystackConfig();

  if (!paystackSecretKey) {
    throw new HttpsError('failed-precondition', 'Missing PAYSTACK_CONFIG.secretKey.');
  }

  const response = await fetch(`${paystackBaseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });

  const data = await response.json();

  if (!response.ok || data.status === false) {
    throw new HttpsError('internal', data.message ?? 'Paystack request failed.');
  }

  return data.data;
};

const callableOptions = {
  secrets: [paystackConfigSecret, appConfigSecret],
};

export const initializePaystackTransaction = onCall(callableOptions, async (request) => {
  try {
    const { email, studentId, latestMark, sessionType } = request.data ?? {};

    if (!email || !studentId) {
      throw new HttpsError('invalid-argument', 'email and studentId are required.');
    }

    const { paystackCallbackUrl } = getPaystackConfig();

    if (!paystackCallbackUrl) {
      throw new HttpsError('failed-precondition', 'Missing PAYSTACK_CONFIG.callbackUrl.');
    }

    const db = getDb();
    const quote = calculateSubscriptionQuote({ latestMark, sessionType });
    const reference = `examify-${studentId}-${Date.now()}`;

    logger.info('Initializing Paystack transaction', {
      email,
      studentId,
      reference,
      callbackUrl: paystackCallbackUrl,
      amount: quote.amount,
      sessionType: quote.sessionType,
      sessionCount: quote.sessionCount,
    });

    const transaction = await paystackRequest({
      path: '/transaction/initialize',
      method: 'POST',
      payload: {
        email,
        amount: Math.round(quote.amount * 100),
        currency: 'ZAR',
        reference,
        callback_url: paystackCallbackUrl,
        metadata: {
          studentId,
          sessionType: quote.sessionType,
          sessionCount: quote.sessionCount,
          latestMark: quote.latestMark,
          subject: 'Mathematics',
        },
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
  } catch (error) {
    logger.error('initializePaystackTransaction failed', error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError('internal', error?.message || 'Failed to initialize Paystack transaction.');
  }
});

export const verifyPaystackTransaction = onCall(callableOptions, async (request) => {
  const { reference } = request.data ?? {};

  if (!reference) {
    throw new HttpsError('invalid-argument', 'reference is required.');
  }

  const db = getDb();

  const transaction = await paystackRequest({
    path: `/transaction/verify/${reference}`,
    method: 'GET',
  });

  const authorization = transaction.authorization ?? null;
  const metadata = transaction.metadata ?? {};

  await db.collection('payments').doc(reference).set(
    {
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
    },
    { merge: true }
  );

  if (authorization?.authorization_code && metadata.studentId) {
    await db.collection('subscriptionAuthorizations').doc(metadata.studentId).set(
      {
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
      },
      { merge: true }
    );

    await db.collection('subscriptions').doc(metadata.studentId).set(
      {
        studentId: metadata.studentId,
        status: transaction.status === 'success' ? 'active' : 'pending',
        amount: transaction.amount / 100,
        currency: transaction.currency,
        latestReference: reference,
        sessionType: metadata.sessionType ?? 'online',
        sessionCount: metadata.sessionCount ?? 1,
        renewedAt: admin.firestore.FieldValue.serverTimestamp(),
        renewalDate:
          transaction.status === 'success'
            ? admin.firestore.Timestamp.fromDate(
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              )
            : null,
        billingCycleDays: 30,
        autoRenew: true,
      },
      { merge: true }
    );

    await db.collection('users').doc(metadata.studentId).set(
      {
        paymentCompleted: transaction.status === 'success',
        subscriptionStatus: transaction.status === 'success' ? 'active' : 'pending',
        latestPaymentReference: reference,
        subscriptionRenewalDate:
          transaction.status === 'success'
            ? admin.firestore.Timestamp.fromDate(
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              )
            : null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  return {
    status: transaction.status,
    reference,
    authorizationStored: Boolean(authorization?.authorization_code),
  };
});

export const chargeAuthorizationForSubscription = async ({
  studentId,
  email,
  amount,
  authorizationCode,
  metadata = {},
}) => {
  const db = getDb();

  const charge = await paystackRequest({
    path: '/transaction/charge_authorization',
    method: 'POST',
    payload: {
      email,
      amount: Math.round(amount * 100),
      authorization_code: authorizationCode,
      metadata: {
        ...metadata,
        studentId,
        subject: 'Mathematics',
        recurring: true,
      },
    },
  });

  const succeeded = charge.status === 'success';

  const nextRenewalDate = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  await db.collection('payments').doc(charge.reference).set(
    {
      reference: charge.reference,
      studentId,
      email,
      amount,
      currency: 'ZAR',
      status: charge.status ?? 'processing',
      recurring: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db.collection('subscriptions').doc(studentId).set(
    {
      studentId,
      status: succeeded ? 'active' : 'past_due',
      latestReference: charge.reference,
      amount,
      currency: 'ZAR',
      renewedAt: succeeded ? admin.firestore.FieldValue.serverTimestamp() : null,
      renewalDate: succeeded ? nextRenewalDate : admin.firestore.FieldValue.delete(),
      lastChargeStatus: charge.status ?? 'processing',
      lastChargeAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
      autoRenew: true,
    },
    { merge: true }
  );

  await db.collection('users').doc(studentId).set(
    {
      paymentCompleted: succeeded,
      subscriptionStatus: succeeded ? 'active' : 'past_due',
      latestPaymentReference: charge.reference,
      subscriptionRenewalDate: succeeded ? nextRenewalDate : null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { charge, succeeded, nextRenewalDate };
};

export const chargeStoredAuthorization = onCall(callableOptions, async (request) => {
  const { studentId, email, amount, authorizationCode, metadata = {} } = request.data ?? {};

  if (!studentId || !email || !amount || !authorizationCode) {
    throw new HttpsError(
      'invalid-argument',
      'studentId, email, amount, and authorizationCode are required.'
    );
  }

  const result = await chargeAuthorizationForSubscription({
    studentId,
    email,
    amount,
    authorizationCode,
    metadata,
  });

  return {
    ...result.charge,
    nextRenewalDate: result.succeeded ? result.nextRenewalDate.toDate().toISOString() : null,
  };
});