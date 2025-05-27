const { until } = require('selenium-webdriver')

const TIMEOUT = 5000;

module.exports = class Page  {

    constructor(driver) {
        this.driver = driver
    }

    getDriver() {
        return this.driver
    }

    async openUrl(url) {
        return await this.driver.get(url)
    }

    async findAndClick(locator) {
        return await this.driver.findElement(locator).click()
    }

    async click(element) {
        return await element.click()
    }

    async getElement(locator) {
        return await this.driver.findElement(locator)
    }

    async getElements(locator) {
        return await this.driver.findElements(locator)
    }

    async getElementText(locator) {
        return await this.driver.findElement(locator).getText()
    }

    async findAndClick(locator) {
        const el = await this.driver.findElement(locator);
        return await el.click();
    }

    async waitUntilElementText(locator, text) {
        let element = await this.getElement(locator)
        return this.driver.wait(until.elementTextIs(element, text), TIMEOUT)
    }

    async getElementFromInsideElement(element, locator) {
        return await element.findElement(locator)
    }

    async getChildText(parent, locator) {
        const el = await parent.findElement(locator);
        return await el.getText();
      }
}