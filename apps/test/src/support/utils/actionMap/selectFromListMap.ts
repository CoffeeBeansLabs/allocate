import page from '../../../main/pages/common.page';

export interface SelectActionInfo {
    method: (fieldName: string, value: string) => Promise<boolean>;
    context: any;
}

export const selectActionMap: { [key: string]: SelectActionInfo } = {
    'domain': { method: page.selectFieldValue, context: page },
    'country': { method: page.selectFieldValue, context: page },
    'city': { method: page.selectFieldValue, context: page },
    'account manager': { method: page.selectFieldValue, context: page },
    'client': { method: page.selectFieldValue, context: page },
    'project status': { method: page.selectFieldValue, context: page },
    'type of engagement': { method: page.selectFieldValue, context: page },
    'currency': { method: page.selectFieldValue, context: page },
    'delivery mode': { method: page.selectFieldValue, context: page },
    'project account manager': { method: page.selectFieldValue, context: page },
};