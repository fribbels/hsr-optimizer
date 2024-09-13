import DB from './db.js'
import { SaveState } from './saveState.js'
import { Message } from './message.js'
import { OptimizerTabController } from 'lib/optimizerTabController.js'
import { Relic, RelicEnhance, RelicGrade, Stat } from 'types/Relic'
import { Constants, Stats, SubStatValues } from 'lib/constants'
import { RelicAugmenter } from 'lib/relicAugmenter'
import { Utils } from 'lib/utils'
import { RelicRollFixer } from 'lib/relicRollFixer'
import i18next from 'i18next'

export const RelicModalController = {
  onEditOk: (selectedRelic: Relic, relic: Relic) => {
    relic.id = selectedRelic.id

    const updatedRelic = { ...selectedRelic, ...relic }

    window.rescoreSingleRelic(updatedRelic)
    DB.setRelic(updatedRelic)
    window.setRelicRows(DB.getRelics())

    console.log('onEditOk', updatedRelic)
    Message.success(i18next.t('modals:relic.messages.editsuccess'))

    setTimeout(() => {
      SaveState.save()
      window.forceCharacterTabUpdate()
    }, 200)

    OptimizerTabController.updateFilters()

    return updatedRelic
  },

}

export type RelicForm = {
  part: string
  mainStatType: string
  mainStatValue: number
  set: string
  enhance: RelicEnhance
  grade: RelicGrade
  substatType0: string
  substatType1: string
  substatType2: string
  substatType3: string
  substatValue0: number
  substatValue1: number
  substatValue2: number
  substatValue3: number
  equippedBy: string
}

export function validateRelic(relicForm: RelicForm): Relic | void {
  console.log('Form finished', relicForm)
  if (!relicForm.part) {
    return Message.error(i18next.t('modals:relic.messages.error.partmissing'))
  }
  if (!relicForm.mainStatType) {
    return Message.error(i18next.t('modals:relic.messages.error.mainstatmissing'))
  }
  if (!relicForm.mainStatValue) {
    return Message.error(i18next.t('modals:relic.messages.error.mainstatmissing'))
  }
  if (!relicForm.set) {
    return Message.error(i18next.t('modals:relic.messages.error.setmissing'))
  }
  if (relicForm.enhance == undefined) {
    return Message.error(i18next.t('modals:relic.messages.error.enhancemissing'))
  }
  if (relicForm.grade == undefined) {
    return Message.error(i18next.t('modals:relic.messages.error.grademissing'))
  }
  if (relicForm.grade > 5 || relicForm.grade < 2) {
    return Message.error(i18next.t('modals:relic.messages.error.gradeinvalid'))
  }
  if (relicForm.enhance > 15 || relicForm.enhance < 0) {
    return Message.error(i18next.t('modals:relic.messages.error.enhanceinvalid'))
  }
  if (relicForm.enhance > relicForm.grade * 3) {
    return Message.error(i18next.t('modals:relic.messages.error.enhancetoohigh'))
  }
  if (!Constants.SetsRelicsNames.includes(relicForm.set) && !Constants.SetsOrnamentsNames.includes(relicForm.set)) {
    return Message.error(i18next.t('modals:relic.messages.error.setinvalid'))
  }
  if (Constants.SetsRelicsNames.includes(relicForm.set) && (relicForm.part == Constants.Parts.PlanarSphere || relicForm.part == Constants.Parts.LinkRope)) {
    return Message.error(i18next.t('modals:relic.messages.error.setnotornament'))
  }
  if (Constants.SetsOrnamentsNames.includes(relicForm.set) && (relicForm.part == Constants.Parts.Head
    || relicForm.part == Constants.Parts.Hands
    || relicForm.part == Constants.Parts.Body
    || relicForm.part == Constants.Parts.Feet)) {
    return Message.error(i18next.t('modals:relic.messages.error.setnotrelic'))
  }
  if (relicForm.substatType0 != undefined && relicForm.substatValue0 == undefined || relicForm.substatType0 == undefined && relicForm.substatValue0 != undefined) {
    return Message.error(i18next.t('modals:relic.messages.error.subninvalid', { number: 1 }))
  }
  if (relicForm.substatType1 != undefined && relicForm.substatValue1 == undefined || relicForm.substatType1 == undefined && relicForm.substatValue1 != undefined) {
    return Message.error(i18next.t('modals:relic.messages.error.subninvalid', { number: 2 }))
  }
  if (relicForm.substatType2 != undefined && relicForm.substatValue2 == undefined || relicForm.substatType2 == undefined && relicForm.substatValue2 != undefined) {
    return Message.error(i18next.t('modals:relic.messages.error.subninvalid', { number: 3 }))
  }
  if (relicForm.substatType3 != undefined && relicForm.substatValue3 == undefined || relicForm.substatType3 == undefined && relicForm.substatValue3 != undefined) {
    return Message.error(i18next.t('modals:relic.messages.error.subninvalid', { number: 4 }))
  }

  if (relicForm.substatType3 != undefined && (relicForm.substatType0 == undefined || relicForm.substatType1 == undefined || relicForm.substatType2 == undefined)) {
    return Message.error(i18next.t('modals:relic.messages.error.subsoutoforder'))
  }
  if (relicForm.substatType2 != undefined && (relicForm.substatType0 == undefined || relicForm.substatType1 == undefined)) {
    return Message.error(i18next.t('modals:relic.messages.error.subsoutoforder'))
  }
  if (relicForm.substatType1 != undefined && (relicForm.substatType0 == undefined)) {
    return Message.error(i18next.t('modals:relic.messages.error.subsoutoforder'))
  }

  const substatTypes = [relicForm.substatType0, relicForm.substatType1, relicForm.substatType2, relicForm.substatType3].filter((x) => x != undefined)
  if (new Set(substatTypes).size !== substatTypes.length) {
    return Message.error(i18next.t('modals:relic.messages.error.duplicatesubs'))
  }
  if (substatTypes.includes(relicForm.mainStatType)) {
    return Message.error(i18next.t('modals:relic.messages.error.mainassub'))
  }

  if (relicForm.substatValue0 >= 1000 || relicForm.substatValue1 >= 1000 || relicForm.substatValue2 >= 1000 || relicForm.substatValue3 >= 1000) {
    return Message.error(i18next.t('modals:relic.messages.error.subtoobig'))
  }
  if (relicForm.mainStatValue >= 1000) {
    return Message.error(i18next.t('modals:relic.messages.error.maintoobig'))
  }
  if (relicForm.substatValue0 <= 0 || relicForm.substatValue1 <= 0 || relicForm.substatValue2 <= 0 || relicForm.substatValue3 <= 0) {
    return Message.error(i18next.t('modals:relic.messages.error.subtoosmall'))
  }
  if (relicForm.mainStatValue <= 0) {
    return Message.error(i18next.t('modals:relic.messages.error.maintoosmall'))
  }

  const relic: Relic = {
    equippedBy: relicForm.equippedBy == 'None' ? undefined : relicForm.equippedBy,
    enhance: relicForm.enhance,
    grade: relicForm.grade,
    part: relicForm.part,
    set: relicForm.set,
    main: {
      stat: relicForm.mainStatType,
      value: relicForm.mainStatValue,
    },
  }
  const substats: Stat[] = []
  if (relicForm.substatType0 != undefined && relicForm.substatValue0 != undefined) {
    substats.push({
      stat: relicForm.substatType0,
      value: relicForm.substatValue0,
    })
  }
  if (relicForm.substatType1 != undefined && relicForm.substatValue1 != undefined) {
    substats.push({
      stat: relicForm.substatType1,
      value: relicForm.substatValue1,
    })
  }
  if (relicForm.substatType2 != undefined && relicForm.substatValue2 != undefined) {
    substats.push({
      stat: relicForm.substatType2,
      value: relicForm.substatValue2,
    })
  }
  if (relicForm.substatType3 != undefined && relicForm.substatValue3 != undefined) {
    substats.push({
      stat: relicForm.substatType3,
      value: relicForm.substatValue3,
    })
  }
  relic.substats = substats
  RelicAugmenter.augment(relic)

  return relic
}

export type RelicUpgradeValues = {
  low: number | undefined
  mid: number | undefined
  high: number | undefined
}

export function calculateUpgradeValues(relicForm: RelicForm): RelicUpgradeValues[] {
  const statPairs: Stat[] = [
    { stat: relicForm.substatType0, value: relicForm.substatValue0 },
    { stat: relicForm.substatType1, value: relicForm.substatValue1 },
    { stat: relicForm.substatType2, value: relicForm.substatValue2 },
    { stat: relicForm.substatType3, value: relicForm.substatValue3 },
  ]

  const upgradeValues: RelicUpgradeValues[] = []

  for (let { stat, value } of statPairs) {
    if (stat != undefined && value != undefined) {
      if (value == '') {
        value = 0
      } else if (isNaN(parseFloat(value))) {
        upgradeValues.push({ low: undefined, mid: undefined, high: undefined })
        continue
      }

      if (stat == Stats.SPD) {
        const lowSpdValue = parseFloat(value) + (relicForm.grade == 5 ? 2 : 1)
        upgradeValues.push({ low: Math.floor(lowSpdValue), mid: undefined, high: Math.floor(lowSpdValue + 1) })

        continue
      }

      const value10ths = Utils.truncate10ths(Utils.precisionRound(parseFloat(value)))
      const fixedValue: number = RelicRollFixer.fixSubStatValue(stat, value10ths, 5)

      const upgrades: RelicUpgradeValues = Utils.clone(SubStatValues[stat][relicForm.grade])

      if (Utils.isFlat(stat)) {
        upgrades.low = renderFlatStat(fixedValue + upgrades.low!)
        upgrades.mid = renderFlatStat(fixedValue + upgrades.mid!)
        upgrades.high = renderFlatStat(fixedValue + upgrades.high!)
      } else {
        upgrades.low = renderPercentStat(fixedValue + upgrades.low!)
        upgrades.mid = renderPercentStat(fixedValue + upgrades.mid!)
        upgrades.high = renderPercentStat(fixedValue + upgrades.high!)
      }
      upgradeValues.push(upgrades)
    } else {
      upgradeValues.push({ low: undefined, mid: undefined, high: undefined })
    }
  }

  return upgradeValues
}

function renderFlatStat(value: number) {
  return Math.floor(Utils.precisionRound(value))
}

function renderPercentStat(value: number) {
  return Utils.truncate10ths(Utils.precisionRound(value)).toFixed(1)
}
