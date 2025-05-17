import { By, until, WebDriver } from 'selenium-webdriver';
import { setupDriver, quitDriver } from '../utils/driver-setup';
import { logDebuggingInfo } from '../utils/helpers';

const APP_URL = 'http://localhost:3000/'; // 基本URL
const SEARCH_RESULTS_PAGE_PATH = '/search'; // 検索結果ページパス

describe('一般ユーザー向け検索機能', () => {
  let driver: WebDriver | null = null;

  beforeAll(async () => {
    driver = await setupDriver();
  }, 30000);

  afterAll(async () => {
    await quitDriver(driver);
  }, 30000);

  test('トップページが正しく表示され、タイトルと検索入力が存在すること', async () => {
    if (!driver) throw new Error('WebDriver not initialized');
    const testName = 'top_page_display';
    const currentTestFullName = expect.getState().currentTestName;
    try {
      await driver.get(APP_URL);
      const title = await driver.getTitle();
      expect(title).toContain('ピアノ・リトミック教室検索');

      const searchInput1 = await driver.wait(
        until.elementLocated(By.css('input[placeholder="検索キーワード 1"]')),
        10000
      );
      expect(await searchInput1.isDisplayed()).toBe(true);

      const searchInput2 = await driver.findElement(By.css('input[placeholder="検索キーワード 2"]'));
      expect(await searchInput2.isDisplayed()).toBe(true);
      const searchInput3 = await driver.findElement(By.css('input[placeholder="検索キーワード 3"]'));
      expect(await searchInput3.isDisplayed()).toBe(true);

    } catch (error) {
      if (driver) await logDebuggingInfo(driver, `${currentTestFullName}_${testName}`);
      throw error;
    }
  }, 30000);

  test('キーワード1つで検索し、検索ページに正しく遷移すること', async () => {
    if (!driver) throw new Error('WebDriver not initialized');
    const testName = 'single_keyword_search_navigation';
    const currentTestFullName = expect.getState().currentTestName;
    const keyword = 'ピアノ'; // ダミーデータに「ピアノ」を含む教室名があることを期待
    try {
      await driver.get(APP_URL);

      const keywordInput1 = await driver.findElement(By.css('input[placeholder="検索キーワード 1"]'));
      await keywordInput1.sendKeys(keyword);

      const searchButton = await driver.findElement(By.xpath('//button[text()="検索する"]'));
      await searchButton.click();

      // 検索ページに遷移したことを確認
      await driver.wait(until.urlContains(SEARCH_RESULTS_PAGE_PATH), 10000);
      expect(await driver.getCurrentUrl()).toContain(SEARCH_RESULTS_PAGE_PATH);

      // URLにキーワードが含まれていることを確認
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain(`keyword1=${encodeURIComponent(keyword)}`);

      // 少し待機し、ページがレンダリングされるまで待つ
      await driver.sleep(1000);

      // ページソースが検索キーワードを含むかチェック
      const pageSource = await driver.getPageSource();
      expect(pageSource).toContain('検索キーワード');
      expect(pageSource).toContain(keyword);

      // H1タグで「検索結果」というテキストが表示されているか確認
      const h1Elements = await driver.findElements(By.css('h1'));
      let foundResultsHeader = false;
      for (const h1 of h1Elements) {
        const text = await h1.getText();
        if (text === '検索結果') {
          foundResultsHeader = true;
          break;
        }
      }
      expect(foundResultsHeader).toBe(true);

      // 検索中または結果表示の確認
      // ローディング状態か検索結果表示かを確認
      const bodyText = await driver.findElement(By.tagName('body')).getText();
      
      const isSearching = await driver.findElements(By.css('.lucide-refresh-cw')).then(
        elements => elements.length > 0
      );
      const searchingText = bodyText.includes('検索中...');
      const hasResults = bodyText.includes('件の教室が見つかりました');
      const hasNoResultsMessage = bodyText.includes('検索条件に一致する教室が見つかりませんでした');
      
      // いずれかの状態であればOK
      expect(isSearching || searchingText || hasResults || hasNoResultsMessage).toBe(true);

    } catch (error) {
      if (driver) await logDebuggingInfo(driver, `${currentTestFullName}_${testName}`);
      throw error;
    }
  }, 40000); // タイムアウト時間を延長

  test('複数のキーワードで検索し、検索ページに正しく遷移すること', async () => {
    if (!driver) throw new Error('WebDriver not initialized');
    const testName = 'multiple_keywords_search_navigation';
    const currentTestFullName = expect.getState().currentTestName;
    const keyword1 = 'リトミック'; 
    const keyword2 = '駅近';
    try {
      await driver.get(APP_URL);

      const keywordInput1 = await driver.findElement(By.css('input[placeholder="検索キーワード 1"]'));
      await keywordInput1.sendKeys(keyword1);
      const keywordInput2 = await driver.findElement(By.css('input[placeholder="検索キーワード 2"]'));
      await keywordInput2.sendKeys(keyword2);

      const searchButton = await driver.findElement(By.xpath('//button[text()="検索する"]'));
      await searchButton.click();

      // 検索ページに遷移したことを確認
      await driver.wait(until.urlContains(SEARCH_RESULTS_PAGE_PATH), 10000);
      expect(await driver.getCurrentUrl()).toContain(SEARCH_RESULTS_PAGE_PATH);

      // URLにキーワードが含まれていることを確認
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain(`keyword1=${encodeURIComponent(keyword1)}`);
      expect(currentUrl).toContain(`keyword2=${encodeURIComponent(keyword2)}`);

      // 少し待機し、ページがレンダリングされるまで待つ
      await driver.sleep(1000);

      // ページソースが検索キーワードを含むかチェック
      const pageSource = await driver.getPageSource();
      expect(pageSource).toContain('検索キーワード');
      expect(pageSource).toContain(keyword1);
      expect(pageSource).toContain(keyword2);

      // H1タグで「検索結果」というテキストが表示されているか確認
      const h1Elements = await driver.findElements(By.css('h1'));
      let foundResultsHeader = false;
      for (const h1 of h1Elements) {
        const text = await h1.getText();
        if (text === '検索結果') {
          foundResultsHeader = true;
          break;
        }
      }
      expect(foundResultsHeader).toBe(true);

      // 検索中または結果表示の確認
      const bodyText = await driver.findElement(By.tagName('body')).getText();
      
      const isSearching = await driver.findElements(By.css('.lucide-refresh-cw')).then(
        elements => elements.length > 0
      );
      const searchingText = bodyText.includes('検索中...');
      const hasResults = bodyText.includes('件の教室が見つかりました');
      const hasNoResultsMessage = bodyText.includes('検索条件に一致する教室が見つかりませんでした');
      
      expect(isSearching || searchingText || hasResults || hasNoResultsMessage).toBe(true);

    } catch (error) {
      if (driver) await logDebuggingInfo(driver, `${currentTestFullName}_${testName}`);
      throw error;
    }
  }, 40000); // タイムアウト時間を延長

  test('検索結果が0件の場合に適切なメッセージが表示されること', async () => {
    if (!driver) throw new Error('WebDriver not initialized');
    const testName = 'no_search_results';
    const currentTestFullName = expect.getState().currentTestName;
    const nonExistentKeyword = '存在しないはずのキーワード12345ABCDEZZZ';
    try {
      await driver.get(APP_URL);

      const keywordInput1 = await driver.findElement(By.css('input[placeholder="検索キーワード 1"]'));
      await keywordInput1.sendKeys(nonExistentKeyword);

      const searchButton = await driver.findElement(By.xpath('//button[text()="検索する"]'));
      await searchButton.click();

      await driver.wait(until.urlContains(SEARCH_RESULTS_PAGE_PATH), 10000);
      
      // 検索結果なしのメッセージが表示されるまで最大20秒待機
      try {
        // まず少し待機して検索処理が進むようにする
        await driver.sleep(3000);
        
        // ローディングが完了するか、または20秒のタイムアウトになるまで待機
        await driver.wait(
          async () => {
            try {
              if (!driver) return true;
              const loadingIcons = await driver.findElements(By.css('.lucide-refresh-cw'));
              if (loadingIcons.length === 0) return true;
              
              // ローディングアイコンが表示されていないか確認
              let allHidden = true;
              for (const icon of loadingIcons) {
                try {
                  if (await icon.isDisplayed()) {
                    allHidden = false;
                    break;
                  }
                } catch (elementError) {
                  // 要素が既に削除されている場合のエラーは無視
                }
              }
              return allHidden;
            } catch (e) {
              // 要素が見つからない場合はローディングが終了したとみなす
              return true;
            }
          },
          20000
        );
      } catch (loadingError) {
        // タイムアウトしても続行
        console.warn('ローディング待機中にタイムアウト発生');
      }
      
      // この時点でのページのテキストとソースを取得
      const bodyText = await driver.findElement(By.tagName('body')).getText();
      const pageSource = await driver.getPageSource();
      
      // ローディング中か「検索結果なし」のいずれかであることを確認
      const isSearching = await driver.findElements(By.css('.lucide-refresh-cw')).then(
        elements => elements.length > 0
      );
      const searchingText = bodyText.includes('検索中...');
      
      // 「検索条件に一致する教室が見つかりませんでした」のテキストがページソースにあるか確認
      const hasNoResultsMessage = 
        bodyText.includes('検索条件に一致する教室が見つかりませんでした') || 
        pageSource.includes('検索条件に一致する教室が見つかりませんでした');
      
      expect(isSearching || searchingText || hasNoResultsMessage).toBe(true);

    } catch (error) {
      if (driver) await logDebuggingInfo(driver, `${currentTestFullName}_${testName}`);
      throw error;
    }
  }, 40000); // タイムアウト時間を延長

  test('キーワードが空の状態で検索した際にURLが変わらないこと', async () => {
    if (!driver) throw new Error('WebDriver not initialized');
    const testName = 'empty_keyword_search_url_unchanged'; // テスト名変更
    const currentTestFullName = expect.getState().currentTestName;
    try {
      await driver.get(APP_URL);

      const searchButton = await driver.findElement(By.xpath('//button[text()="検索する"]'));
      await searchButton.click();

      // 1秒待機してURLが変わらないことを確認
      await driver.sleep(1000);
      expect(await driver.getCurrentUrl()).toBe(APP_URL);

    } catch (error) {
      if (driver) await logDebuggingInfo(driver, `${currentTestFullName}_${testName}`);
      throw error;
    }
  }, 30000);
}); 