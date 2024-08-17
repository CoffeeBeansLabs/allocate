import { After, Before} from "@wdio/cucumber-framework";


Before(function (scenario) {
    console.log('\n' + '='.repeat(80));
    console.log(`🥒 Starting scenario: ${scenario.pickle.name}`);
    console.log('='.repeat(80));
});

After(function (this: WebdriverIO.Browser, scenario: any) {
    const result = scenario.result?.status;
    const icon = result === 'PASSED' ? '✅' : '❌';
    console.log('\n' + '-'.repeat(80));
    console.log(`${icon} Scenario finished: ${scenario.pickle.name}`);
    console.log(`Status: ${result}`);
    console.log('-'.repeat(80) + '\n');
});