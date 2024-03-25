// I'm honestly a bit troubled how to reliably test web workers...
import '@vitest/web-worker'
import { optimize } from 'lib/optimizer/new/optimizer'
import { describe, expect, test } from 'vitest'
import { request } from './jingliuSetup'
import { OptimizationRequest } from 'lib/optimizer/new/optimizationRequest'

// TODO: refactor tests into proper test suites
describe('Jingliu test suite', () => {
  // Because vitest emulate workers in single thread, despite the test passing
  // every fucking manual test scenario I could imagined in a real browser, I
  // can't seem to get the test passed with vitest with higher than 1 worker. It
  // seems only the first worker is actually created.
  test('should also work with web workers', async () => {
    const options: OptimizationRequest['options'] = {
      workerSize: 1,
    }
    request.options = options
    const builds = await optimize(request, true)

    expect(10).toEqual(builds.builds.length)
  })
})
