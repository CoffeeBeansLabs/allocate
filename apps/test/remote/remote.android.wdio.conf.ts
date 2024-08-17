import { Options } from '@wdio/types'
import { genericConfig } from '../wdio.conf';
import path from 'path'

const capabilities = {
    platformName: 'android',
    'appium:app': 'storage:filename=fireFly2004_latest.apk',
    'appium:deviceName': 'Android GoogleAPI Emulator',
    'appium:deviceOrientation': 'portrait',
    'appium:platformVersion': '12.0',
    'appium:automationName': 'UiAutomator2',
    'sauce:options': {
        build: 'appium-build-JTMPI',
        name: 'DemoMobileTest',
     },
   };

export const config: Options.Testrunner = {
    ...genericConfig,
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    hostname: 'ondemand.eu-central-1.saucelabs.com',
    port: 443,
    baseUrl: '',
    specs: [
        // ToDo: define location for spec files here
        path.join(process.cwd(), '/src/test/features/**/fireFly.feature')
    ],
    exclude: [
        // 'path/to/excluded/files'
    ],
    maxInstances: 1,
    capabilities: [capabilities],
    services: [['sauce', {
        sauceConnect: true,
        sauceConnectOpts: {
            // ...
        }
    }]]
}