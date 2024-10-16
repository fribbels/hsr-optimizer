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
    Message.success(i18next.t('modals:Relic.Messages.EditSuccess')/* Successfully edited relic */)

    setTimeout(() => {
      SaveState.delayedSave()
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
    return Message.error(i18next.t('modals:Relic.Messages.Error.PartMissing')/* Part field is missing */)
  }
  if (!relicForm.mainStatType) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.MainstatMissing')/* Main stat is missing */)
  }
  if (!relicForm.mainStatValue) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.MainstatMissing')/* Main stat is missing */)
  }
  if (!relicForm.set) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SetMissing')/* Set field is missing */)
  }
  if (relicForm.enhance == undefined) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.EnhanceMissing')/* Enhance field is missing */)
  }
  if (relicForm.grade == undefined) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.GradeMissing')/* Grade field is missing */)
  }
  if (relicForm.grade > 5 || relicForm.grade < 2) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.GradeInvalid')/* Grade value is invalid */)
  }
  if (relicForm.enhance > 15 || relicForm.enhance < 0) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.EnhanceInvalid')/* Enhance value is invalid */)
  }
  if (relicForm.enhance > relicForm.grade * 3) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.EnhanceTooHigh')/* Enhance value is too high for this grade */)
  }
  if (!Constants.SetsRelicsNames.includes(relicForm.set) && !Constants.SetsOrnamentsNames.includes(relicForm.set)) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SetInvalid')/* Set value is invalid */)
  }
  if (Constants.SetsRelicsNames.includes(relicForm.set) && (relicForm.part == Constants.Parts.PlanarSphere || relicForm.part == Constants.Parts.LinkRope)) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SetNotOrnament')/* The selected set is not an ornament set */)
  }
  if (Constants.SetsOrnamentsNames.includes(relicForm.set) && (relicForm.part == Constants.Parts.Head
    || relicForm.part == Constants.Parts.Hands
    || relicForm.part == Constants.Parts.Body
    || relicForm.part == Constants.Parts.Feet)) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SetNotRelic')/* The selected set is not a relic set */)
  }
  if (relicForm.substatType0 != undefined && relicForm.substatValue0 == undefined || relicForm.substatType0 == undefined && relicForm.substatValue0 != undefined) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SubNInvalid', { number: 1 })/* Substat 1 is invalid */)
  }
  if (relicForm.substatType1 != undefined && relicForm.substatValue1 == undefined || relicForm.substatType1 == undefined && relicForm.substatValue1 != undefined) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SubNInvalid', { number: 2 })/* Substat 2 is invalid */)
  }
  if (relicForm.substatType2 != undefined && relicForm.substatValue2 == undefined || relicForm.substatType2 == undefined && relicForm.substatValue2 != undefined) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SubNInvalid', { number: 3 })/* Substat 3 is invalid */)
  }
  if (relicForm.substatType3 != undefined && relicForm.substatValue3 == undefined || relicForm.substatType3 == undefined && relicForm.substatValue3 != undefined) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SubNInvalid', { number: 4 })/* Substat 4 is invalid */)
  }

  if (relicForm.substatType3 != undefined && (relicForm.substatType0 == undefined || relicForm.substatType1 == undefined || relicForm.substatType2 == undefined)) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SubsOutOfOrder')/* Substats are out of order */)
  }
  if (relicForm.substatType2 != undefined && (relicForm.substatType0 == undefined || relicForm.substatType1 == undefined)) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SubsOutOfOrder')/* Substats are out of order */)
  }
  if (relicForm.substatType1 != undefined && (relicForm.substatType0 == undefined)) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SubsOutOfOrder')/* Substats are out of order */)
  }

  const substatTypes = [relicForm.substatType0, relicForm.substatType1, relicForm.substatType2, relicForm.substatType3].filter((x) => x != undefined)
  if (new Set(substatTypes).size !== substatTypes.length) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.DuplicateSubs')/* Duplicate substats, only one of each type is allowed */)
  }
  if (substatTypes.includes(relicForm.mainStatType)) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.MainAsSub')/* Substat type is the same as the main stat */)
  }

  if (relicForm.substatValue0 >= 1000 || relicForm.substatValue1 >= 1000 || relicForm.substatValue2 >= 1000 || relicForm.substatValue3 >= 1000) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SubTooBig')/* Substat value is too big */)
  }
  if (relicForm.mainStatValue >= 1000) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.MainTooBig')/* Main stat value is too big */)
  }
  if (relicForm.substatValue0 <= 0 || relicForm.substatValue1 <= 0 || relicForm.substatValue2 <= 0 || relicForm.substatValue3 <= 0) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.SubTooSmall')/* Substat values should be positive */)
  }
  if (relicForm.mainStatValue <= 0) {
    return Message.error(i18next.t('modals:Relic.Messages.Error.MainTooSmall')/* Main stat values should be positive */)
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
