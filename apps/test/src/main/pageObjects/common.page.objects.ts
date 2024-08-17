class CommonPageObjects {
    selectListValue: { web: string, android?: string, ios?: string } = {
        web: '//div[contains(@class,"customSelect__menu-list")]/div'
    }
}
export default new CommonPageObjects();