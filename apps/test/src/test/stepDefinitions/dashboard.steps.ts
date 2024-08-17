import { Given, When, Then } from '@wdio/cucumber-framework';
import dashboardPage from '../../main/pages/dashboard.page';
import util from '../../support/utils/utils'
import {expect} from 'chai';

Given(/^I am on the dashboard page$/, async () => {
    expect(await dashboardPage.dashboardPage()).to.be.true;
});
When(/^I logout from the application$/, async () => {
    expect(await dashboardPage.logout()).to.be.true;
});