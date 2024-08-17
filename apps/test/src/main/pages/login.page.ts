import { ChainablePromiseElement } from 'webdriverio';
import loginPageObject from '../pageObjects/login.page.objects';
import dashboardPageObject from '../pageObjects/dashboard.page.objects';
import page from './common.page';
import util from '../../support/utils/utils'
import device from '../../support/library/device'

/**
 * sub page containing specific selectors and methods for a specific page
 */
class LoginPage {

    public async validateLoginPage(): Promise<boolean> {
        if (await browser.getTitle().toString() !== 'Allocate | Staffing Tool') {
            await this.open();
        }
        return await util.elementIsDisplayed(loginPageObject.btnGoogleLogin);
    }
    /**
     * Navigate to google login pop-up and return instance of original window.
     */
    public async loginPopUp() {
        if (device.isWeb()) {
            const originalWindow = await browser.getWindowHandle();
            console.log(`---> original window: ${originalWindow}`);
            await util.click(loginPageObject.btnGoogleLogin);
            // Wait for the new window to open
            await browser.pause(2000);
            await util.switchToNewWindow(originalWindow);
            if (await util.elementIsDisplayed(loginPageObject.btnUseAnotherAccount, 2000)) {
                await util.click(loginPageObject.btnUseAnotherAccount);
            }
            return originalWindow;
        }
    }
    /**
     * a method to encapsule automation code to interact with the page
     * e.g. to login using username and password
     */
    public async login(username: string = page.getUsername(), password: string = util.decryptHexString(page.getPassword())): Promise<boolean> {
        if (device.isWeb()) {
            const originalWindow = await this.loginPopUp();
            return this.enterUserPassword(originalWindow, username, password);
        }
    }
    /**
     * a method to encapsule automation code to interact with the login window
     * e.g. to login using username and password
     */
    public async enterUserPassword(originalWindow, username: string, password: string) {
        try {
            await util.setValue(loginPageObject.inputUsername, username);
            await util.scrollToEnd();
            await util.click(loginPageObject.btnNext);
            if (await util.elementIsDisplayed(loginPageObject.inputPassword, 4000)) {
                await util.setValue(loginPageObject.inputPassword, password);
                await util.click(loginPageObject.btnNext);
                if (await util.elementIsDisplayed(loginPageObject.txtAllowPermission, 4000)) {
                    await util.scrollToEnd();
                    await util.isElementClickable(loginPageObject.btnAllow);
                    await util.click(loginPageObject.btnAllow);
                    await browser.pause(8000);
                }
                else if (await util.elementIsDisplayed(loginPageObject.btnContinue, 4000)) {
                    await util.click(loginPageObject.btnContinue);
                    await browser.pause(2000);
                }
                else if (await util.elementIsDisplayed(loginPageObject.txtWrongPasswordError, 4000)) {
                    console.log("---> Invalid Password");
                }
            } else if (await util.elementIsDisplayed(loginPageObject.txtInvalidEmailError, 4000)) {
                console.log("---> Invalid Email Id");
            } else {
                console.log("---> Password input field locator not found");
            }
            if ((await browser.getWindowHandles()).length > 1) {
                console.log("---> closing window");
                await browser.closeWindow();
            }
            await browser.switchToWindow(originalWindow);
            return await util.elementIsDisplayed(dashboardPageObject.imgProfile, 5000);
        } catch (err) {
            await console.error(`---> Exception: ${err.message}`);
            return undefined;
        }
    }
    /**
     * method to login without credentials
     */
    public async loginWithoutCredentials(): Promise<boolean> {
        if (device.isWeb()) {
            const originalWindow = await this.loginPopUp();
            await util.click(loginPageObject.btnNext);
            if (await util.elementIsDisplayed(loginPageObject.txtwithoutEmailError)) {
                //await browser.closeWindow();
                console.log(`-----> Original Window: ${originalWindow}`)
                await browser.switchToWindow(originalWindow);
                if (!(await util.elementIsDisplayed(dashboardPageObject.imgProfile, 3000))) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }
    /**
     * to validate successfull login
     */
    public async validateSuccessfullLogin() {
        if (device.isWeb()) {
            return await util.elementIsDisplayed(dashboardPageObject.imgProfile, 2000);
        }
    }
    /**
     * overwrite specific options to adapt it to page object
     */
    public async open() {
        return await page.open('login');
    }
}

export default new LoginPage();
