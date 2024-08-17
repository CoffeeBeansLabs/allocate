import { Given, When, Then } from '@wdio/cucumber-framework';
import loginPage from '../../main/pages/login.page';
import util from '../../support/utils/utils'
import { expect } from 'chai';

Given(/^I am on the login page$/, async () => {
    expect(await loginPage.open()).to.equal('Allocate | Staffing Tool');
});

When(/^I login with invalid credentials as username "([^"]*)?" and password "([^"]*)?"$/, async (username: string, password: string) => {
    expect(await loginPage.login(username, password)).to.be.false;
});

When(/^I login with valid credentials$/, async () => {
    expect(await loginPage.login()).to.be.true;
});

When(/^I login without crendentials$/, async () => {
    expect(await loginPage.loginWithoutCredentials()).to.be.true;
});
Then(/^I should not be able to login$/, async () => {
    expect(await loginPage.validateSuccessfullLogin()).to.be.false;
});
Then(/^I should be on the login page$/, async () => {
    expect(await loginPage.validateLoginPage()).to.be.true;
});
