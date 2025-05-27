const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
let HomePage = require("../pageobjects/homePage");
let CartPage = require("../pageobjects/cartPage");

require("chromedriver");

let driver;
const TIMEOUT = 1000;

describe('Add Books to Shopping Cart', () => {
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
    await HomePage.acceptCookies();
    await HomePage.verifyLogo();
  });

  test('Search for any keyword', async () => {
    await HomePage.searchForKeyword('raamat');
    const products = await HomePage.getProducts();
    expect(products.length).toBeGreaterThan(0);
  });

  let firstBookTitle = '';
  let secondBookTitle = '';

  test('Add first book to shopping cart', async () => {
    firstBookTitle = await HomePage.addFirstProductToCart();
    const cartPage = new CartPage(driver);
    await cartPage.verifyCartQuantity(1);
  });

  test('Add second book to shopping cart', async () => {
    secondBookTitle = await HomePage.addSecondProductToCart();
    const cartPage = new CartPage(driver);
    await cartPage.verifyCartQuantity(2);
  });

  test('Go to shopping cart', async () => {
    const cartPage = await HomePage.openShoppingCart();
    const cartItems = await cartPage.getCartItems();
    expect(cartItems.length).toBe(2);
  });

  test('Verify two correct items are in the cart', async () => {
    const cartPage = new CartPage(driver);
    const cartTitles = await cartPage.getCartItemTitles();
    expect(cartTitles).toEqual(expect.arrayContaining([firstBookTitle, secondBookTitle]));
  });

  let totalBeforeRemoval = 0;
  let totalAfterRemoval = 0;

  test('Verify total price is accurate before removing', async () => {
    const cartPage = new CartPage(driver);
    totalBeforeRemoval = await cartPage.getTotalPrice();
    expect(totalBeforeRemoval).toBeGreaterThan(0);
  });

  test('Remove first item and verify', async () => {
    const cartPage = new CartPage(driver);
    await cartPage.removeItemFromCart(1);
    const cartItemsAfter = await cartPage.getCartItems();
    expect(cartItemsAfter.length).toBe(1);
    const remainingTitle = await cartItemsAfter[0].findElement(By.css('.title > a')).getText();
    expect(remainingTitle).toBe(secondBookTitle);
  });

  test('Verify total price updates correctly after removal', async () => {
    const cartPage = new CartPage(driver);
    totalAfterRemoval = await cartPage.getTotalPrice();
    expect(totalAfterRemoval).toBeLessThan(totalBeforeRemoval);
  });
});
