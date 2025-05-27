// has everything related to cart page
const Page = require('./basePage')
const { By } = require('selenium-webdriver')

// move all the clicks and element locators here
const cartQuantity = By.css(".icon-bag > .cart-bubble");
const cartRowItems = By.css('.tbl-row > .subtotal')
const cartSum = By.css('.order-total > .o-value')
const cartItemRow = By.css('.tbl-row')
const cartRemoveBtn = By.css('.remove')

module.exports = class Cartpage extends Page  {

    async verifyCartQuantity(number) {
        await super.waitUntilElementText(cartQuantity, number.toString())
    }

    async verifyCartSumIsCorrect() {
        const cartItems = await super.getElements(cartRowItems)

        let cartItemsSum = 0
        for(let item of cartItems) {
            cartItemsSum += parseFloat((await item.getText()).replace(/€/g, ""));
        }  

        let basketSum = await super.getElementText(cartSum)
        const basketSumNum = parseFloat(basketSum.replace(/€/g,""))
        
        expect(basketSumNum).toBe(cartItemsSum);
        return cartItemsSum
    }

    async removeItemFromCart(index) {
        const removeButtons = await this.getElements(
          By.css(".tbl-row .remove .cart-btn-remove")
        );
        if (removeButtons.length > index) {
          await removeButtons[index].click();
          await this.driver.sleep(1000);
        } else {
          throw new Error("Index out of range for remove button");
        }
    }

    async verifyPriceUpdatesCorrectly(originalSum, expectedReduction) {
        const newSum = await this.verifyCartSumIsCorrect();
        expect(originalSum - newSum).toBeCloseTo(expectedReduction, 2);
    } 

    async verifyItemRemoved(itemIndex) {
    const items = await this.getElements(cartRowItems);
    expect(items.length).toBe(itemIndex);
    }

    async getCartItems() {
        const cartItems = await this.getElements(By.css(".tbl-row"));
        return cartItems;
    }

    async getCartItemTitles() {
        const cartTitles = await this.getElements(By.css(".tbl-row .title > a"));
        const titles = [];
        for (let title of cartTitles) {
            titles.push(await title.getText());
        }
        return titles;
    }

    async getTotalPrice() {
        const totalPriceElement = await this.getElement(
          By.css(".os-order-total .os-value")
        );
        const totalText = await totalPriceElement.getText();
        return parseFloat(totalText.replace(/[^\d,]/g, "").replace(",", "."));
    }

}