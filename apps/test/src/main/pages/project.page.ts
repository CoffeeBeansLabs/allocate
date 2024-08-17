
import projectPageObject from '../pageObjects/project.page.objects';
import dashboardPageObject from '../pageObjects/dashboard.page.objects';
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

    public async navigateProjectPage(): Promise<boolean> {
        if (device.isWeb()) {
            await util.click(dashboardPageObject.tabProjects);
            return await util.elementIsDisplayed(projectPageObject.btnAddNewProject);
        }
    }
    public async verifyProjectPage(): Promise<boolean> {
        if (device.isWeb()) {
            return await util.elementIsDisplayed(projectPageObject.btnAddNewProject);
        }
    }
    public async navigateCreateProjectForm(): Promise<boolean> {
        if (device.isWeb()) {
            await util.click(projectPageObject.btnAddNewProject);
            return await this.verifyCreateEditProjectPage();
        }
    }
    public async verifyCreateEditProjectPage(): Promise<boolean> {
        if (device.isWeb()) {
            return await util.elementIsDisplayed(projectPageObject.txtCreateEditProjectPageHeader);
        }
    }
    public async setProjectName(): Promise<boolean> {
        if (device.isWeb()) {
            let projectName = await faker.generateProject();
            globalMap.addField('project', projectName);
            await util.setValue(projectPageObject.inputProjecttName, projectName);
            let value = await util.getValue(projectPageObject.inputProjecttName);
            if (projectName === value) {
                return true
            } else {
                throw new Error(`Failed to set project Name correctly`);
            }
        }
    }
    public async setProjectStartDate(): Promise<boolean> {
        if (device.isWeb()) {
            //let startDate = await faker.generateDate();
            const selector = projectPageObject.inputStartDate;
            await util.click(selector);
            //await util.setValue(clientPageObject.inputStartDate, startDate);
            let startDate = await util.getValue(selector);
            globalMap.addField('start date', startDate);
            if (startDate !== undefined) {
                return true
            }
        }
    }
    public async saveProject(): Promise<boolean> {
        await util.click(projectPageObject.btnSaveProject);
        return await util.elementIsDisplayed(projectPageObject.alertProjectAdded);
        // const alertValue = await util.getValue(clientPageObject.alertClientAdded);
        // return (await alertValue!=null && alertValue.includes('Client Added!')) ? true : false; 
    }
    public async searchProjectInListingPage(): Promise<boolean> {
        const searchedProjectName = globalMap.getField('project');
        await util.setValue(projectPageObject.inputSearchProject, searchedProjectName);
        await browser.pause(2000);
        let projectName = await util.getText(projectPageObject.txtFirstProjectFromList);
        console.log(`project name: ${projectName}`);
        return (await projectName === searchedProjectName) ? true : false;
    }
    public async navigateProjectDetailPage(): Promise<boolean> {
        const projectName = await util.getText(projectPageObject.txtFirstProjectFromList);
        if (await projectName === globalMap.getField('project')) {
            await util.click(projectPageObject.txtFirstProjectFromList);
            if (util.elementIsDisplayed(projectPageObject.txtProjectDetailHeading)) {
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
    public async validateProjectDetailPage(): Promise<boolean> {
        return (await util.elementIsDisplayed(projectPageObject.txtProjectDetailHeading)) ? true : false;
    }
    public async validateProjectDetail(fieldName: string): Promise<boolean> {
        const fieldMap = {
            'name': { selector: projectPageObject.txtProjectName, globalMapKey: 'project' },
            'country': { selector: projectPageObject.txtCountry, globalMapKey: 'country' },
            'city': { selector: projectPageObject.txtCity, globalMapKey: 'city' },
            'start date': { selector: projectPageObject.txtStartDate, globalMapKey: 'start date' },
            'project poc name': { selector: projectPageObject.txtPocName, globalMapKey: 'project poc name' },
            'project poc email': { selector: projectPageObject.txtPocEmail, globalMapKey: 'project poc email' },
            'project poc phone number': { selector: projectPageObject.txtPocPhoneNumber, globalMapKey: 'project poc phone number' },
            'project poc designation': { selector: projectPageObject.txtPocDesignation, globalMapKey: 'project poc designation' },
            'project account manager': { selector: projectPageObject.txtAccountManager, globalMapKey: 'project account manager' },
            'project remark': { selector: projectPageObject.txtRemark, globalMapKey: 'project remark' },
        };

        const normalizedFieldName = fieldName.toLowerCase();

        if (!(normalizedFieldName in fieldMap)) {
            throw new Error(`Invalid field name: ${fieldName}`);
        }

        const { selector, globalMapKey } = fieldMap[normalizedFieldName];
        const actualValue = await util.getText(selector);
        const expectedValue = globalMap.getField(globalMapKey);

        if (expectedValue === undefined) {
            console.warn(`Warning: Expected value for ${normalizedFieldName} is undefined`);
            return false;
        }

        return actualValue === expectedValue;
    }
    public async navigateEditProjectForm(): Promise<boolean> {
        if (device.isWeb()) {
            await util.click(projectPageObject.btnEdit);
            return await this.verifyCreateEditClientPage();
        }
    }
    public async verifyCreateEditClientPage(): Promise<boolean> {
        if (device.isWeb()) {
            return await util.elementIsDisplayed(projectPageObject.txtCreateEditProjectPageHeader);
        }
    }
    public async setPocDetail(field: string): Promise<boolean> {
        let pocSelector = null;
        try {
            if (device.isWeb()) {
                if (field.toLowerCase() === 'name') {
                    pocSelector = projectPageObject.inputPocName;

                    let pocName = await faker.generateName();
                    console.log(`project POC name: ${pocName}`)
                    globalMap.addField('project poc name', pocName);
                    await util.setValue(pocSelector, pocName);
                    let value = await util.getValue(pocSelector);
                    if (value !== pocName) {
                        throw new Error(`Failed to set project POC Name correctly`);
                    }
                    return true;
                }
                else if (field.toLowerCase() === 'email') {
                    pocSelector = projectPageObject.inputPocEmail;

                    let pocEmail = await faker.generateEmail();
                    console.log(`project POC ${field}: ${pocEmail}`)
                    globalMap.addField('project poc email', pocEmail);
                    await util.setValue(pocSelector, pocEmail);
                    let value = await util.getValue(pocSelector);
                    if (value !== pocEmail) {
                        throw new Error(`Failed to set project POC ${field} correctly`);
                    }
                    return true;
                }
                else if (field.toLowerCase() === 'phone number') {
                    pocSelector = projectPageObject.inputPocPhoneNumber;

                    let pocPhoneNumber = await faker.generatePhoneNumber();
                    console.log(`project POC ${field}: ${pocPhoneNumber}`)
                    globalMap.addField('project poc phone number', pocPhoneNumber);
                    await util.setValue(pocSelector, pocPhoneNumber);
                    let value = await util.getValue(pocSelector);
                    if (value !== pocPhoneNumber) {
                        throw new Error(`Failed to set project POC ${field} correctly`);
                    }
                    return true;
                }
                else if (field.toLowerCase() === 'designation') {
                    pocSelector = projectPageObject.inputPocDesignation;

                    let pocDesignation = 'Project Manager';
                    console.log(`project POC ${field}: ${pocDesignation}`)
                    globalMap.addField('project poc designation', pocDesignation);
                    await util.setValue(pocSelector, pocDesignation);
                    let value = await util.getValue(pocSelector);
                    if (value !== pocDesignation) {
                        throw new Error(`Failed to set project POC ${field} correctly`);
                    }
                    return true;
                }
            }
        } catch (error) {
            console.error(`Error setting POC ${field}:`, error);
            return false;  // Return false if there was an error
        }
    }
    public async setRemark(): Promise<boolean> {
        const remark: string = 'This project is created as part of testing'
        try {
            const remarkSelector = projectPageObject.inputRemark;
            if (device.isWeb()) {
                console.log(`project remark: ${remark}`)
                globalMap.addField('project remark', remark);
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
    public async updateProjectDetail(): Promise<boolean> {
        await util.click(projectPageObject.btnUpdateProject);
        return await util.elementIsDisplayed(projectPageObject.alertProjectEdited);
    }

}

export default new clientPage();
