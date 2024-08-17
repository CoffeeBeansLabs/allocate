import type { Options } from '@wdio/types'
import device from './src/support/library/device'
import allure from '@wdio/allure-reporter';
import fs from 'fs-extra';
import path from 'path';

export const genericConfig: Options.Testrunner = {
    runner: 'local',
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            project: './tsconfig.json',
            transpileOnly: true
        }
    },
    port: 4723,
    capabilities: [],
    logLevel: 'error',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 150000,
    connectionRetryCount: 1,
    framework: 'cucumber',
    reporters: ['spec',
        ['allure', {
            outputDir: 'allure-results',
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: false,
            useCucumberStepReporter: true
        }],
        // ['video', {
        //     saveAllVideos: false,      // If true, all videos will be saved, not just failures
        //     videoRenderTimeout: 60,
        //     videoSlowdownMultiplier: 3, // Higher to get slower videos, lower for faster videos [Value 1-100]
        //     outputDir: './videos'
        // }]
    ],
    cucumberOpts: {
        // <string[]> (file/dir) require files before executing features
        require: ['./build/src/test/stepDefinitions/**/*.js', './build/src/support/hooks/hooks.js'],
        // <boolean> show full backtrace for errors
        backtrace: false,
        // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
        requireModule: [],
        // <boolean> invoke formatters without executing steps
        dryRun: false,
        // <boolean> abort the run on first failure
        failFast: false,
        // <boolean> hide step definition snippets for pending steps
        snippets: true,
        // <boolean> hide source uris
        source: true,
        // <boolean> fail if there are any undefined or pending steps
        strict: false,
        // <string> (expression) only execute the features or scenarios with tags matching the expression
        tagExpression: process.env.TAG_EXPRESSION,
        // <number> timeout for step definitions
        timeout: 60000,
        // <boolean> Enable this config to treat undefined definitions as warnings.
        ignoreUndefinedDefinitions: false
    },
    // =====
    // Hooks
    // =====
    /**
     * Gets executed before test execution begins. At this point you can access to all global
     * variables like `browser`. It is the perfect place to define custom commands.
     * @param {Array.<Object>} capabilities list of capabilities details
     * @param {Array.<String>} specs        List of spec file paths that are to be run
     * @param {object}         browser      instance of created browser/device session
     */
    before: function (capabilities, specs) {
        const deviceType = browser.capabilities['platformName'].toLowerCase();
        if (deviceType === 'android' || deviceType === 'ios') {
            device.setDevice(deviceType);
        }
        else {
            device.setDevice('web');
        }
        // Ensure the screenshots directory exists
        fs.ensureDirSync(path.resolve('./screenshots'));
    },
    /**
     *
     * Runs after a Cucumber Step.
     * @param {Pickle.IPickleStep} step             step data
     * @param {IPickle}            scenario         scenario pickle
     * @param {object}             result           results object containing scenario results
     * @param {boolean}            result.passed    true if scenario has passed
     * @param {string}             result.error     error stack if scenario failed
     * @param {number}             result.duration  duration of scenario in milliseconds
     * @param {object}             context          Cucumber World object
     */
    afterStep: async function (step, scenario, { error, duration, passed }, context) {
        await browser.takeScreenshot();
        // if (!passed) {
        //   await browser.takeScreenshot();
        // }
    }
}