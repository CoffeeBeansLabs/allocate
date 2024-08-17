import { ChainablePromiseElement } from 'webdriverio';
import loginPageObject from '../pageObjects/login.page.objects';
import dashboardPageObject from '../pageObjects/dashboard.page.objects';
import clientPageObject from '../pageObjects/client.page.objects';
import page from './common.page';
import util from '../../support/utils/utils'
import device from '../../support/library/device'
import faker from '../../support/library/faker'
import { assert } from 'chai';
import { globalMap } from '../../support/utils/globalMap'

/**
 * sub page containing specific selectors and methods for a specific page
 */
class clientPage {

    //static clientName = null;

    public async navigateCreateClientForm(): Promise<boolean> {
        if (device.isWeb()) {
            await util.click(clientPageObject.btnAddNewClient);
            return await util.elementIsDisplayed(clientPageObject.txtCreateEditClientPageHeader);
        }
    }

    public async navigateEditClientForm(): Promise<boolean> {
        if (device.isWeb()) {
            await util.click(clientPageObject.btnEdit);
            return await util.elementIsDisplayed(clientPageObject.txtCreateEditClientPageHeader);
        }
    }

    public async setClientName(): Promise<boolean> {
        if (device.isWeb()) {
            let clientName = await faker.generateClient();
            console.log(`client name: ${clientName}`)
            globalMap.addField('client', clientName);
            await util.setValue(clientPageObject.inputClientName, clientName);
            let value = await util.getValue(clientPageObject.inputClientName);
            if (clientName === value) {
                return true
            }
        }
    }

    public async setPOCName(poc: string): Promise<boolean> {
        let pocSelector = null;
        try {
            if (poc === 'first') {
                pocSelector = clientPageObject.inputFirstPocName;
            } else {
                pocSelector = clientPageObject.inputSecondPocName;
            }
            if (device.isWeb()) {
                let pocName = await faker.generateName();
                console.log(`${poc} POC name: ${pocName}`)
                if (poc === 'first') {
                    globalMap.addField('first poc name', pocName);
                } else {
                    globalMap.addField('second poc name', pocName);
                }
                await util.setValue(pocSelector, pocName);
                let value = await util.getValue(pocSelector);
                if (value !== pocName) {
                    throw new Error(`Failed to set ${poc} POC Name correctly`);
                }
                return true;
            }
        } catch (error) {
            console.error(`Error setting ${poc} POC Name:`, error);
            return false;  // Return false if there was an error
        }
    }

    public async setPOCEmail(poc: string): Promise<boolean> {
        let pocEmailSelector = null;
        try {
            if (poc === 'first') {
                pocEmailSelector = clientPageObject.inputFirstPocEmail;
            } else {
                pocEmailSelector = clientPageObject.inputSecondPocEmail;
            }
            if (device.isWeb()) {
                let pocEmail = await faker.generateEmail();
                console.log(`${poc} POC email: ${pocEmail}`)
                if (poc === 'first') {
                    globalMap.addField('first poc email', pocEmail);
                } else {
                    globalMap.addField('second poc email', pocEmail);
                }
                await util.setValue(pocEmailSelector, pocEmail);
                let value = await util.getValue(pocEmailSelector);
                if (value !== pocEmail) {
                    throw new Error('Failed to set First POC Email correctly');
                }
                return true;
            }
        } catch (error) {
            console.error('Error setting First POC Email:', error);
            return false;  // Return false if there was an error
        }
    }

    public async setPOCPhoneNumber(poc: string): Promise<boolean> {
        let pocPhoneSelector = null;
        try {
            if (poc === 'first') {
                pocPhoneSelector = clientPageObject.inputFirstPocPhoneNumber;
            } else {
                pocPhoneSelector = clientPageObject.inputSecondPocPhoneNumber;
            }
            if (device.isWeb()) {
                let pocPhoneNumber = await faker.generatePhoneNumber();
                console.log(`${poc} POC phone number: ${pocPhoneNumber}`)
                if (poc === 'first') {
                    globalMap.addField('first poc phone number', pocPhoneNumber);
                } else {
                    globalMap.addField('second poc phone number', pocPhoneNumber);
                }
                await util.setValue(pocPhoneSelector, pocPhoneNumber);
                let value = await util.getValue(pocPhoneSelector);
                if (value !== pocPhoneNumber) {
                    throw new Error(`Failed to set ${poc} POC phone number correctly`);
                }
                return true;
            }
        } catch (error) {
            console.error(`Error setting ${poc} POC Phone Number:`, error);
            return false;  // Return false if there was an error
        }
    }

    public async setPOCDesignation(poc: string): Promise<boolean> {
        let pocDesignationSelector = null;
        let pocDesignation = '';
        try {
            if (poc === 'first') {
                pocDesignationSelector = clientPageObject.inputFirstPocDesignation;
                pocDesignation = 'Product Owner';
            } else {
                pocDesignationSelector = clientPageObject.inputSecondPocDesignation;
                pocDesignation = 'Business Analyst';
            }
            if (device.isWeb()) {
                console.log(`${poc} POC designation: ${pocDesignation}`)
                if (poc === 'first') {
                    globalMap.addField('first poc designation', pocDesignation);
                } else {
                    globalMap.addField('second poc designation', pocDesignation);
                }
                await util.setValue(pocDesignationSelector, pocDesignation);
                let value = await util.getValue(pocDesignationSelector);
                if (value !== pocDesignation) {
                    throw new Error(`Failed to set ${poc} POC Designation correctly`);
                }
                return true;
            }
        } catch (error) {
            console.error(`Error setting ${poc} POC Designation:`, error);
            return false;  // Return false if there was an error
        }
    }

    public async setRemark(): Promise<boolean> {
        const remark: string = 'This client is created as part of testing'
        try {
            const remarkSelector = clientPageObject.inputRemark;
            if (device.isWeb()) {
                console.log(`remark: ${remark}`)
                globalMap.addField('remark', remark);
                await util.setValue(remarkSelector, remark);
                let value = await util.getValue(remarkSelector);
                if (value !== remark) {
                    throw new Error('Failed to set Remark correctly');
                }
                return true;
            }
        } catch (error) {
            console.error('Error setting Remark', error);
            return false;  // Return false if there was an error
        }
    }

    public async setClientStartDate(): Promise<boolean> {
        if (device.isWeb()) {
            //let startDate = await faker.generateDate();

            await util.click(clientPageObject.inputStartDate);
            //await util.setValue(clientPageObject.inputStartDate, startDate);
            let startDate = await util.getValue(clientPageObject.inputStartDate);
            globalMap.addField('start date', startDate);
            if (startDate !== undefined) {
                return true
            }
        }
    }

    public async verifyClientPage(): Promise<boolean> {
        if (device.isWeb()) {
            return await util.elementIsDisplayed(clientPageObject.btnAddNewClient);
        }
    }

    public async verifyCreateEditClientPage(): Promise<boolean> {
        if (device.isWeb()) {
            return await util.elementIsDisplayed(clientPageObject.txtCreateEditClientPageHeader);
        }
    }



    public async saveClient(): Promise<boolean> {
        await util.click(clientPageObject.btnSaveClient);
        return await util.elementIsDisplayed(clientPageObject.alertClientAdded);
        // const alertValue = await util.getValue(clientPageObject.alertClientAdded);
        // return (await alertValue!=null && alertValue.includes('Client Added!')) ? true : false; 
    }

    public async updateClientDetail(): Promise<boolean> {
        await util.click(clientPageObject.btnUpdateClient);
        return await util.elementIsDisplayed(clientPageObject.alertClientEdited);
    }

    public async searchClientInListingPage(): Promise<boolean> {
        console.log(`search for client ${globalMap.getField('client')}`);
        await util.setValue(clientPageObject.inputSearchClient, globalMap.getField('client'));
        await browser.pause(2000);
        let clientName = await util.getText(clientPageObject.txtFirstClientFromList);
        console.log(`client name: ${clientName}`);
        return (await clientName === globalMap.getField('client')) ? true : false;
    }

    public async navigateClientDetailPage(): Promise<boolean> {
        const clientName = await util.getText(clientPageObject.txtFirstClientFromList);
        if (await clientName === globalMap.getField('client')) {
            await util.click(clientPageObject.txtFirstClientFromList);
            if (util.elementIsDisplayed(clientPageObject.txtClientDetailHeading)) {
                return true;
            }
            else {
                console.log("Unable to navigate to the client detail page")
                return false;
            }
        } else {
            return false;
        }

    }

    public async validateClientDetailPage(): Promise<boolean> {
        return (await util.elementIsDisplayed(clientPageObject.txtClientDetailHeading)) ? true : false;
    }

    public async validateClientDetail(fieldName: string): Promise<boolean> {
        const fieldMap = {
            'name': { selector: clientPageObject.txtClientName, globalMapKey: 'client' },
            'domain': { selector: clientPageObject.txtDomain, globalMapKey: 'domain' },
            'country': { selector: clientPageObject.txtCountry, globalMapKey: 'country' },
            'city': { selector: clientPageObject.txtCity, globalMapKey: 'city' },
            'start date': { selector: clientPageObject.txtStartDate, globalMapKey: 'start date' },
            'first poc name': { selector: clientPageObject.txtFirstPocName, globalMapKey: 'first poc name' },
            'first poc email': { selector: clientPageObject.txtFirstPocEmail, globalMapKey: 'first poc email' },
            'first poc phone number': { selector: clientPageObject.txtFirstPocPhoneNumber, globalMapKey: 'first poc phone number' },
            'first poc designation': { selector: clientPageObject.txtFirstPocDesignation, globalMapKey: 'first poc designation' },
            'second poc name': { selector: clientPageObject.txtSecondPocName, globalMapKey: 'second poc name' },
            'second poc email': { selector: clientPageObject.txtSecondPocEmail, globalMapKey: 'second poc email' },
            'second poc phone number': { selector: clientPageObject.txtSecondPocPhoneNumber, globalMapKey: 'second poc phone number' },
            'second poc designation': { selector: clientPageObject.txtSecondPocDesignation, globalMapKey: 'second poc designation' },
            'account manager': { selector: clientPageObject.txtAccountManager, globalMapKey: 'account manager' },
            'remark': { selector: clientPageObject.txtRemark, globalMapKey: 'remark' },
        };

        const normalizedFieldName = fieldName.toLowerCase();

        if (!(normalizedFieldName in fieldMap)) {
            throw new Error(`Invalid field name: ${fieldName}`);
        }

        const { selector, globalMapKey } = fieldMap[normalizedFieldName];
        const actualValue = await util.getText(selector);
        const expectedValue = globalMap.getField(globalMapKey);

        // console.log(`${normalizedFieldName}: ${actualValue}`);

        // console.log(`${normalizedFieldName}:`);
        // console.log(`  Actual value: "${actualValue}"`);
        // console.log(`  Expected value: "${expectedValue}"`);
        // console.log(`  Global map key: "${globalMapKey}"`);

        if (expectedValue === undefined) {
            console.warn(`Warning: Expected value for ${normalizedFieldName} is undefined`);
            return false;
        }

        return actualValue === expectedValue;
    }
}

export default new clientPage();
