import type { Options } from '@wdio/types'
import path from 'path'
import { genericConfig } from '../wdio.conf';

export const config: Options.Testrunner = {
    ...genericConfig,
    specs: [
        path.join(process.cwd(), '/src/test/features/**/saucelabsLogin.feature')
    ],
     exclude: [
        // 'path/to/excluded/files'
    ],
    maxInstances: 1,
    capabilities: [{
        'appium:platformName': "iOS",
        'appium:deviceName': "iPhone 14 Pro Max",
        'appium:platformVersion': "16.4",
        'appium:automationName': "XCUITest",
        'appium:app': path.join(process.cwd(), 'src/support/app/MyRNDemoApp.app')
    }],
    services: ['appium']
}