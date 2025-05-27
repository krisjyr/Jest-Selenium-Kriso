const Page = require('./basePage');
let CartPage = require('./cartPage');
const { By, until } = require('selenium-webdriver');

// URL and Element Locators
const homePageUrl = 'https://www.kriso.ee/';
const acceptCookiesBtn = By.className('cc-nb-reject'); // Using first version (reject)
const logoItem = By.className('icon-kriso-logo');
const offerBookLink = By.className('book-img-link');
const addToCartBtn = By.id('btn_addtocart');
const cartMessage = By.css('.item-messagebox');
const cartForwardBtn = By.className('icon-bag'); // Using first version
const cartBackBtn = By.className('cartbtn-event back');
const categoryBtn = By.id("cat-big-btn");

module.exports = class HomePage extends Page {
  async openUrl() {
    await super.openUrl(homePageUrl);
  }

  async acceptCookies() {
    await super.findAndClick(acceptCookiesBtn);
  }

  async verifyLogo() {
    const logo = await super.getElement(logoItem);
    expect(logo).toBeDefined();
  }

  // Search functionality
  async searchForKeyword(keyword) {
    const searchInput = await super.getElement(By.name('keyword'));
    await searchInput.sendKeys(keyword);
    const searchButton = await super.getElement(By.css('input[type="submit"]'));
    await searchButton.click();
    await this.driver.wait(until.elementLocated(By.css('.product')));
  }

  async getProducts() {
    const products = await super.getElements(By.css('.product'));
    return products;
  }

  // Book page navigation
  async openBookPage(number) {
    const bookLinks = await super.getElements(offerBookLink);
    await super.click(bookLinks[number - 1]);
  }

  // Cart functionality - Multiple approaches combined
  async addItemToShoppingCart() {
    await super.findAndClick(addToCartBtn);
  }

  async addFirstProductToCart() {
    const firstAddButton = await super.getElement(By.css('.product .btn-add2cart'));
    const firstTitleElement = await super.getElement(By.css('.product meta[itemprop="name"]'));
    const firstBookTitle = await firstTitleElement.getAttribute('content');
    await firstAddButton.click();
    await super.findAndClick(By.css('.wnd-close a'));
    return firstBookTitle;
  }

  async addSecondProductToCart() {
    const secondAddButton = (await super.getElements(By.css('.product .btn-add2cart')))[0];
    const secondTitleElement = (await super.getElements(By.css('.product meta[itemprop="name"]')))[0];
    const secondBookTitle = await secondTitleElement.getAttribute('content');
    await secondAddButton.click();
    await super.findAndClick(By.css('.wnd-close a'));
    return secondBookTitle;
  }

  async verifyItemAddedToCart() {
    await super.waitUntilElementText(cartMessage, 'Toode lisati ostukorvi');
  }

  async continueShopping() {
    await super.findAndClick(cartBackBtn);
    await super.findAndClick(logoItem);
  }

  async openShoppingCart() {
    await super.findAndClick(cartForwardBtn);
    return new CartPage(super.getDriver());
  }

  // Navigation and category functionality
  async verifySectionVisibility(sectionName) {
    const el = await super.getElement(
      By.xpath(`//a[contains(string(), "${sectionName}")]`)
    );
    expect(el).not.toBeNull();
  }

  async navigateToCategory(category) {
    await super.findAndClick(categoryBtn);
    await super.findAndClick(
      By.xpath(`//a[contains(string(), "${category}")]`)
    );
  }
};