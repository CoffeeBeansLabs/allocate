import { ChainablePromiseElement } from 'webdriverio';
import loginPageObject from '../pageObjects/login.page.objects';
import dashboardPageObject from '../pageObjects/dashboard.page.objects';
import clientPageObject from '../pageObjects/client.page.objects';
import projectPageObject from '../pageObjects/project.page.objects';
import page from './common.page';
import util from '../../support/utils/utils'
import device from '../../support/library/device'

/**
 * sub page containing specific selectors and methods for a specific page
 */
class DashboardPage {
    public async dashboardPage(): Promise<boolean> {
        if (device.isWeb()) {
            return await util.elementIsDisplayed(dashboardPageObject.imgProfile);
        }
    }
    public async logout(): Promise<boolean> {
        if (device.isWeb()) {
            await util.click(dashboardPageObject.imgProfile);
            await util.click(dashboardPageObject.txtLogout);
            return util.elementIsDisplayed(loginPageObject.btnGoogleLogin);
        }
    }
    public async navigateClientPage(): Promise<boolean> {
        if (device.isWeb()) {
            //await browser.pause(6000);
            await util.click(dashboardPageObject.tabClients);
            return await util.elementIsDisplayed(clientPageObject.btnAddNewClient);
        }
    }
    public async navigateProjectPage(): Promise<boolean> {
        if (device.isWeb()) {
            //await browser.pause(6000);
            await util.click(dashboardPageObject.tabProjects);
            return await util.elementIsDisplayed(projectPageObject.btnAddNewProject);
        }
    }
}

export default new DashboardPage();
