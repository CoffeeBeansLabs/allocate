import clientPage from "../../../main/pages/client.page";
import projectPage from "../../../main/pages/project.page";


export interface FieldValidationInfo {
    method: (...args: any[]) => Promise<boolean>;
    context: any;
    args?: any[];
}

export const fieldValidationMap: { [key: string]: FieldValidationInfo } = {
    'client name': { method: clientPage.validateClientDetail, context: clientPage, args: ['name'] },
    'client domain': { method: clientPage.validateClientDetail, context: clientPage, args: ['domain'] },
    'client country': { method: clientPage.validateClientDetail, context: clientPage, args: ['country'] },
    'client city': { method: clientPage.validateClientDetail, context: clientPage, args: ['city'] },
    'client start date': { method: clientPage.validateClientDetail, context: clientPage, args: ['start date'] },
    'client remark': { method: clientPage.validateClientDetail, context: clientPage, args: ['remark'] },
    'client first poc name': { method: clientPage.validateClientDetail, context: clientPage, args: ['first POC name'] },
    'client first poc email': { method: clientPage.validateClientDetail, context: clientPage, args: ['first POC email'] },
    'client first poc phone number': { method: clientPage.validateClientDetail, context: clientPage, args: ['first POC phone number'] },
    'client first poc designation': { method: clientPage.validateClientDetail, context: clientPage, args: ['first POC designation'] },
    'client second poc name': { method: clientPage.validateClientDetail, context: clientPage, args: ['second POC name'] },
    'client second poc email': { method: clientPage.validateClientDetail, context: clientPage, args: ['second POC email'] },
    'client second poc phone number': { method: clientPage.validateClientDetail, context: clientPage, args: ['second POC phone number'] },
    'client second poc designation': { method: clientPage.validateClientDetail, context: clientPage, args: ['second POC designation'] },
    'client account manager': { method: clientPage.validateClientDetail, context: clientPage, args: ['account manager'] },
    'project name': { method: projectPage.validateProjectDetail, context: projectPage, args: ['name'] },
    'project country': { method: projectPage.validateProjectDetail, context: projectPage, args: ['country'] },
    'project city': { method: projectPage.validateProjectDetail, context: projectPage, args: ['city'] },
    'project start date': { method: projectPage.validateProjectDetail, context: projectPage, args: ['start date'] },
    'project poc name': { method: projectPage.validateProjectDetail, context: projectPage, args: ['project poc name'] },
    'project poc email': { method: projectPage.validateProjectDetail, context: projectPage, args: ['project poc email'] },
    'project poc phone number': { method: projectPage.validateProjectDetail, context: projectPage, args: ['project poc phone number'] },
    'project poc designation': { method: projectPage.validateProjectDetail, context: projectPage, args: ['project poc designation'] },
    'project account manager': { method: projectPage.validateProjectDetail, context: projectPage, args: ['project account manager'] },
    'project remark': { method: projectPage.validateProjectDetail, context: projectPage, args: ['project remark'] },

    // You can add methods from other classes like this:
    // 'some other field': { method: otherClass.someMethod, context: otherClass, args: ['arg1', 'arg2'] },
};