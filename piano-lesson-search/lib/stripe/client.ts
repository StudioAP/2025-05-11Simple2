import { Stripe } from 'stripe';

// Stripeクライアントの初期化
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil', // 最新のAPIバージョンを使用
  appInfo: {
    name: 'PianoLessonSearch',
    version: '1.0.0',
  },
});
