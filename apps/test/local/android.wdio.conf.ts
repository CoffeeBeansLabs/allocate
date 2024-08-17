import { Options } from '@wdio/types'
import path from 'path'
import { genericConfig } from '../wdio.conf';

export const config: Options.Testrunner = {
    ...genericConfig,
    specs: [
        path.join(process.cwd(), '/src/test/features/**/fireFly.feature')
    ],
    exclude: [
        // 'path/to/excluded/files'
    ],
    maxInstances: 1,
    capabilities: [{
        'appium:platformName': 'android',
        'appium:deviceName': 'Pixel 4',
        'appium:platformVersion': '11.0',
        'appium:automationName': 'UiAutomator2',
        'appium:app': path.join(process.cwd(), '/src/support/app/fireFly2004_latest.apk'),
        'appium:appPackage': 'com.fireflyapp',
        'appium:appActivity': 'com.fireflyapp.MainActivity',
    }],
    services: ['appium']
}