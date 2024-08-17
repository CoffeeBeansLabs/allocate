import { ChainablePromiseElement } from 'webdriverio';

/**
 * Containing specific selectors for a Login page
 */

class DashboardPageObjects{
    /**
     * define selectors using getter methods
     */
    imgProfile:{web:string, android?:string, ios?:string} = {
        web: '(//div[@class="_profile_1yb9r_126"])[1]/img'
    }
    txtLogout:{web:string, android?:string, ios?:string} = {
        web: '//span[contains(text(),"Logout")]'
    }
    tabDashboard:{web:string, android?:string, ios?:string} = {
        web: '(//*[@class="_navList_1yb9r_15"])[1]/descendant::span[contains(text(),"Dashboard")]'
    }
    tabClients:{web:string, android?:string, ios?:string} = {
        web: '(//*[@class="_navList_1yb9r_15"])[1]/descendant::span[contains(text(),"Clients")]'
    }
    tabProjects:{web:string, android?:string, ios?:string} = {
        web: '(//*[@class="_navList_1yb9r_15"])[1]/descendant::span[contains(text(),"Projects")]'
    }
    tabPeople:{web:string, android?:string, ios?:string} = {
        web: '(//*[@class="_navList_1yb9r_15"])[1]/descendant::span[contains(text(),"People")]'
    }
    tabAssets:{web:string, android?:string, ios?:string} = {
        web: '(//*[@class="_navList_1yb9r_15"])[1]/descendant::span[contains(text(),"Assets")]'
    }
    tabQuickSearch:{web:string, android?:string, ios?:string} = {
        web: '(//*[@class="_navList_1yb9r_15"])[1]/descendant::span[contains(text(),"Quick Search")]'
    }
    txtDashboard:{web:string, android?:string, ios?:string} = {
        web: '(//*[@class="flex-col gap-30"])[1]/descendant::span[contains(text(),"Dashboard")]'
    }
    txtCurrentAllocation:{web:string, android?:string, ios?:string} = {
        web: '(//*[@class="flex-col gap-30"])[1]/descendant::span[contains(text(),"Current Allocation")]'
    }
    txtCafePotential:{web:string, android?:string, ios?:string} = {
        web: '(//*[@class="flex-col gap-30"])[1]/descendant::span[contains(text(),"Cafe and Potential")]'
    }
    txtPeople:{web:string, android?:string, ios?:string} = {
        web: '(//*[@class="flex-col gap-30"])[1]/descendant::span[contains(text(),"People")]'
    }
    txtClientAndProjects:{web:string, android?:string, ios?:string} = {
        web: '(//*[@class="flex-col gap-30"])[1]/descendant::span[contains(text(),"Client and Projects")]'
    }
    txtAssets:{web:string, android?:string, ios?:string} = {
        web: '(//*[@class="flex-col gap-30"])[1]/descendant::span[contains(text(),"Assets")]'
    }
    btnNext:{web:string, android?:string, ios?:string} = {
        web: '//span[text()="Next"]'
    }
    btnContinue: {web:string, android?:string, ios?:string} = {
        web: '//span[contains(text(), "Continue")]'
    }
    imgApplicationLogo: {web:string, android?:string, ios?:string} = {
        web: '(//*[@class="_navbar_1yb9r_1"]/descendant::img)[1]'
    }
}

export default new DashboardPageObjects();
