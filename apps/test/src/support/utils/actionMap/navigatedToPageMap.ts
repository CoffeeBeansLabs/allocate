import clientPage from "../../../main/pages/client.page";
import loginPage from "../../../main/pages/login.page";
import projectPage from "../../../main/pages/project.page";


export interface PageNavigationInfo {
    method: (...args: any[]) => Promise<boolean>;
    context: any;
    args?: any[];
}

export const pageNavigationMap: { [key: string]: PageNavigationInfo } = {
    'dashboard page': { method: loginPage.validateSuccessfullLogin, context: loginPage },
    'client detail page': { method: clientPage.validateClientDetailPage, context: clientPage },
    'client page': { method: clientPage.verifyClientPage, context: clientPage },
    'create client form': { method: clientPage.verifyCreateEditClientPage, context: clientPage },
    'edit client form': { method: clientPage.verifyCreateEditClientPage, context: clientPage },
    'project page': { method: projectPage.verifyProjectPage, context: projectPage },
    'create project form': { method: projectPage.verifyCreateEditProjectPage, context: projectPage },
    'project detail page': { method: projectPage.validateProjectDetailPage, context: projectPage },
    'edit project form': { method: projectPage.verifyCreateEditProjectPage, context: projectPage },
};