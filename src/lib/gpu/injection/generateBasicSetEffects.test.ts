import { describe, expect, it } from 'vitest'
import { basicSetEffect, GpuSetMatcher } from './generateBasicSetEffects'
import { WgslStatName } from 'lib/optimization/basicStatsArray'

describe('basicSetEffect', () => {
  it('generates percentage stat effect with base multiplier', () => {
    const result = basicSetEffect(WgslStatName.ATK_P, 0.12, GpuSetMatcher.RELIC_2P, 'MusketeerOfWildWheat')
    expect(result).toBe('    c.ATK += baseATK * 0.12 * relic2p(sets, SET_MusketeerOfWildWheat);')
  })

  it('generates flat stat effect without base multiplier', () => {
    const result = basicSetEffect(WgslStatName.CR, 0.08, GpuSetMatcher.ORNAMENT_2P, 'InertSalsotto')
    expect(result).toBe('    c.CR += 0.08 * ornament2p(sets, SET_InertSalsotto);')
  })

  it('generates relic4p effect', () => {
    const result = basicSetEffect(WgslStatName.SPD_P, 0.06, GpuSetMatcher.RELIC_4P, 'MusketeerOfWildWheat')
    expect(result).toBe('    c.SPD += baseSPD * 0.06 * relic4p(sets, SET_MusketeerOfWildWheat);')
  })

  it('handles negative values', () => {
    const result = basicSetEffect(WgslStatName.SPD_P, -0.08, GpuSetMatcher.RELIC_4P, 'PoetOfMourningCollapse')
    expect(result).toBe('    c.SPD += baseSPD * -0.08 * relic4p(sets, SET_PoetOfMourningCollapse);')
  })

  it('generates DMG_BOOST as flat stat', () => {
    const result = basicSetEffect(WgslStatName.PHYSICAL_DMG_BOOST, 0.10, GpuSetMatcher.RELIC_2P, 'ChampionOfStreetwiseBoxing')
    expect(result).toBe('    c.PHYSICAL_DMG_BOOST += 0.1 * relic2p(sets, SET_ChampionOfStreetwiseBoxing);')
  })

  it('generates ELATION as flat stat', () => {
    const result = basicSetEffect(WgslStatName.ELATION, 0.08, GpuSetMatcher.ORNAMENT_2P, 'PunklordeStageZero')
    expect(result).toBe('    c.ELATION += 0.08 * ornament2p(sets, SET_PunklordeStageZero);')
  })
})
