import { describe, expect, it } from 'vitest'
import { basicP2, basicP4, GpuSetMatcher } from './generateBasicSetEffects'
import { WgslStatName } from 'lib/optimization/basicStatsArray'
import { SetType } from 'types/setConfig'
import { Sets } from 'lib/constants/constants'

const mockRelicConfig = { id: Sets.MusketeerOfWildWheat, setKey: 'MusketeerOfWildWheat' as const, info: { index: 1, setType: SetType.RELIC, ingameId: '102', set: Sets.MusketeerOfWildWheat }, conditionals: {}, display: { conditionalType: 0, defaultValue: true } }
const mockOrnamentConfig = { id: Sets.InertSalsotto, setKey: 'InertSalsotto' as const, info: { index: 5, setType: SetType.ORNAMENT, ingameId: '306', set: Sets.InertSalsotto }, conditionals: {}, display: { conditionalType: 0, defaultValue: true } }
const mockPoetConfig = { id: Sets.PoetOfMourningCollapse, setKey: 'PoetOfMourningCollapse' as const, info: { index: 23, setType: SetType.RELIC, ingameId: '124', set: Sets.PoetOfMourningCollapse }, conditionals: {}, display: { conditionalType: 0, defaultValue: true } }

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
