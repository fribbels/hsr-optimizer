# Playwright Testing

[Playwright](https://playwright.dev) enables full end-to-end functional testing of complex UIs.

### SETUP
#### VS Code Extension
Install VS Code extension - super useful to quickly generate and debug e2e tests.
https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright

#### Generating Tests Manually
Introduction and usage documentation:
- https://playwright.dev/docs/codegen-intro
- https://playwright.dev/docs/codegen#recording-a-test

`npm run test:generate` will start the code gen Chromium instance.
A floating tool palette enables a few common testing actions such as:
- asserting some text value is present in section of DOM
- asserting some element is visible in the DOM
- asserting a form control has a specific value

To be fair, codegen tests are coarse/blunt approaches, but for quickly getting a skeleton to hang real tests, it is very effective.

#### Your first codegen test
***IMPORTANT: to normalize the context of your test to match other tests, follow these steps at the beginning of every session:***
1. Click "Getting started"
2. Click the "Try it out!" button
3. Click "Yes" in the modal popup to load the test data

After you have finished your test codegen, remove the generated test steps that result from the above.  It will not render your tests invalid to leave them, but it will slow testing execution.  Those steps are executed as pre-run setup before the suite is run.

### WRITING TESTS

#### A few things to keep in mind when writing tests:
Follow current convention of separating specs based on feature set.  This enables atomically testing functionality and separating concerns.

Tests should be written/codegen'd with the understanding that they will be executed using the test data ("Try it out!") to ensure consistency from release to release.

Ideally this should also minimize thrash as new features are implemented.

#### Executing Tests:
- `npm test` for full headless suite.
- `npm test:ui` to launch testing harness in Chromium.  Test can be run individually or as a suite.  Good for debug selectors, failing use-cases, etc.
- `npm test:report` will run the full suite headless and generate a shareable report.  Documents will be saved to `/playwright-report`