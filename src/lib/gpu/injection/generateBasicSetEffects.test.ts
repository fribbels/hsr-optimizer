import { Sets } from 'lib/constants/constants'
import {
  basicP2,
  basicP4,
  generateBasicSetEffectsWgsl,
  GpuSetMatcher,
} from 'lib/gpu/injection/generateBasicSetEffects'
import { WgslStatName } from 'lib/optimization/basicStatsArray'
import { setConfigRegistry } from 'lib/sets/setConfigRegistry'
import { SetType } from 'types/setConfig'
import {
  describe,
  expect,
  it,
} from 'vitest'

const mockRelicConfig = {
  id: Sets.MusketeerOfWildWheat,
  setKey: 'MusketeerOfWildWheat' as const,
  info: { index: 1, setType: SetType.RELIC, ingameId: '102', set: Sets.MusketeerOfWildWheat },
  conditionals: {},
  display: { conditionalType: 0, defaultValue: true },
}
const mockOrnamentConfig = {
  id: Sets.InertSalsotto,
  setKey: 'InertSalsotto' as const,
  info: { index: 5, setType: SetType.ORNAMENT, ingameId: '306', set: Sets.InertSalsotto },
  conditionals: {},
  display: { conditionalType: 0, defaultValue: true },
}
const mockPoetConfig = {
  id: Sets.PoetOfMourningCollapse,
  setKey: 'PoetOfMourningCollapse' as const,
  info: { index: 23, setType: SetType.RELIC, ingameId: '124', set: Sets.PoetOfMourningCollapse },
  conditionals: {},
  display: { conditionalType: 0, defaultValue: true },
}

describe('basicP2', () => {
  it('returns relic 2p entry for relic set type', () => {
    const entry = basicP2(WgslStatName.ATK_P, 0.12, mockRelicConfig as any)
    expect(entry).toEqual({
      stat: 'ATK_P',
      value: 0.12,
      matchFn: GpuSetMatcher.RELIC_2P,
      setId: 'MusketeerOfWildWheat',
    })
  })

  it('returns ornament 2p entry for ornament set type', () => {
    const entry = basicP2(WgslStatName.CR, 0.08, mockOrnamentConfig as any)
    expect(entry).toEqual({
      stat: 'CR',
      value: 0.08,
      matchFn: GpuSetMatcher.ORNAMENT_2P,
      setId: 'InertSalsotto',
    })
  })
})

describe('basicP4', () => {
  it('returns relic 4p entry', () => {
    const entry = basicP4(WgslStatName.SPD_P, -0.08, mockPoetConfig as any)
    expect(entry).toEqual({
      stat: 'SPD_P',
      value: -0.08,
      matchFn: GpuSetMatcher.RELIC_4P,
      setId: 'PoetOfMourningCollapse',
    })
  })
})

describe('generateBasicSetEffectsWgsl', () => {
  const wgsl = generateBasicSetEffectsWgsl()

  it('includes the generated section header', () => {
    expect(wgsl).toContain('// Generated basic set effects')
  })

  it('wraps matcher calls in f32(...) using raw SET_X indices', () => {
    expect(wgsl).toMatch(/f32\(relic2p\(sets, SET_\w+\)\)/)
    expect(wgsl).toMatch(/f32\(relic4p\(sets, SET_\w+\)\)/)
    expect(wgsl).toMatch(/f32\(ornament2p\(sets, SET_\w+\)\)/)

    expect(wgsl).not.toContain('1u <<')
  })

  it('preserves the grouped base-stat multiply form (base stat multiplied once against a summed percentage)', () => {
    expect(wgsl).toMatch(/c\.HP \+= \(baseHP\) \* \(/)
    expect(wgsl).toMatch(/c\.ATK \+= \(baseATK\) \* \(/)
    expect(wgsl).toMatch(/c\.SPD \+= \(baseSPD\) \* \(/)

    expect(wgsl).toMatch(/c\.CR \+= /)
    expect(wgsl).not.toMatch(/c\.CR \+= \(baseCR\)/)
  })

  it('has no switch-dispatch machinery left over', () => {
    expect(wgsl).not.toContain('SetStatAccum')
    expect(wgsl).not.toContain('accumRelic2p')
    expect(wgsl).not.toContain('accumRelic4p')
    expect(wgsl).not.toContain('accumOrnament2p')
    expect(wgsl).not.toContain('switch (setIndex)')
    expect(wgsl).not.toContain('default: {}')
  })

  it('does not couple basic effects directly to the generated mask storage fields', () => {
    expect(wgsl).not.toMatch(/relicMatch2|relicMatch4|ornamentMatch2/)
  })

  it('contributes exactly one term per configured basic set effect', () => {
    const expected: Record<GpuSetMatcher, number> = {
      [GpuSetMatcher.RELIC_2P]: 0,
      [GpuSetMatcher.RELIC_4P]: 0,
      [GpuSetMatcher.ORNAMENT_2P]: 0,
    }
    for (const config of setConfigRegistry.values()) {
      for (const entry of config.conditionals.gpuBasic?.() ?? []) {
        expected[entry.matchFn]++
      }
    }

    expect(wgsl.match(/f32\(relic2p\(sets, SET_\w+\)\)/g) ?? []).toHaveLength(expected[GpuSetMatcher.RELIC_2P])
    expect(wgsl.match(/f32\(relic4p\(sets, SET_\w+\)\)/g) ?? []).toHaveLength(expected[GpuSetMatcher.RELIC_4P])
    expect(wgsl.match(/f32\(ornament2p\(sets, SET_\w+\)\)/g) ?? []).toHaveLength(expected[GpuSetMatcher.ORNAMENT_2P])
  })
})
