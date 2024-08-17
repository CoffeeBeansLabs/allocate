import type { Options } from '@wdio/types'
import { genericConfig } from '../wdio.conf'
import path from 'path'

export const config: Options.Testrunner = {
    ...genericConfig,
    specs: [
        path.join(process.cwd(), './src/test/features/**/*.feature')
    ],
    exclude: [
        // 'path/to/excluded/files'
    ],
    //maxInstances: 1,
    capabilities: [{
        maxInstances: 1,
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                '--no-sandbox',
                '--disable-infobars',
                '--headless',
                '--window-size=1920,1080',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--start-maximized',
                '--start-fullscreen',
                '--disable-extensions',
                '--ignore-certificate-errors',
                '--disable-notifications',
                '--disable-sync'
                //'user-data-dir=/root/.config/google-chrome'
            ]
        },
        acceptInsecureCerts: true
    }],
    baseUrl: '',
    services: ['chromedriver']
}