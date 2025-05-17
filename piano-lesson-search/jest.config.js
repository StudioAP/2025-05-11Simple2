module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/selenium-e2e/**/*.spec.ts'],
  // setupFilesAfterEnv: ['./piano-lesson-search/selenium-e2e/jest.setup.js'] // 必要に応じてセットアップファイルを作成
}; 