// @vitest-environment jsdom
import { generateWgsl } from 'lib/gpu/injection/generateWgsl'
import {
  addE6S5Teammate,
} from 'lib/gpu/tests/webgpuTestGenerator'
import { generateTestRelics } from 'lib/gpu/tests/webgpuTestUtils'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { SortOption } from 'lib/optimization/sortOptions'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { Metadata } from 'lib/state/metadataInitializer'
import { normalizeForm } from 'lib/stores/optimizerForm/optimizerFormConversions'
import type { GpuConstants } from 'lib/gpu/webgpuTypes'
import {
  describe,
  expect,
  it,
} from 'vitest'

Metadata.initialize()

const DEBUG_GPU_CONSTANTS = {
  WORKGROUP_SIZE: 256,
  BLOCK_SIZE: 16_384,
  CYCLES_PER_INVOCATION: 256,
  RESULTS_LIMIT: 1_024,
  COMPACT_LIMIT: 4_096,
  DEBUG: true,
  TUPLE_MODE: false,
} satisfies GpuConstants

describe('WebGPU debug shader output', () => {
  it('matches the CPU last-default-action container and preserves every other register', () => {
    const request = normalizeForm(generateFullDefaultForm('1005b1', '23001', 6, 5))
    request.resultSort = SortOption.COMBO.key
    addE6S5Teammate(request, 0, '8008', '21051')
    addE6S5Teammate(request, 1, '1225', '23035')
    addE6S5Teammate(request, 2, '1309', '23026')

    const context = generateContext(request)
    const wgsl = generateWgsl(context, request, generateTestRelics(), DEBUG_GPU_CONSTANTS)
    const lastDefaultIndex = context.defaultActions.length - 1

    expect(lastDefaultIndex).toBeGreaterThan(0)
    expect(wgsl).toContain(`var debugContainer: array<f32, ${context.maxContainerArrayLength}> = container${lastDefaultIndex};`)
    expect(wgsl).toContain('debugEhp0Value')

    for (let i = 0; i < context.defaultActions.length + context.rotationActions.length; i++) {
      const registerCopy = `Copy action ${i} registers to debug container`
      if (i === lastDefaultIndex) {
        expect(wgsl).not.toContain(registerCopy)
      } else {
        expect(wgsl).toContain(registerCopy)
      }
    }
  })

  it('matches CPU last-recorded semantics for combo buff output', () => {
    const request = normalizeForm(generateFullDefaultForm('1313', '23000', 6, 5))
    request.resultSort = SortOption.COMBO_BUFF.key

    const context = generateContext(request)
    const wgsl = generateWgsl(context, request, generateTestRelics(), DEBUG_GPU_CONSTANTS)

    expect(wgsl).toContain('let defaultComboBuff = comboBuff;')
    expect(wgsl).toContain('comboBuff = defaultComboBuff;')
    expect(wgsl).toContain('*p_comboBuff = comboBuff;')
    expect(wgsl).not.toContain('*p_comboBuff += comboBuff;')
  })
})
