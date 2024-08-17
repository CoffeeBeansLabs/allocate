import clientPage from "../../../main/pages/client.page";
import projectPage from "../../../main/pages/project.page";

export interface ClickInfo {
    method: () => Promise<boolean>;
    context: any;
}

export const clickMap: { [key: string]: ClickInfo } = {
    'add new client': { method: clientPage.navigateCreateClientForm, context: clientPage },
    'add client': { method: clientPage.saveClient, context: clientPage },
    'edit client': { method: clientPage.navigateEditClientForm, context: clientPage },
    'client name': { method: clientPage.navigateClientDetailPage, context: clientPage },
    'save changes': { method: clientPage.updateClientDetail, context: clientPage },
    'add new project': { method: projectPage.navigateCreateProjectForm, context: projectPage },
    'add project': { method: projectPage.saveProject, context: projectPage },
    'project name': { method: projectPage.navigateProjectDetailPage, context: projectPage },
    'edit project': { method: projectPage.navigateEditProjectForm, context: projectPage },
    'project save changes': { method: projectPage.updateProjectDetail, context: projectPage },
    // You can add methods from other classes like this:
    // 'some action object': { method: otherClass.someMethod, context: otherClass },
};