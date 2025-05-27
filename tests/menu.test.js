const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const HomePage = require("../pageobjects/homePage");
const SearchResultsPage = require("../pageobjects/searchResultsPage");

const CONFIG = {
  timeout: 10000,
  browserOptions: new chrome.Options().addArguments("--headless"),
  testCategory: {
    main: "Children's, young adult & educational",
    sub: "Educational material",
    music: "Educational: Music"
  },
  filter: "CD-Audio",
  expectedFormat: {
    text: "CD",
    type: "Audio"
  }
};

describe("Search products by filters", () => {
  let driver;
  let homePage;
  let resultsPage;
  let resultsCount;

  beforeAll(async () => {
    driver = await new Builder()
      .forBrowser("chrome")
      .setFirefoxOptions(CONFIG.browserOptions)
      .build();

    await driver.manage().window().maximize();
    await driver.manage().setTimeouts({ implicit: CONFIG.timeout });

    homePage = new HomePage(driver);
    resultsPage = new SearchResultsPage(driver);

    await homePage.openUrl();
    await homePage.acceptCookies();
  });

  afterAll(async () => {
    await driver.quit();
  });

  describe("Homepage verification", () => {
    test("Logo element should be visible", async () => {
      await homePage.verifyLogo();
    });

    test("Should display 'Ingliskeelsed raamatud' section", async () => {
      await homePage.verifySectionVisibility("Ingliskeelsed raamatud");
    });
  });

  describe("Category navigation", () => {
    beforeAll(async () => {
      await homePage.navigateToCategory(CONFIG.testCategory.main);
      await resultsPage.navigateToSubCategory(CONFIG.testCategory.sub);
    });

    test("Should display correct category name", async () => {
      const categoryName = await resultsPage.getCurrentCategoryName();
      expect(categoryName.toLowerCase()).toBe("educational material");
    });

    test("Should show more than 1 result", async () => {
      resultsCount = await resultsPage.getResultsCount();
      expect(Number(resultsCount)).toBeGreaterThan(1);
    });
  });

  describe("Subcategory filtering", () => {
    test("Music subcategory should show fewer results", async () => {
      await resultsPage.navigateToSubCategory(CONFIG.testCategory.music);
      const oldResultsCount = resultsCount;
      resultsCount = await resultsPage.getResultsCount();
      expect(Number(resultsCount)).toBeLessThan(Number(oldResultsCount));
    });
  });

  describe("Format filtering", () => {
    test("CD-Audio filter should reduce results", async () => {
      await resultsPage.addFilter(CONFIG.filter);
      const oldResultsCount = resultsCount;
      resultsCount = await resultsPage.getResultsCount();
      expect(Number(resultsCount)).toBeLessThan(Number(oldResultsCount));
    });

    test("Results should match CD Audio format", async () => {
      await resultsPage.verifyResultsFormatType(
        CONFIG.expectedFormat.text,
        CONFIG.expectedFormat.type
      );
    });
  });
});