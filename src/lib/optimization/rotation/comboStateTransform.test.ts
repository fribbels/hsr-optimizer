// @vitest-environment jsdom
import { ConditionalDataType } from 'lib/constants/constants'
import { transformConditionals } from 'lib/optimization/rotation/comboStateTransform'
import { Metadata } from 'lib/state/metadataInitializer'
import type {
  ComboBooleanConditional,
  ComboNumberConditional,
  ComboSelectConditional,
} from 'lib/optimization/combo/comboTypes'
import {
  describe,
  expect,
  test,
} from 'vitest'

Metadata.initialize()

// ---------------------------------------------------------------------------
// B1: BUG-04 — BOOLEAN Out-of-Bounds
// ---------------------------------------------------------------------------
describe('B1: BUG-04 — BOOLEAN out-of-bounds', () => {
  test('B1a: BOOLEAN with activations length 5, accessing actionIndex 7 returns false', () => {
    const result = transformConditionals(7, {
      testKey: {
        type: ConditionalDataType.BOOLEAN,
        activations: [true, false, true, false, true],
      } satisfies ComboBooleanConditional,
    })
    // Currently fails — returns undefined because activations[7] is out of bounds
    expect(result.testKey).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// B2: BUG-05 — No Active Partition
// ---------------------------------------------------------------------------
describe('B2: BUG-05 — No active partition', () => {
  test('B2a: NUMBER with 2 partitions, neither active at actionIndex 3, returns first partition value', () => {
    const result = transformConditionals(3, {
      testKey: {
        type: ConditionalDataType.NUMBER,
        partitions: [
          { value: 5, activations: [true, true, true, false, false] },
          { value: 8, activations: [false, false, false, false, false] },
        ],
      } satisfies ComboNumberConditional,
    })
    // Currently fails — returns 0 because no partition has activations[3] === true
    expect(result.testKey).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// B3: Regression Tests (should pass now)
// ---------------------------------------------------------------------------
describe('B3: Regression tests', () => {
  test('B3a: BOOLEAN, activations[2] = true returns true', () => {
    const result = transformConditionals(2, {
      testKey: {
        type: ConditionalDataType.BOOLEAN,
        activations: [false, false, true, false],
      } satisfies ComboBooleanConditional,
    })
    expect(result.testKey).toBe(true)
  })

  test('B3b: BOOLEAN, activations[2] = false returns false', () => {
    const result = transformConditionals(2, {
      testKey: {
        type: ConditionalDataType.BOOLEAN,
        activations: [true, true, false, true],
      } satisfies ComboBooleanConditional,
    })
    expect(result.testKey).toBe(false)
  })

  test('B3c: NUMBER, partition 1 has activations[2] = true with value 5 returns 5', () => {
    const result = transformConditionals(2, {
      testKey: {
        type: ConditionalDataType.NUMBER,
        partitions: [
          { value: 0, activations: [true, true, false, true] },
          { value: 5, activations: [false, false, true, false] },
        ],
      } satisfies ComboNumberConditional,
    })
    expect(result.testKey).toBe(5)
  })

  test('B3d: SELECT, partition 0 has activations[1] = true with value 3 returns 3', () => {
    const result = transformConditionals(1, {
      testKey: {
        type: ConditionalDataType.SELECT,
        partitions: [
          { value: 3, activations: [false, true, false] },
          { value: 7, activations: [false, false, false] },
        ],
      } satisfies ComboSelectConditional,
    })
    expect(result.testKey).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// B4: transformConditionals multi-key (should pass now)
// ---------------------------------------------------------------------------
describe('B4: transformConditionals multi-key', () => {
  test('B4a: ComboConditionals map with 2 BOOLEAN + 1 NUMBER returns correct value map', () => {
    const result = transformConditionals(1, {
      boolA: {
        type: ConditionalDataType.BOOLEAN,
        activations: [false, true, false],
      } satisfies ComboBooleanConditional,
      boolB: {
        type: ConditionalDataType.BOOLEAN,
        activations: [true, false, true],
      } satisfies ComboBooleanConditional,
      numC: {
        type: ConditionalDataType.NUMBER,
        partitions: [
          { value: 0, activations: [true, false, true] },
          { value: 10, activations: [false, true, false] },
        ],
      } satisfies ComboNumberConditional,
    })

    expect(result.boolA).toBe(true)
    expect(result.boolB).toBe(false)
    expect(result.numC).toBe(10)
  })
})
