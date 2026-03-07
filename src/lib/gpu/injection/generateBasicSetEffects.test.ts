import { describe, expect, it } from 'vitest'
import { basicSetEffect } from './generateBasicSetEffects'

describe('basicSetEffect', () => {
  it('generates percentage stat effect with base multiplier', () => {
    const result = basicSetEffect('ATK_P', 0.12, 'relic2p', 'MusketeerOfWildWheat')
    expect(result).toBe('    c.ATK += baseATK * 0.12 * relic2p(sets, SET_MusketeerOfWildWheat);')
  })

  it('generates flat stat effect without base multiplier', () => {
    const result = basicSetEffect('CR', 0.08, 'ornament2p', 'InertSalsotto')
    expect(result).toBe('    c.CR += 0.08 * ornament2p(sets, SET_InertSalsotto);')
  })

  it('generates relic4p effect', () => {
    const result = basicSetEffect('SPD_P', 0.06, 'relic4p', 'MusketeerOfWildWheat')
    expect(result).toBe('    c.SPD += baseSPD * 0.06 * relic4p(sets, SET_MusketeerOfWildWheat);')
  })

  it('handles negative values', () => {
    const result = basicSetEffect('SPD_P', -0.08, 'relic4p', 'PoetOfMourningCollapse')
    expect(result).toBe('    c.SPD += baseSPD * -0.08 * relic4p(sets, SET_PoetOfMourningCollapse);')
  })

  it('generates DMG_BOOST as flat stat', () => {
    const result = basicSetEffect('PHYSICAL_DMG_BOOST', 0.10, 'relic2p', 'ChampionOfStreetwiseBoxing')
    expect(result).toBe('    c.PHYSICAL_DMG_BOOST += 0.1 * relic2p(sets, SET_ChampionOfStreetwiseBoxing);')
  })

  it('generates ELATION as flat stat', () => {
    const result = basicSetEffect('ELATION', 0.08, 'ornament2p', 'PunklordeStageZero')
    expect(result).toBe('    c.ELATION += 0.08 * ornament2p(sets, SET_PunklordeStageZero);')
  })
})
