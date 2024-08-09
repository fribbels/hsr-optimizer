import { expect, test } from '@playwright/test'
import { executeSimpleWgsl } from '../webgpuTestUtils'

test('Simple input/output test', async ({ page }) => {
  // Code in setup includes constants declarations, structs, functions, etc
  // Anything that needs to be defined outside the main function
  const setup = `
  `

  // Code in execute runs inside the main function, has results[] to work with and i as the global index
  const execute = `
    results[0] = 2;
  `

  const results = await executeSimpleWgsl(page, setup, execute)

  expect(results[0]).toEqual(2)
})

test('Math test', async ({ page }) => {
  const setup = `
  `

  const execute = /* wgsl */`
    results[0] = select(0, 1, 1 < 2);
    results[1] = select(0, 1, 1 > 2)
    results[2] = select(1, 0, 1 == 2);
  `

  const results = await executeSimpleWgsl(page, setup, execute)

  expect(results).toEqual([1, 0, 1])
})
