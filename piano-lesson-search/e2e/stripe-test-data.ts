/**
 * Stripeテスト用のデータ
 * テスト環境でのみ使用するカード情報などを定義
 */

// テスト用カード情報
export const TEST_CARDS = {
  // 常に成功するカード
  success: {
    number: '4242 4242 4242 4242',
    expiry: '12 / 25',
    cvc: '123',
    name: 'テスト ユーザー',
    postalCode: '123-4567',
  },
  // 常に失敗するカード（残高不足）
  insufficient: {
    number: '4000 0000 0000 9995',
    expiry: '12 / 25',
    cvc: '123',
    name: 'テスト ユーザー',
    postalCode: '123-4567',
  },
  // 3Dセキュア認証が必要なカード
  threeDSecure: {
    number: '4000 0000 0000 3220',
    expiry: '12 / 25',
    cvc: '123',
    name: 'テスト ユーザー',
    postalCode: '123-4567',
  },
};

// テスト用ユーザー情報
export const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
};

// テスト用教室情報
export const TEST_SCHOOL = {
  name: 'テスト音楽教室',
  address: '東京都渋谷区1-1-1',
  phone: '03-1234-5678',
};
