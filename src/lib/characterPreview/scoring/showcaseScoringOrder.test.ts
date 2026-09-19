import {
  buildShowcaseScoringOptions,
  resolveRequestedShowcaseScoringType,
  resolveShowcaseScoringOrder,
  resolveShowcaseScoringType,
} from 'lib/characterPreview/scoring/showcaseScoringOrder'
import { ScoringType } from 'lib/scoring/scoringConfig'
import { ScoringConfigType } from 'types/metadata'
import {
  describe,
  expect,
  test,
} from 'vitest'

const ALL_SIMULATIONS = {
  [ScoringConfigType.DPS]: {},
  [ScoringConfigType.BUFFER]: {},
  [ScoringConfigType.HEAL]: {},
  [ScoringConfigType.SHIELD]: {},
}

describe('resolveShowcaseScoringOrder', () => {
  test('preserves the default canonical order when no prefix is configured', () => {
    expect(resolveShowcaseScoringOrder(undefined, ALL_SIMULATIONS)).toEqual([
      ScoringType.DPS_SCORE,
      ScoringType.BUFFER_SCORE,
      ScoringType.HEAL_SCORE,
      ScoringType.SHIELD_SCORE,
      ScoringType.SUBSTAT_SCORE,
      ScoringType.NONE,
    ])
  })

  test('puts support first and appends omitted modes canonically', () => {
    expect(resolveShowcaseScoringOrder([ScoringType.BUFFER_SCORE], ALL_SIMULATIONS)).toEqual([
      ScoringType.BUFFER_SCORE,
      ScoringType.DPS_SCORE,
      ScoringType.HEAL_SCORE,
      ScoringType.SHIELD_SCORE,
      ScoringType.SUBSTAT_SCORE,
      ScoringType.NONE,
    ])
  })

  test('allows substat scoring to be first', () => {
    expect(resolveShowcaseScoringOrder([ScoringType.SUBSTAT_SCORE], ALL_SIMULATIONS)).toEqual([
      ScoringType.SUBSTAT_SCORE,
      ScoringType.DPS_SCORE,
      ScoringType.BUFFER_SCORE,
      ScoringType.HEAL_SCORE,
      ScoringType.SHIELD_SCORE,
      ScoringType.NONE,
    ])
  })

  test('preserves full custom positions', () => {
    const configuredOrder = [
      ScoringType.NONE,
      ScoringType.HEAL_SCORE,
      ScoringType.SUBSTAT_SCORE,
      ScoringType.DPS_SCORE,
      ScoringType.SHIELD_SCORE,
      ScoringType.BUFFER_SCORE,
    ]

    expect(resolveShowcaseScoringOrder(configuredOrder, ALL_SIMULATIONS)).toEqual(configuredOrder)
  })

  test('deduplicates configured values', () => {
    expect(resolveShowcaseScoringOrder([
      ScoringType.BUFFER_SCORE,
      ScoringType.BUFFER_SCORE,
      ScoringType.SUBSTAT_SCORE,
      ScoringType.SUBSTAT_SCORE,
    ], ALL_SIMULATIONS)).toEqual([
      ScoringType.BUFFER_SCORE,
      ScoringType.SUBSTAT_SCORE,
      ScoringType.DPS_SCORE,
      ScoringType.HEAL_SCORE,
      ScoringType.SHIELD_SCORE,
      ScoringType.NONE,
    ])
  })

  test('ignores unavailable simulations and invalid runtime values without hiding omitted modes', () => {
    const runtimePrefix: readonly unknown[] = [
      ScoringType.SHIELD_SCORE,
      ScoringType.BUFFER_SCORE,
      999,
      'dps',
      ScoringType.NONE,
    ]

    expect(resolveShowcaseScoringOrder(runtimePrefix, {
      [ScoringConfigType.DPS]: {},
      [ScoringConfigType.BUFFER]: {},
    })).toEqual([
      ScoringType.BUFFER_SCORE,
      ScoringType.NONE,
      ScoringType.DPS_SCORE,
      ScoringType.SUBSTAT_SCORE,
    ])
  })
})

describe('resolveShowcaseScoringType', () => {
  const SUPPORT_FIRST_ORDER = [
    ScoringType.BUFFER_SCORE,
    ScoringType.DPS_SCORE,
    ScoringType.SUBSTAT_SCORE,
    ScoringType.NONE,
  ]

  test('retains a valid explicit selection even when it is not first', () => {
    expect(resolveShowcaseScoringType(ScoringType.DPS_SCORE, SUPPORT_FIRST_ORDER)).toBe(ScoringType.DPS_SCORE)
  })

  test('uses the first ordered fallback for an unavailable selection', () => {
    expect(resolveShowcaseScoringType(ScoringType.HEAL_SCORE, SUPPORT_FIRST_ORDER)).toBe(ScoringType.BUFFER_SCORE)
  })
})

describe('requested scoring mode precedence', () => {
  test.each([
    {
      name: 'forceDebug wins over every explicit source',
      input: {
        forceDebug: true,
        injectedScoringType: ScoringType.BUFFER_SCORE,
        buildScoringType: ScoringType.HEAL_SCORE,
        storedScoringType: ScoringType.DPS_SCORE,
      },
      expected: ScoringType.SUBSTAT_SCORE,
    },
    {
      name: 'injected scoring wins over build and persisted selections',
      input: {
        forceDebug: false,
        injectedScoringType: ScoringType.BUFFER_SCORE,
        buildScoringType: ScoringType.HEAL_SCORE,
        storedScoringType: ScoringType.DPS_SCORE,
      },
      expected: ScoringType.BUFFER_SCORE,
    },
    {
      name: 'build scoring wins over the persisted selection',
      input: {
        forceDebug: false,
        injectedScoringType: undefined,
        buildScoringType: ScoringType.HEAL_SCORE,
        storedScoringType: ScoringType.DPS_SCORE,
      },
      expected: ScoringType.HEAL_SCORE,
    },
    {
      name: 'the persisted selection wins when higher precedence sources are absent',
      input: {
        forceDebug: false,
        injectedScoringType: undefined,
        buildScoringType: undefined,
        storedScoringType: ScoringType.DPS_SCORE,
      },
      expected: ScoringType.DPS_SCORE,
    },
  ])('$name', ({ input, expected }) => {
    expect(resolveRequestedShowcaseScoringType(input)).toBe(expected)
  })
})

test('runtime resolution drives retained selection, fallback, and selector order together', () => {
  const resolvedOrder = resolveShowcaseScoringOrder([
    ScoringType.SHIELD_SCORE,
    ScoringType.BUFFER_SCORE,
  ], {
    [ScoringConfigType.DPS]: {},
    [ScoringConfigType.BUFFER]: {},
  })

  expect(resolvedOrder[0]).toBe(ScoringType.BUFFER_SCORE)
  expect(resolveShowcaseScoringType(ScoringType.DPS_SCORE, resolvedOrder)).toBe(ScoringType.DPS_SCORE)
  expect(resolveShowcaseScoringType(ScoringType.HEAL_SCORE, resolvedOrder)).toBe(ScoringType.BUFFER_SCORE)

  const selectorOptions = buildShowcaseScoringOptions(resolvedOrder, (scoringType) => `label-${scoringType}`)
  expect(selectorOptions.map((option) => Number(option.value))).toEqual(resolvedOrder)
})
