import { expect, test } from '@playwright/test'
import { executeSimpleWgsl } from '../webgpuTestUtils'

test('Simple input/output test', async ({ page }) => {
  // Setup includes constants declarations, structs, functions, etc
  // Anything that needs to be defined outside the main function
  const setup = `
  `

  // Execute runs inside the main function, has the results[] to work with and i as the global index
  const execute = `
    results[0] = 2;
  `

  const results = await executeSimpleWgsl(page, setup, execute)

  expect(results[0]).toEqual(2)
})

test('Step test', async ({ page }) => {
  const setup = `
  `

  const execute = `
    results[0] = step(2, 3);
    results[1] = step(4, 3);
    results[2] = step(3, 3);
  `

  const results = await executeSimpleWgsl(page, setup, execute)

  expect(results).toEqual([1, 0, 1])
})
