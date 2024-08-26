import { test } from '@playwright/test'
import { Constants } from 'lib/constants'
import { generateWgsl } from 'lib/gpu/injection/generateWgsl'

test('Test GPU', async ({ page }) => {
  await page.goto('/#scorer')

  console.log(generateWgsl(1212))
  
  console.log('x')
})

test('Test GPU 2', async ({ page }) => {

  const request = Constants.MAX_INT
  await page.goto('chrome://gpu')
})
