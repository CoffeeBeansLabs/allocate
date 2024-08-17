//import {applicationUrl, password, username} from "../../config/env";
import config from '../../config/config';
import clientPageObjects from '../pageObjects/client.page.objects';
import util from '../../support/utils/utils';
import { globalMap } from '../../support/utils/globalMap';
import device from '../../support/library/device';
import projectPageObjects from '../pageObjects/project.page.objects';
import commonPageObjects from '../pageObjects/common.page.objects';
/**
* main page object containing all methods, selectors and functionality
* that is shared across all page objects
*/
class Page {
    /**
    * Opens a sub page of the page
    * @param path path of the sub page (e.g. /path/to/page.html)
    */
    public async open(path: string) {
        console.log(`---> This is the URL: ${config.applicationUrl}/${path}`);
        await browser.url(`${config.applicationUrl}/${path}`);
        //await browser.pause(5000);
        //const currentTitle = await browser.getTitle();
        return await browser.getTitle();
    }
    public getUsername(): string {
        return config.username;
    }
    public getPassword(): string {
        return config.password;
    }
    public async selectFieldValue(fieldName: string, value: string): Promise<boolean> {
        let listSelector = null;
        if (device.isWeb()) {
            const fieldMap = {
                'domain': clientPageObjects.selectDomain,
                'country': clientPageObjects.selectCountry,
                'city': clientPageObjects.selectCity,
                'account manager': clientPageObjects.selectAccountManager,
                'client': projectPageObjects.selectClient,
                'project status': projectPageObjects.selectProjectStatus,
                'type of engagement': projectPageObjects.selectTypeOfEngagement,
                'currency': projectPageObjects.selectCurrency,
                'delivery mode': projectPageObjects.selectDeliveryMode,
                'project account manager': projectPageObjects.selectAccountManager
            };

            const normalizedFieldName = fieldName.toLowerCase();

            if (!(normalizedFieldName in fieldMap)) {
                throw new Error(`Invalid field name: ${fieldName}`);
            }

            await util.click(fieldMap[normalizedFieldName]);
            globalMap.addField(normalizedFieldName, value);

            const ele: WebdriverIO.Element = await this.selectFromList(commonPageObjects.selectListValue, value);

            if (ele !== null) {
                await ele.click();
                return true;
            }

            return false;
        }
    }
    public async selectFromList(selector, value: string): Promise<WebdriverIO.Element> {
        let foundElement: WebdriverIO.Element = null;
        await browser.pause(2000);
        const listValue = await util.getElements(selector);
        console.log(`list size: ${listValue.length}`)
        if (listValue.length == 0) {
            throw new Error(`Failed as there are no options available in dropdown`);
        }
        if (value.toLowerCase() === 'any') {
            const index: number = await Math.floor(Math.random() * listValue.length);
            foundElement = listValue[index];
        } else {
            // Iterate over the elements to check their text content
            for (const element of listValue) {
                const text = await element.getText();
                if (text === value) {
                    foundElement = element;
                    break; // Exit the loop
                }
            }
            if (foundElement) {
                console.log('Element found and returned.');
            } else {
                console.log(`No element containing ${value} was found.`);
                await browser.pause(6000);
            }
        }
        // Return the found element
        return foundElement;
    }
}
export default new Page();