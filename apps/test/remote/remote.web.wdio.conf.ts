import type { Options } from '@wdio/types'
import { genericConfig } from '../wdio.conf'
import path from 'path'

export const config: Options.Testrunner = {
    ...genericConfig,
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    hostname: 'ondemand.eu-central-1.saucelabs.com',
    port: 443,
    baseUrl: '',
    region: 'eu',
    specs: [
        path.join(process.cwd(), '/src/test/features/*/loginTest.feature')
    ],
    exclude: [
        // 'path/to/excluded/files'
    ],
    maxInstances: 1,
    capabilities: [{
        maxInstances: 1,
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                '--no-sandbox',
                '--disable-infobars',
                //'--headless',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--start-maximized'
            ],
        },
        acceptInsecureCerts: true,
        browserVersion: 'latest',
        platformName: 'macOS 13',
        'sauce:options': {
            build: 'appium-build-JTMPI',
            name: 'DemoTest',
          }
    }],
    services: [['sauce', {
        sauceConnect: true,
        sauceConnectOpts: {
            // ...
        }
    }]]
}