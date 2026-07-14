// @vitest-environment jsdom

import {
  Parts,
  Stats,
} from 'lib/constants/constants'
import { validateRelic } from 'lib/overlays/modals/relicModal/relicModalController'
import type { RelicForm } from 'lib/overlays/modals/relicModal/relicModalTypes'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import { SetsRelicsNames } from 'lib/sets/setConfigRegistry'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const VALID_RELIC_FORM: RelicForm = {
  equippedBy: 'None',
  enhance: 15,
  grade: 5,
  part: Parts.Head,
  set: SetsRelicsNames[0],
  mainStatType: Stats.HP,
  mainStatValue: 705,
}

describe('validateRelic', () => {
  beforeEach(() => {
    vi.spyOn(RelicAugmenter, 'augment').mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('accepts sparse substat rows and preserves their order in the compact relic output', () => {
    const relic = validateRelic({
      ...VALID_RELIC_FORM,
      substatType0: Stats.ATK_P,
      substatValue0: '10',
      substatType1: Stats.SPD,
      substatValue1: '5',
      substatType3: Stats.CR,
      substatValue3: '8',
    })

    expect(relic?.substats.map((substat) => substat.stat)).toEqual([
      Stats.ATK_P,
      Stats.SPD,
      Stats.CR,
    ])
  })

  it('compacts preview substats without losing their preview value', () => {
    const relic = validateRelic({
      ...VALID_RELIC_FORM,
      substatType0: Stats.ATK_P,
      substatValue0: '10',
      substatType2: Stats.SPD,
      substatValue2: '0',
      substat2IsPreview: 5.2,
      substatType3: Stats.CR,
      substatValue3: '8',
    })

    expect(relic?.substats.map((substat) => substat.stat)).toEqual([
      Stats.ATK_P,
      Stats.CR,
    ])
    expect(relic?.previewSubstats).toEqual([{
      stat: Stats.SPD,
      value: 5.2,
    }])
  })
})
