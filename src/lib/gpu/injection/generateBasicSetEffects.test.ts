import { describe, expect, it } from 'vitest'
import { basicP2, basicP4, GpuSetMatcher } from './generateBasicSetEffects'
import { WgslStatName } from 'lib/optimization/basicStatsArray'
import { SetType } from 'types/setConfig'

describe('basicP2', () => {
  it('returns relic 2p entry for relic set type', () => {
    const entry = basicP2(WgslStatName.ATK_P, 0.12, 'MusketeerOfWildWheat', SetType.RELIC)
    expect(entry).toEqual({
      stat: 'ATK_P',
      value: 0.12,
      matchFn: GpuSetMatcher.RELIC_2P,
      setId: 'MusketeerOfWildWheat',
    })
  })

  it('returns ornament 2p entry for ornament set type', () => {
    const entry = basicP2(WgslStatName.CR, 0.08, 'InertSalsotto', SetType.ORNAMENT)
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
    const entry = basicP4(WgslStatName.SPD_P, -0.08, 'PoetOfMourningCollapse')
    expect(entry).toEqual({
      stat: 'SPD_P',
      value: -0.08,
      matchFn: GpuSetMatcher.RELIC_4P,
      setId: 'PoetOfMourningCollapse',
    })
  })
})
