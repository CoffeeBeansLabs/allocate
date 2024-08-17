import { Given, When, Then } from '@wdio/cucumber-framework';
import Device from '../../support/library/device';
import clientPage from '../../main/pages/client.page';
import { expect } from 'chai';
import dashboardPage from '../../main/pages/dashboard.page';
import projectPage from '../../main/pages/project.page';
import { clickMap } from '../../support/utils/actionMap/clickMap'
import { enterTextMap } from '../../support/utils/actionMap/enterTextMap'
import { fieldValidationMap } from '../../support/utils/actionMap/validateFieldTextMap'
import { pageNavigationMap } from '../../support/utils/actionMap/navigatedToPageMap'
import { selectActionMap } from '../../support/utils/actionMap/selectFromListMap'

/**
 * setting device type
 */
Given(/^Set the device type as "([^"]*)?"$/, async (deviceType: string) => {
    console.log(`Device type is ${deviceType}`);
    await Device.setDevice(deviceType);
});
/**
 * Click action
 */
When(/^I click on the (\w+) (?:for )?(.+?)(?: button)?$/i, async (action: string, object: string) => {

    const key = `${action.toLowerCase()} ${object.toLowerCase()}`.trim();
    const clickInfo = clickMap[key];

    if (clickInfo) {
        const { method, context } = clickInfo;
        expect(await method.call(context)).to.be.true;
    } else {
        throw new Error(`No action defined for clicking "${action} ${object}"`);
    }
});
/**
 * Enter text to the textbox
 */
When(/^I enter the (.+)$/, async (field: string) => {

    const actionInfo = enterTextMap[field.toLowerCase()];

    if (actionInfo) {
        const { method, context, args = [] } = actionInfo;
        expect(await method.call(context, ...args)).to.be.true;
    } else {
        throw new Error(`No action defined for entering "${field}"`);
    }
});
/**
 * To validate element text
 */
When(/^I validate (.+)$/, async (field: string) => {

    const validationInfo = fieldValidationMap[field.toLowerCase()];

    if (validationInfo) {
        const { method, context, args = [] } = validationInfo;
        expect(await method.call(context, ...args)).to.be.true;
    } else {
        throw new Error(`No action defined for validating "${field}"`);
    }
});
/**
 * TO validate page navigation
 */
Then(/^I should be navigated to the (.+)$/, async (object: string) => {

    const actionInfo = pageNavigationMap[object.toLowerCase()];

    if (actionInfo) {
        const { method, context, args = [] } = actionInfo;
        expect(await method.call(context, ...args)).to.be.true;
    } else {
        throw new Error(`No action defined for navigating to "${object} detail page"`);
    }
});
/**
 * Navigate to the page
 */
When(/^I navigate to the (.+)$/, async (object: string) => {
    interface ActionInfo {
        method: (...args: any[]) => Promise<boolean>;
        context: any;
        args?: any[];
    }

    const actionMap: { [key: string]: ActionInfo } = {
        'client page': {
            method: dashboardPage.navigateClientPage,
            context: dashboardPage
        },
        'project page': {
            method: dashboardPage.navigateProjectPage,
            context: dashboardPage
        }
    };

    const actionInfo = actionMap[object.toLowerCase()];

    if (actionInfo) {
        const { method, context, args = [] } = actionInfo;
        expect(await method.call(context, ...args)).to.be.true;
    } else {
        throw new Error(`No action defined for navigating to "${object}"`);
    }
});
/**
 * select from dropdown
 */
When(/^I select the (.+?) as \"([^\"]*)\"$/, async (fieldName: string, value: string) => {

    const actionInfo = selectActionMap[fieldName.toLowerCase()];

    if (actionInfo) {
        const { method, context } = actionInfo;
        expect(await method.call(context, fieldName, value)).to.be.true;
    } else {
        throw new Error(`No action defined for selecting "${fieldName}"`);
    }
});
/**
 * will support the step <string> should be <string> successfully
 */
Then(/^(.+?) should be (.+?) successfully$/, async (object: string, action: string) => {
    interface ActionInfo {
        method: (...args: any[]) => Promise<boolean>;
        context: any;
        args?: any[];
    }

    const actionMap: { [key: string]: ActionInfo } = {
        'client added': { method: clientPage.searchClientInListingPage, context: clientPage },
        'project added': { method: projectPage.searchProjectInListingPage, context: projectPage }
    };

    const key = `${object} ${action}`;
    const actionInfo = actionMap[key.toLowerCase()];

    if (actionInfo) {
        const { method, context, args = [] } = actionInfo;
        expect(await method.call(context, ...args)).to.be.true;
    } else {
        throw new Error(`No action defined for verifying "${object} ${action}"`);
    }
});