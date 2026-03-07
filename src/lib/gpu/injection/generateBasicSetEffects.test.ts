import { describe, expect, it } from 'vitest'
import { basicP2, basicP4, GpuSetMatcher } from './generateBasicSetEffects'
import { WgslStatName } from 'lib/optimization/basicStatsArray'
import { SetType } from 'types/setConfig'
import { Sets } from 'lib/constants/constants'

const mockRelicInfo = { id: 'MusketeerOfWildWheat' as const, index: 1, setType: SetType.RELIC, ingameId: '102', name: Sets.MusketeerOfWildWheat }
const mockOrnamentInfo = { id: 'InertSalsotto' as const, index: 5, setType: SetType.ORNAMENT, ingameId: '306', name: Sets.InertSalsotto }
const mockPoetInfo = { id: 'PoetOfMourningCollapse' as const, index: 23, setType: SetType.RELIC, ingameId: '124', name: Sets.PoetOfMourningCollapse }

describe('basicP2', () => {
  it('returns relic 2p entry for relic set type', () => {
    const entry = basicP2(WgslStatName.ATK_P, 0.12, mockRelicInfo)
    expect(entry).toEqual({
      stat: 'ATK_P',
      value: 0.12,
      matchFn: GpuSetMatcher.RELIC_2P,
      setId: 'MusketeerOfWildWheat',
    })
  })

  it('returns ornament 2p entry for ornament set type', () => {
    const entry = basicP2(WgslStatName.CR, 0.08, mockOrnamentInfo)
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
    const entry = basicP4(WgslStatName.SPD_P, -0.08, mockPoetInfo)
    expect(entry).toEqual({
      stat: 'SPD_P',
      value: -0.08,
      matchFn: GpuSetMatcher.RELIC_4P,
      setId: 'PoetOfMourningCollapse',
    })
  })
})
