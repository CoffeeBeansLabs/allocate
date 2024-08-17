import clientPage from "../../../main/pages/client.page";
import projectPage from "../../../main/pages/project.page";


export interface EnterTextInfo {
    method: (...args: any[]) => Promise<boolean>;
    context?: any;
    args?: any[];
}

export const enterTextMap: { [key: string]: EnterTextInfo } = {
    'client name': { method: clientPage.setClientName, context: clientPage },
    'client start date': { method: clientPage.setClientStartDate, context: clientPage },
    'first poc name': { method: clientPage.setPOCName, context: clientPage, args: ['first'] },
    'second poc name': { method: clientPage.setPOCName, context: clientPage, args: ['second'] },
    'first poc email': { method: clientPage.setPOCEmail, context: clientPage, args: ['first'] },
    'first poc phone number': { method: clientPage.setPOCPhoneNumber, context: clientPage, args: ['first'] },
    'first poc designation': { method: clientPage.setPOCDesignation, context: clientPage, args: ['first'] },
    'second poc email': { method: clientPage.setPOCEmail, context: clientPage, args: ['second'] },
    'second poc phone number': { method: clientPage.setPOCPhoneNumber, context: clientPage, args: ['second'] },
    'second poc designation': { method: clientPage.setPOCDesignation, context: clientPage, args: ['second'] },
    'remark': { method: clientPage.setRemark, context: clientPage },
    'project name': { method: projectPage.setProjectName, context: projectPage },
    'project start date': { method: projectPage.setProjectStartDate, context: projectPage },
    'project poc name': { method: projectPage.setPocDetail, context: projectPage, args: ['name'] },
    'project poc email': { method: projectPage.setPocDetail, context: projectPage, args: ['email'] },
    'project poc phone number': { method: projectPage.setPocDetail, context: projectPage, args: ['phone number'] },
    'project poc designation': { method: projectPage.setPocDetail, context: projectPage, args: ['designation'] },
    'project remark': { method: projectPage.setRemark, context: projectPage },
    // You can add methods from other classes like this:
    // 'some other field': { method: otherClass.someMethod, context: otherClass, args: ['arg1', 'arg2'] },
};