import { expect } from 'chai';
import device from '../library/device'

class Utils {

  async clickElementByText(button: string) {
    const webElement: string = (`//*[text()="${button}" or @data-testid="${button}"]`);
    const myButton = await $(webElement);
    await myButton.click();
  }

  getLocator(object): string {
    if (device.isWeb()) {
      if (object.hasOwnProperty('web')) {
        return object.web;
      }
    } else if (device.isAndroid()) {
      if (object.hasOwnProperty('android')) {
        return object.android;
      }
    } else if (device.isIOS()) {
      if (object.hasOwnProperty('ios')) {
        return object.ios;
      }
    }
  }

  async getElement(selector): Promise<WebdriverIO.Element> {
    return await $(this.getLocator(selector));
  }

  async getElements(selector): Promise<WebdriverIO.ElementArray> {
    return await $$(this.getLocator(selector));
  }

  async clickonElementUntilExist(selector) {
    let check: boolean = true;
    check = await this.elementIsDisplayed(selector, 5000);
    while (check == true) {
      await this.click(selector);
      check = await this.elementIsDisplayed(selector, 5000);
    }
  }

  async setValue(selector, text: string) {
    try {
      if (await this.elementIsDisplayed(selector)) {
        const ele: WebdriverIO.Element = await this.getElement(selector);
        if (await this.isScrollable()) {
          await this.scrollToElement(ele);
        }
        await ele.setValue(text);
        console.log(`sucessfully enter the provided text to the Element <${this.getLocator(selector)}>`);
      }
    } catch (err) {
      console.log(`Element: ${selector} not present`)
    }
  }

  async validateElementText(selector, matchingText: string): Promise<boolean> {
    try {
      const eleText: string = await (await this.getElement(selector)).getText();
      return eleText.includes(matchingText);
    } catch (err) {
      console.log(`<${this.getLocator(selector)}> not found`)
    }
  }

  async elementIsDisplayed(selector, timeoutMS: number = 10000): Promise<boolean> {
    const locator: string = this.getLocator(selector);
    let isDisplayed: boolean = false;
    try {
      isDisplayed = await browser.waitUntil(
        async () => await $(locator).isDisplayed(),
        {
          timeout: timeoutMS,
          interval: 2000
        },
      );
    } catch (err) {
      console.log(`Element <${this.getLocator(selector)}> not found`);
    }
    //console.log(`Element <${this.getLocator(selector)}> found`);
    return isDisplayed;
  }
  /*
  wait for element to be clickable
  */
  async isElementClickable(selector, timeoutMS: number = 10000): Promise<boolean> {
    const locator: string = this.getLocator(selector);
    let isClickable: boolean = false;
    try {
      isClickable = await browser.waitUntil(
        async () => await $(locator).waitForClickable(),
        {
          timeout: timeoutMS,
          interval: 1000
        },
      );
    } catch (err) {
      console.log(`Element <${this.getLocator(selector)}> not clickable`);
    }
    return isClickable;
  }
  /*
  Get the value of a <textarea>, <select> or text <input> found by given selector.
  */
  async getValue(selector): Promise<string> {
    const locator = this.getLocator(selector);
    let element = null;
    if (await this.elementIsDisplayed(selector)) {
      element = await $(locator);
    }
    return await element.getValue();
  }
  /*
  Get the text of the element
  */
  async getText(selector): Promise<string> {
    if (await this.elementIsDisplayed(selector)) {
      const ele: WebdriverIO.Element = await this.getElement(selector);
      if (await this.isScrollable()) {
        await this.scrollToElement(ele);
      }
      return (await ele.getText());
    } else {
      console.log(`Unable to fetch the text of the element <${await this.getLocator(selector)}>`)
    }
  }
  /*
  Click on the element
  */
  async click(selector) {
    if (await this.elementIsDisplayed(selector)) {
      const ele: WebdriverIO.Element = await this.getElement(selector);
      if (await this.isScrollable()) {
        await this.scrollToElement(ele);
      }
      await ele.click();
      console.log(`Element <${this.getLocator(selector)}> is clicked`)
    } else {
      throw new Error(`CLICK: Unable to locate and click on element <${this.getLocator(selector)}>`)
    }
  }

  async getElementAttribute(selector, attribute: string): Promise<string> {
    if (await this.elementIsDisplayed(selector)) {
      const element = await this.getElement(selector);
      return await element.getAttribute(attribute);
    } else {
      throw new Error(`unable to the requested attribute "${attribute}" from the element`)
    }
  }

  //Scroll until element for a selector is into viewport and return the element
  async scrollToElement(element) {
    try {
      //const element = await this.getElement(selector);
      await element.scrollIntoView({ block: 'center', inline: 'center' });
      return element;
    } catch (err) {
      throw new Error(`scroll: Element not found`);
    }
  }

  /*
  Move the mouse to an element
  */
  async moveToElement(selector) {
    try {
      const element = await this.getElement(selector);
      await element.waitForDisplayed({ timeout: 10000 });
      await element.moveTo();
      return element;
    } catch (err) {
      console.log(`Element <${await this.getLocator(selector)}> is not found`)
    }
  }

  /*
  Scroll until element by selector is into viewport and move mouse to the element
  */
  async scrollAndMoveToElement(selector) {
    await this.scrollToElement(selector);
    const element = await this.moveToElement(selector);
    return element;
  }

  /*
  Choose a Select tag option by Visible Text
  */
  async chooseSelectOptionByVisibleText(selector, visibleText) {
    const ele = this.getElement(selector);
    await this.elementIsDisplayed(selector);
    await (await ele).selectByVisibleText(visibleText);
  }

  /*
  get a random integer between 0(inclusive) and maxIntValue(exclusive)
  */
  getRandomInt = (maxIntValue: number): number => Math.floor(Math.random() * maxIntValue);

  /*
  Generate Random Alphabatic String
  */
  getRandomString = (strLength: number): string => {
    const alphabaticString: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvxyz"
    let randomString: string = "";
    for (let i = 0; i < strLength; i++) {
      randomString = randomString + alphabaticString.charAt(alphabaticString.length * Math.random());
    }
    console.log(`---> Random String = ${randomString}`);
    return randomString;
  }

  /*
  Generate Random Alphanumeric String
  */
  getRandomAlphanumericString = (strLength: number): string => {
    const alphanumericString: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "0123456789" + "abcdefghijklmnopqrstuvxyz"
    let randomString: string = "";
    for (let i = 0; i < strLength; i++) {
      randomString = randomString + alphanumericString.charAt(alphanumericString.length * Math.random());
    }
    console.log(`---> Random String = ${randomString}`);
    return randomString;
  }
  /*
  Decrypt hexcode to simple text
  */
  decryptHexString(hexString: string): string {
    let decryptedString = '';
    for (let i = 0; i < hexString.length; i += 2) {
      const charCode = parseInt(hexString.substr(i, 2), 16);
      if (charCode) {
        decryptedString += String.fromCharCode(charCode);
      }
    }
    return decryptedString;
  }
  /*
  Switch to new window
  */
  async switchToNewWindow(originalWindow: string) {
    const allWindowHandles = await browser.getWindowHandles();
    let switchedWindow = null;
    await console.log(`All Available Windows: ${allWindowHandles}`);
    for (const handle of allWindowHandles) {
      if (handle !== originalWindow) {
        await console.log(`New Windows: ${handle}`);

        await browser.switchToWindow(handle);
        switchedWindow = handle;
        break;
      }
    }
    return switchedWindow;
  }
  /*
  Scroll to end fo the page
  */
  async scrollToEnd() {
    await browser.execute(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }
  async isScrollable() {
    // Check if the scroll is present
    return await browser.execute(() => {
      console.log(`scroll height: ${document.body.scrollHeight} and inner height ${window.innerHeight}`);
      return document.body.scrollHeight > window.innerHeight;
    });
  }
}
export default new Utils();