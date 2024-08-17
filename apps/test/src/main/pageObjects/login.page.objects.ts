import { ChainablePromiseElement } from 'webdriverio';

/**
 * Containing specific selectors for a Login page
 */

class LoginPageObjects{
    /**
     * define selectors using getter methods
     */
    btnGoogleLogin:{web:string, android?:string, ios?:string} = {
        web: '//span[contains(text(), "Sign in with Google")]'
    }
    btnUseAnotherAccount: {web:string, android?:string, ios?:string} = {
        web: '//*[contains(text(),"Use another account") or contains(text(),"Add account")]'
    }
    inputUsername:{web:string, android?:string, ios?:string} = {
        web: '#identifierId'
    }
    inputPassword:{web:string, android?:string, ios?:string} = {
        web: '//*[@autocomplete="current-password"]'
    }
    btnNext:{web:string, android?:string, ios?:string} = {
        web: '//*[contains(text(),"Next")]//parent::button'
    }
    btnContinue: {web:string, android?:string, ios?:string} = {
        web: '//*[contains(text(),"Continue")]//parent::button'
    }
    txtInvalidEmailError: {web:string, android?:string, ios?:string} = {
        web: '//*[contains(text(),"find your Google Account")]'
    }
    txtWrongPasswordError: {web:string, android?:string, ios?:string} = {
        web: '//*[contains(text(),"Wrong password")]'
    }
    txtwithoutEmailError: {web:string, android?:string, ios?:string} = {
        web: '//*[contains(text(),"Enter an email")]'
    }
    btnCreateAccount: {web:string, android?:string, ios?:string} = {
        web: '//span[@class="VfPpkd-vQzf8d" and text()="Create account"]'
    }
    btnAllow: {web:string, android?:string, ios?:string} = {
        web: '//*[text()="Allow"]//parent::button'
    }
    txtAllowPermission: {web:string, android?:string, ios?:string} = {
        web: '//*[contains(text(),"Associate you with your personal info on Google")]'
    }
}

export default new LoginPageObjects();
