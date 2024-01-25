# Playwright Testing

[Playwright](https://playwright.dev) enables full end-to-end functional testing of complex UIs.

### SETUP
#### VS Code Extension
Install VS Code extension - super useful to quickly generate and debug e2e tests.
https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright

#### Generating Tests with Playwright Extension
https://playwright.dev/docs/codegen#recording-a-test


### WRITING TESTS
Follow current convention of separating specs based on feature set.  This enables atomically testing functionality and separating concerns.

Tests should be written/codegen'd with the understanding that they will be executed using the test data ("Try it out!") to ensure consistency from release to release.

Ideally this should also minimize thrash as new features are implemented.

#### Executing Tests:
- `npm test` for full headless suite.
- `npm test:ui` to launch testing harness in Chromium.  Test can be run individually or as a suite.  Good for debug selectors, failing use-cases, etc.
- `npm test:report` will run the full suite headless and generate a shareable report.  Documents will be saved to `/playwright-report`