import { ChainablePromiseElement } from 'webdriverio';

/**
 * Containing specific selectors for a Login page
 */

class ClientPageObjects {
    /**
     * Client listing page
     */
    txtClientPageHeader: { web: string, android?: string, ios?: string } = {
        web: '//header[@class="row no-gutters _header_1lxff_5"]/h6'
    }
    btnAddNewClient: { web: string, android?: string, ios?: string } = {
        web: '//span[contains(text(),"Add New Client")]'
    }
    inputSearchClient: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="relative"]/child::input'
    }
    selectClientStatus: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="col-xl-2 ml-auto"]/descendant::button/div'
    }
    selectActiveStatus: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="col-xl-2 ml-auto"]/descendant::button/span[contains(text(),"Active")]'
    }
    selectDormatStatus: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="col-xl-2 ml-auto"]/descendant::button/span[contains(text(),"Dormant")]'
    }
    inputDateRange: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="relative"]/descendant::input[@class="_customInput_1jloy_6"]'
    }
    txtCreateEditClientPageHeader: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="_modalHeaderContent_1ympe_29"]/h6'
    }
    inputClientName: { web: string, android?: string, ios?: string } = {
        web: '//label[contains(text(),"Client Name *")]/following-sibling::input'
    }
    selectDomain: { web: string, android?: string, ios?: string } = {
        web: '//span[contains(text(),"Domain (Industry) *")]/following-sibling::div/child::div'
    }
    selectCountry: { web: string, android?: string, ios?: string } = {
        web: '//span[contains(text(),"Country *")]/following-sibling::div/child::div'
    }
    selectCity: { web: string, android?: string, ios?: string } = {
        web: '//span[contains(text(),"City *")]/following-sibling::div/child::div'
    }
    selectListValue: { web: string, android?: string, ios?: string } = {
        web: '//div[contains(@class,"customSelect__menu-list")]/div'
    }
    inputStartDate: { web: string, android?: string, ios?: string } = {
        web: '//label[contains(text(),"Start Date *")]/following-sibling::div/child::div/input'
    }
    btnSaveClient: { web: string, android?: string, ios?: string } = {
        web: '//button[contains(text(),"Add client")]'
    }
    btnUpdateClient: { web: string, android?: string, ios?: string } = {
        web: '//button[contains(text(),"Save changes")]'
    }
    alertClientAdded: { web: string, android?: string, ios?: string } = {
        web: '//*[text()="Client Added!"]'
    }
    alertClientEdited: { web: string, android?: string, ios?: string } = {
        web: '//*[text()="Client Edited!"]'
    }
    txtFirstClientFromList: { web: string, android?: string, ios?: string } = {
        web: '//tbody/tr[1]/td[1]/span'
    }
    inputFirstPocName: { web: string, android?: string, ios?: string } = {
        web: '(//label[text()="Name"])[1]/following-sibling::input'
    }
    inputFirstPocEmail: { web: string, android?: string, ios?: string } = {
        web: '(//label[text()="Email"])[1]/following-sibling::input'
    }
    inputFirstPocPhoneNumber: { web: string, android?: string, ios?: string } = {
        web: '(//label[text()="Phone Number"])[1]/following-sibling::input'
    }
    inputFirstPocDesignation: { web: string, android?: string, ios?: string } = {
        web: '(//label[text()="Designation"])[1]/following-sibling::input'
    }
    inputSecondPocName: { web: string, android?: string, ios?: string } = {
        web: '(//label[text()="Name"])[2]/following-sibling::input'
    }
    inputSecondPocEmail: { web: string, android?: string, ios?: string } = {
        web: '(//label[text()="Email"])[2]/following-sibling::input'
    }
    inputSecondPocPhoneNumber: { web: string, android?: string, ios?: string } = {
        web: '(//label[text()="Phone Number"])[2]/following-sibling::input'
    }
    inputSecondPocDesignation: { web: string, android?: string, ios?: string } = {
        web: '(//label[text()="Designation"])[2]/following-sibling::input'
    }
    selectAccountManager: { web: string, android?: string, ios?: string } = {
        web: '//span[contains(text(),"Account Manager")]/following-sibling::div/child::div'
    }
    inputRemark: { web: string, android?: string, ios?: string } = {
        web: '//label[text()="Remarks"]/following-sibling::textarea'
    }
    btnNextPage: { web: string, android?: string, ios?: string } = {
        web: '//button[@title="Next Page"]'
    }
    btnPreviousPage: { web: string, android?: string, ios?: string } = {
        web: '//button[@title="Previous Page"]'
    }
    /**
     * client list 
     */
    txtClientNamesList: { web: string, android?: string, ios?: string } = {
        web: '//tbody[@class="_tbody_1hif6_23"]/tr/td[1]/span'
    }
    txtClientCreationDateList: { web: string, android?: string, ios?: string } = {
        web: '//tbody[@class="_tbody_1hif6_23"]/tr/td[2]/span'
    }
    /**
    * Client detail page
    */
    txtClientDetailHeading: { web: string, android?: string, ios?: string } = {
        web: '#client-heading >span'
    }
    txtClientName: { web: string, android?: string, ios?: string } = {
        web: '#client-heading h1'
    }
    txtClientStatus: { web: string, android?: string, ios?: string } = {
        web: '#client-heading h1'
    }
    btnEdit: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Edit"]/parent::button'
    }
    txtDomain: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Domain"]/parent::div/following-sibling::div/span'
    }
    txtCity: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="City"]/parent::div/following-sibling::div/span'
    }
    txtCountry: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Country"]/parent::div/following-sibling::div/span'
    }
    txtStartDate: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Start Date"]/parent::div/following-sibling::div/span'
    }
    txtRemark: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Remarks"]/parent::div/following-sibling::div/span'
    }
    txtFirstPocName: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Name"])[1]/parent::div/following-sibling::div/span'
    }
    txtFirstPocEmail: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Email"])[1]/parent::div/following-sibling::div/span'
    }
    txtFirstPocPhoneNumber: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Phone Number"])[1]/parent::div/following-sibling::div/span'
    }
    txtFirstPocDesignation: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Designation"])[1]/parent::div/following-sibling::div/span'
    }
    txtSecondPocName: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Name"])[2]/parent::div/following-sibling::div/span'
    }
    txtSecondPocEmail: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Email"])[2]/parent::div/following-sibling::div/span'
    }
    txtSecondPocPhoneNumber: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Phone Number"])[2]/parent::div/following-sibling::div/span'
    }
    txtSecondPocDesignation: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Designation"])[2]/parent::div/following-sibling::div/span'
    }
    txtAccountManager: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Name"])[3]/parent::div/following-sibling::div/span'
    }
}

export default new ClientPageObjects();