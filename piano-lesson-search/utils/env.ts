/**
 * 環境判定関数
 * 環境変数 NEXT_PUBLIC_ENV の値に基づいて環境を判定します
 */

/**
 * テスト環境かどうかを判定する関数
 * @returns boolean テスト環境の場合はtrue、それ以外はfalse
 */
export const isTestEnvironment = (): boolean => {
  return process.env.NEXT_PUBLIC_ENV === 'test';
};

/**
 * 本番環境かどうかを判定する関数
 * @returns boolean 本番環境の場合はtrue、それ以外はfalse
 */
export const isProductionEnvironment = (): boolean => {
  return process.env.NEXT_PUBLIC_ENV === 'production';
};
