## Unit tests

Since we need a browser environment to run WebGPU, tests are run in headless Chromium on Playwright.
These work by injecting the test scripts into the browser console, creating/running the kernel there, and inspecting the results.

Run with `npm run test:webgpu`

## Conditionals

```wgsl
const conditionals: array<fn(f32, f32) -> f32, 4> = array<fn(f32, f32) -> f32, 4>(
...
);

```