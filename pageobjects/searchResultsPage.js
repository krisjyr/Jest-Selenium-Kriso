const { By, until } = require('selenium-webdriver');
const BasePage = require("./basePage");

const result = By.css(".book-list > .list-item");
const title = By.css(".book-title");
const description = By.css(".book-desc-short > span");
const bookFeatures = By.className("book-features");
const categoryName = By.css(".catbrowser > h2 > span");

const englishRegex =
  /^[\p{L}\p{N}\s.,!?'"():;\-–—&/\\[\]{}@#%*+=<>_|~`’™…®]*$/u;

class SearchResultsPage extends BasePage {
  async waitForResults() {
    await this.driver.wait(until.elementLocated(By.css(
      '.booklist-wrap > .book-list'
    )), 10000);
    return this;
  }

  async getProducts() {
    return await this.driver.findElements(By.css('.product-wrap.db-english2'));
  }

  async verifyProductTitlesContain(term, count = 3) {
    const products = await this.getProducts();
    const topProducts = products.slice(0, count);
    
    for (const product of topProducts) {
      const title = await product.findElement(By.css('div > meta[itemprop="name"]')).getAttribute('content');
      expect(title.toLowerCase()).toContain(term.toLowerCase());
    }
    return this;
  }

  async sortByPrice() {
    await this.driver.findElement(By.css(
      '#section-wrap > div.two-col-wrap.clearfix > div.col-left > div.filters-content > div:nth-child(9) > div > ul > li:nth-child(3) > a'
    )).click();
    return this;
  }

  async getProductPrices(count = 5) {
    const priceElements = await this.driver.findElements(By.css('span.book-price'));
    const prices = [];
    
    for (const el of priceElements.slice(0, count)) {
      const priceText = await el.getText();
      const price = parseFloat(priceText
        .replace(/[^\d,.-]/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '.'));
      prices.push(price);
    }
    
    return prices;
  }

  async filterByLanguage() {
    await this.driver.findElement(By.css('#top-csel > option[value="english2"]')).click();
    return this;
  }

  async verifyLanguageFilterApplied() {
    const url = await this.driver.getCurrentUrl();
    expect(url.includes('database=english2')).toBeTruthy();

    const products = await this.driver.findElements(By.css('.product-wrap'));
    for (const product of products) {
      const className = await product.getAttribute('class');
      expect(className).toContain('db-english2');
    }
    return this;
  }

  async filterByFormat() {
    await this.driver.findElement(By.xpath('//a[contains(., "Hardback ")]')).click();
    return this;
  }

  async verifyFormatFilterApplied() {
    const url = await this.driver.getCurrentUrl();
    expect(url.includes('format=Hardback')).toBeTruthy();
    
    const activeFilters = await this.driver.findElements(By.css('#active-filters > ul > li'));
    let found = false;
    for (const filter of activeFilters) {
      const text = await filter.getText();
      if (text.includes('Hardback')) {
        found = true;
        break;
      }
    }
    expect(found).toBeTruthy();
    return this;
  }

  async navigateToSubCategory(subcategory) {
    await super.findAndClick(
      By.xpath(`//i[contains(string(), "${subcategory}")]`),
    );
  }

  async getCurrentCategoryName() {
    return await super.getElementText(categoryName);
  }

  async getResultsCount() {
    const headerText = await super.getElement(
      By.xpath(`//i[normalize-space()='Otsingu tulemused']`),
    );

    const header = await headerText.findElement(By.xpath("./ancestor::h2[1]"));
    const resultsContainer = await header.findElement(
      By.xpath("following-sibling::div[1]"),
    );

    const resultsCount = await resultsContainer.findElement(
      By.className("sb-results-total"),
    );

    return await resultsCount.getText();
  }

  async addFilter(filter) {
    await super.findAndClick(By.xpath(`//a[contains(string(), "${filter}")]`));
  }

  async verifyResultsFormatType(formatType, secondFormatType) {
    const elements = await super.getElements(result);
    for (const el of elements) {
      const features = await super.getChildText(el, bookFeatures);
      const featuresLowerCase = features.toLowerCase();
      
      if (secondFormatType) {
        expect(
          featuresLowerCase.includes(formatType.toLowerCase()) || 
          featuresLowerCase.includes(secondFormatType.toLowerCase())
        ).toBeTruthy();
      } else {
        expect(featuresLowerCase).toContain(formatType.toLowerCase());
      }
    }
  }
}

module.exports = SearchResultsPage;