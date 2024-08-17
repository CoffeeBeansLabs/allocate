class ProjectPageObjects {
    /**
     * Project listing page
     */
    txtProjectPageHeader: { web: string, android?: string, ios?: string } = {
        web: '//header[@class="row _header_1ce15_5"]/h6'
    }
    btnAddNewProject: { web: string, android?: string, ios?: string } = {
        web: '//span[contains(text(),"Add New Project")]/parent::button'
    }
    inputSearchProject: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="relative"]/child::input'
    }
    selectStatus: { web: string, android?: string, ios?: string } = {
        web: '//*[@alt="filter icon"]/parent::button'
    }
    btnProjectAllStatus: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="_optionsContainer_195pc_34 show"]/descendant::span[text()="All Statuses"]'
    }
    btnProjectWarmStatus: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="_optionsContainer_195pc_34 show"]/descendant::span[text()="Warm"]'
    }
    btnProjectColdStatus: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="_optionsContainer_195pc_34 show"]/descendant::span[text()="Cold"]'
    }
    btnProjectHotStatus: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="_optionsContainer_195pc_34 show"]/descendant::span[text()="Hot"]'
    }
    btnProjectSignedStatus: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="_optionsContainer_195pc_34 show"]/descendant::span[text()="Signed"]'
    }
    btnProjectActiveStatus: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="_optionsContainer_195pc_34 show"]/descendant::span[text()="Active"]'
    }
    btnProjectClosedStatus: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="_optionsContainer_195pc_34 show"]/descendant::span[text()="Closed"]'
    }
    txtProjectNameList: { web: string, android?: string, ios?: string } = {
        web: '//table/tbody/tr/td[1]/span'
    }
    txtFirstProjectFromList: { web: string, android?: string, ios?: string } = {
        web: '//tbody/tr[1]/td[1]/span'
    }
    txtProjectStatusList: { web: string, android?: string, ios?: string } = {
        web: '//table/tbody/tr/td[3]/descendant::button[1]/descendant::span'
    }
    btnProjectTimeline: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Project Timeline"]/parent::button'
    }
    btnNextPage: { web: string, android?: string, ios?: string } = {
        web: '//button[@title="Next Page"]'
    }
    btnPreviousPage: { web: string, android?: string, ios?: string } = {
        web: '//button[@title="Previous Page"]'
    }
    alertProjectAdded: { web: string, android?: string, ios?: string } = {
        web: '//*[text()="Project Created!"]'
    }
    alertProjectEdited: { web: string, android?: string, ios?: string } = {
        web: '//*[text()="Project Edited!"]'
    }
    /**
     * Create and Update Project form
     */
    txtCreateEditProjectPageHeader: { web: string, android?: string, ios?: string } = {
        web: '//div[@class="_modalHeaderContent_1ympe_29"]/h6'
    }
    inputProjecttName: { web: string, android?: string, ios?: string } = {
        web: '//label[contains(text(),"Project Name *")]/following-sibling::input'
    }
    selectClient: { web: string, android?: string, ios?: string } = {
        web: '//span[contains(text(),"Client")]/following-sibling::div/child::div'
    }
    selectProjectStatus: { web: string, android?: string, ios?: string } = {
        web: '//span[contains(text(),"Project")]/following-sibling::div/child::div'
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
    inputEndDate: { web: string, android?: string, ios?: string } = {
        web: '//label[contains(text(),"End Date")]/following-sibling::div/child::div/input'
    }
    selectTypeOfEngagement: { web: string, android?: string, ios?: string } = {
        web: '//span[contains(text(),"Type Of Engagement")]/following-sibling::div/child::div'
    }
    selectCurrency: { web: string, android?: string, ios?: string } = {
        web: '//span[contains(text(),"Currency")]/following-sibling::div/child::div'
    }
    selectDeliveryMode: { web: string, android?: string, ios?: string } = {
        web: '//span[contains(text(),"Delivery Mode")]/following-sibling::div/child::div'
    }
    inputPocName: { web: string, android?: string, ios?: string } = {
        web: '(//label[text()="Name"])[1]/following-sibling::input'
    }
    inputPocEmail: { web: string, android?: string, ios?: string } = {
        web: '(//label[text()="Email"])[1]/following-sibling::input'
    }
    inputPocPhoneNumber: { web: string, android?: string, ios?: string } = {
        web: '(//label[text()="Phone Number"])[1]/following-sibling::input'
    }
    inputPocDesignation: { web: string, android?: string, ios?: string } = {
        web: '(//label[text()="Designation"])[1]/following-sibling::input'
    }
    selectAccountManager: { web: string, android?: string, ios?: string } = {
        web: '//span[contains(text(),"Account Manager")]/following-sibling::div/child::div[1]'
    }
    inputRemark: { web: string, android?: string, ios?: string } = {
        web: '//label[text()="Remarks"]/following-sibling::textarea'
    }
    btnSaveProject: { web: string, android?: string, ios?: string } = {
        web: '//button[contains(text(),"Add project")]'
    }
    btnUpdateProject: { web: string, android?: string, ios?: string } = {
        web: '//button[contains(text(),"Save changes")]'
    }
    /**
    * Client detail page
    */
    txtProjectDetailHeading: { web: string, android?: string, ios?: string } = {
        web: '//span[@id="project-heading"]'
    }
    txtProjectName: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Project Name"]/parent::div/following-sibling::div/span'
    }
    btnEdit: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Edit"]/parent::button'
    }
    txtClient: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Client"]/parent::div/following-sibling::div/span'
    }
    txtTypeOfEngagement: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Type of Engagement"]/parent::div/following-sibling::div/span'
    }
    txtCurrency: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Currency"]/parent::div/following-sibling::div/span'
    }
    txtCountry: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Country"]/parent::div/following-sibling::div/span'
    }
    txtCity: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="City"]/parent::div/following-sibling::div/span'
    }
    txtDeliveryMode: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Delivery Mode"]/parent::div/following-sibling::div/span'
    }
    txtStartDate: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Start Date"]/parent::div/following-sibling::div/span'
    }
    txtEndDate: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="End Date"]/parent::div/following-sibling::div/span'
    }
    txtRemark: { web: string, android?: string, ios?: string } = {
        web: '//span[text()="Remarks"]/parent::div/following-sibling::div/span'
    }
    txtPocName: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Name"])[1]/parent::div/following-sibling::div/span'
    }
    txtPocEmail: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Email"])[1]/parent::div/following-sibling::div/span'
    }
    txtPocPhoneNumber: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Phone Number"])[1]/parent::div/following-sibling::div/span'
    }
    txtPocDesignation: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Designation"])[1]/parent::div/following-sibling::div/span'
    }
    txtAccountManager: { web: string, android?: string, ios?: string } = {
        web: '(//span[text()="Name"])[2]/parent::div/following-sibling::div/span'
    }
}
export default new ProjectPageObjects();