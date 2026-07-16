import { Stats } from 'lib/constants/constants'
import {
  computeSubstatRemovalUpdates,
  computeSubstatRowUpdates,
  getRelicFormSubstats,
} from 'lib/overlays/modals/relicModal/relicModalHelpers'
import type {
  RelicForm,
  RelicFormStat,
  SubstatIndex,
} from 'lib/overlays/modals/relicModal/relicModalTypes'
import {
  describe,
  expect,
  it,
} from 'vitest'

const RELIC_FORM: RelicForm = {
  substatType0: Stats.ATK_P,
  substatValue0: '10',
  substat0IsPreview: false,
  substatType1: Stats.SPD,
  substatValue1: '0',
  substat1IsPreview: 5.2,
  substatType2: Stats.CR,
  substatValue2: '8',
  substat2IsPreview: false,
  substatType3: Stats.CD,
  substatValue3: '16',
  substat3IsPreview: false,
}

const EMPTY_SUBSTAT: RelicFormStat = {
  stat: undefined,
  value: undefined,
  isPreview: false,
}

const EXPECTED_REMAINING_INDICES: Record<SubstatIndex, (SubstatIndex | undefined)[]> = {
  0: [1, 2, 3, undefined],
  1: [0, 2, 3, undefined],
  2: [0, 1, 3, undefined],
  3: [0, 1, 2, undefined],
}

describe('computeSubstatRemovalUpdates', () => {
  it.each([0, 1, 2, 3] as const)('removes row %i and shifts complete rows upward', (removedIndex) => {
    const original = getRelicFormSubstats(RELIC_FORM)
    const updates = computeSubstatRemovalUpdates(RELIC_FORM, removedIndex)
    const result = getRelicFormSubstats({ ...RELIC_FORM, ...updates })
    const expected = EXPECTED_REMAINING_INDICES[removedIndex].map((sourceIndex) => (
      sourceIndex == null ? EMPTY_SUBSTAT : original[sourceIndex]
    ))

    expect(result).toEqual(expected)
  })

  it('keeps a partially populated form contiguous after removing a middle row', () => {
    const partialForm: RelicForm = {
      ...RELIC_FORM,
      substatType3: undefined,
      substatValue3: undefined,
      substat3IsPreview: undefined,
    }
    const original = getRelicFormSubstats(partialForm)
    const updates = computeSubstatRemovalUpdates(partialForm, 1)
    const result = getRelicFormSubstats({ ...partialForm, ...updates })

    expect(result).toEqual([
      original[0],
      original[2],
      EMPTY_SUBSTAT,
      EMPTY_SUBSTAT,
    ])
  })
})

describe('computeSubstatRowUpdates', () => {
  it('updates one complete row without changing the others', () => {
    const original = getRelicFormSubstats(RELIC_FORM)
    const updates = computeSubstatRowUpdates(RELIC_FORM, 1, {
      stat: Stats.HP_P,
      value: '12',
      isPreview: false,
    })
    const result = getRelicFormSubstats({ ...RELIC_FORM, ...updates })

    expect(result).toEqual([
      original[0],
      { stat: Stats.HP_P, value: '12', isPreview: false },
      original[2],
      original[3],
    ])
  })
})
