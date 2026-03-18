export const functionConfig = {
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackBaseUrl: process.env.PAYSTACK_BASE_URL ?? 'https://api.paystack.co',
  paystackCallbackUrl: process.env.PAYSTACK_CALLBACK_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash',
};
