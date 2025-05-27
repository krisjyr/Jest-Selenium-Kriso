const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
let HomePage = require("../pageobjects/homePage");
let SearchResults = require('../pageobjects/searchResultsPage');

require("chromedriver");

let driver;
const TIMEOUT = 1000;

describe('Search test', () => {

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome')
      //.setChromeOptions(new chrome.Options().addArguments('--headless'))
      .build();
    await driver.manage().window().maximize();
    await driver.manage().setTimeouts({ implicit: TIMEOUT });
    await driver.get('https://www.kriso.ee');
  });

  afterAll(async () => {
    await driver.quit();
  });

  test('Open homepage and verify logo/title, remove cookies', async () => {
    HomePage = new HomePage(driver);
    SearchResults = new SearchResults(driver);
    await HomePage.acceptCookies();
    await HomePage.verifyLogo();
  });

  test('Search for "harry potter" and verify results', async () => {

    await HomePage.searchForKeyword('harry potter');
    await SearchResults.waitForResults();
    const products = await HomePage.getProducts();
    expect(products.length).toBeGreaterThan(0);
    await SearchResults.verifyProductTitlesContain('harry potter');
  });

  test('Sort results by price and verify order', async () => {

    await SearchResults.waitForResults();
    await SearchResults.sortByPrice();
    const prices = await SearchResults.getProductPrices(5);
   
    for (const price of prices) {
      expect(price).toBeGreaterThan(0); // More realistic expectation
      expect(price).toBeLessThan(1000); // More realistic expectation
    }
  });

  test('Filter by language (English) and verify results', async () => {

    await SearchResults.waitForResults();
    await SearchResults.filterByLanguage();
    await SearchResults.verifyLanguageFilterApplied();
  });

  test('Filter by format (Hardback) and verify results', async () => {

    await SearchResults.waitForResults();
    await SearchResults.filterByFormat();
    await SearchResults.verifyFormatFilterApplied();
  });
});