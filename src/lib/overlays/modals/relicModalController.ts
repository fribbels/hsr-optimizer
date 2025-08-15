import i18next from 'i18next'
import {
  MainStats,
  Parts,
  Sets,
  SetsOrnamentsNames,
  SetsRelicsNames,
  Stats,
  SubStats,
  SubStatValues,
} from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import { RelicRollFixer } from 'lib/relics/relicRollFixer'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { arrayIncludes } from 'lib/utils/arrayUtils'
import {
  partIsOrnament,
  partIsRelic,
} from 'lib/utils/relicUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import {
  Relic,
  RelicEnhance,
  RelicGrade,
} from 'types/relic'

export type RelicUpgradeValues = {
  low: number | undefined,
  mid: number | undefined,
  high: number | undefined,
}

type RelicFormStat = {
  stat: string | undefined,
  value: string | undefined,
}

export type RelicForm = Partial<{
  part: Parts,
  mainStatType: MainStats,
  mainStatValue: number,
  set: Sets,
  enhance: RelicEnhance,
  grade: RelicGrade,
  substatType0: SubStats,
  substatType1: SubStats,
  substatType2: SubStats,
  substatType3: SubStats,
  substatValue0: string,
  substatValue1: string,
  substatValue2: string,
  substatValue3: string,
  equippedBy: string,
}>

export const RelicModalController = {
  onEditOk: (selectedRelic: Relic, relic: Relic) => {
    relic.id = selectedRelic.id

    const updatedRelic = { ...selectedRelic, ...relic }

    DB.setRelic(updatedRelic)

    console.log('onEditOk', updatedRelic)
    Message.success(i18next.t('modals:Relic.Messages.EditSuccess') /* Successfully edited relic */)

    setTimeout(() => {
      SaveState.delayedSave()
      OptimizerTabController.updateFilters()
    }, 200)

    return updatedRelic
  },
}

function invalidValue(value?: string) {
  if (!value) return true
  return isNaN(parseFloat(value))
}

export function validateRelic(relicForm: RelicForm): Relic | void {
  console.log('Form finished', relicForm)

  const t = i18next.getFixedT(null, 'modals', 'Relic.Messages.Error')

  if (!relicForm.part) {
    return Message.error(t('PartMissing') /* Part field is missing */)
  }
  if (!relicForm.mainStatType) {
    return Message.error(t('MainstatMissing') /* Main stat is missing */)
  }
  if (!relicForm.mainStatValue) {
    return Message.error(t('MainstatMissing') /* Main stat is missing */)
  }
  if (!relicForm.set) {
    return Message.error(t('SetMissing') /* Set field is missing */)
  }
  if (relicForm.enhance == undefined) {
    return Message.error(t('EnhanceMissing') /* Enhance field is missing */)
  }
  if (relicForm.grade == undefined) {
    return Message.error(t('GradeMissing') /* Grade field is missing */)
  }
  if (relicForm.grade > 5 || relicForm.grade < 2) {
    return Message.error(t('GradeInvalid') /* Grade value is invalid */)
  }
  if (relicForm.enhance > 15 || relicForm.enhance < 0) {
    return Message.error(t('EnhanceInvalid') /* Enhance value is invalid */)
  }
  if (relicForm.enhance > relicForm.grade * 3) {
    return Message.error(t('EnhanceTooHigh') /* Enhance value is too high for this grade */)
  }
  if (!arrayIncludes(SetsRelicsNames, relicForm.set) && !arrayIncludes(SetsOrnamentsNames, relicForm.set)) {
    return Message.error(t('SetInvalid') /* Set value is invalid */)
  }
  if (arrayIncludes(SetsRelicsNames, relicForm.set) && partIsOrnament(relicForm.part)) {
    return Message.error(t('SetNotOrnament') /* The selected set is not an ornament set */)
  }
  if (arrayIncludes(SetsOrnamentsNames, relicForm.set) && partIsRelic(relicForm.part)) {
    return Message.error(t('SetNotRelic') /* The selected set is not a relic set */)
  }
  if (
    relicForm.substatType0 != undefined && invalidValue(relicForm.substatValue0) || relicForm.substatType0 == undefined && relicForm.substatValue0 != undefined
  ) {
    return Message.error(t('SubNInvalid', { number: 1 }) /* Substat 1 is invalid */)
  }
  if (
    relicForm.substatType1 != undefined && invalidValue(relicForm.substatValue1) || relicForm.substatType1 == undefined && relicForm.substatValue1 != undefined
  ) {
    return Message.error(t('SubNInvalid', { number: 2 }) /* Substat 2 is invalid */)
  }
  if (
    relicForm.substatType2 != undefined && invalidValue(relicForm.substatValue2) || relicForm.substatType2 == undefined && relicForm.substatValue2 != undefined
  ) {
    return Message.error(t('SubNInvalid', { number: 3 }) /* Substat 3 is invalid */)
  }
  if (
    relicForm.substatType3 != undefined && invalidValue(relicForm.substatValue3) || relicForm.substatType3 == undefined && relicForm.substatValue3 != undefined
  ) {
    return Message.error(t('SubNInvalid', { number: 4 }) /* Substat 4 is invalid */)
  }

  if (
    relicForm.substatType3 != undefined && (relicForm.substatType0 == undefined || relicForm.substatType1 == undefined || relicForm.substatType2 == undefined)
  ) {
    return Message.error(t('SubsOutOfOrder') /* Substats are out of order */)
  }
  if (relicForm.substatType2 != undefined && (relicForm.substatType0 == undefined || relicForm.substatType1 == undefined)) {
    return Message.error(t('SubsOutOfOrder') /* Substats are out of order */)
  }
  if (relicForm.substatType1 != undefined && (relicForm.substatType0 == undefined)) {
    return Message.error(t('SubsOutOfOrder') /* Substats are out of order */)
  }

  const substatTypes = [relicForm.substatType0, relicForm.substatType1, relicForm.substatType2, relicForm.substatType3].filter((x) => x != undefined)
  if (new Set(substatTypes).size !== substatTypes.length) {
    return Message.error(t('DuplicateSubs') /* Duplicate substats, only one of each type is allowed */)
  }
  if (substatTypes.includes(relicForm.mainStatType as SubStats)) {
    return Message.error(t('MainAsSub') /* Substat type is the same as the main stat */)
  }

  //
  const substatNumber0 = parseFloat(relicForm.substatValue0!)
  const substatNumber1 = parseFloat(relicForm.substatValue1!)
  const substatNumber2 = parseFloat(relicForm.substatValue2!)
  const substatNumber3 = parseFloat(relicForm.substatValue3!)

  if (substatNumber0 >= 1000 || substatNumber1 >= 1000 || substatNumber2 >= 1000 || substatNumber3 >= 1000) {
    return Message.error(t('SubTooBig') /* Substat value is too big */)
  }
  if (relicForm.mainStatValue >= 1000) {
    return Message.error(t('MainTooBig') /* Main stat value is too big */)
  }
  if (substatNumber0 <= 0 || substatNumber1 <= 0 || substatNumber2 <= 0 || substatNumber3 <= 0) {
    return Message.error(t('SubTooSmall') /* Substat values should be positive */)
  }
  if (relicForm.mainStatValue <= 0) {
    return Message.error(t('MainTooSmall') /* Main stat values should be positive */)
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
  } as Relic

  const substats: { value: number, stat: SubStats }[] = []
  if (relicForm.substatType0 != undefined && relicForm.substatValue0 != undefined) {
    substats.push({
      stat: relicForm.substatType0,
      value: substatNumber0,
    })
  }
  if (relicForm.substatType1 != undefined && relicForm.substatValue1 != undefined) {
    substats.push({
      stat: relicForm.substatType1,
      value: substatNumber1,
    })
  }
  if (relicForm.substatType2 != undefined && relicForm.substatValue2 != undefined) {
    substats.push({
      stat: relicForm.substatType2,
      value: substatNumber2,
    })
  }
  if (relicForm.substatType3 != undefined && relicForm.substatValue3 != undefined) {
    substats.push({
      stat: relicForm.substatType3,
      value: substatNumber3,
    })
  }
  relic.substats = substats
  RelicAugmenter.augment(relic)

  return relic
}

export function calculateUpgradeValues(relicForm: RelicForm): RelicUpgradeValues[] {
  const statPairs: RelicFormStat[] = [
    { stat: relicForm.substatType0, value: relicForm.substatValue0 },
    { stat: relicForm.substatType1, value: relicForm.substatValue1 },
    { stat: relicForm.substatType2, value: relicForm.substatValue2 },
    { stat: relicForm.substatType3, value: relicForm.substatValue3 },
  ]

  const upgradeValues: RelicUpgradeValues[] = []

  for (let { stat, value } of statPairs) {
    if (stat != undefined && value != undefined) {
      if (value == '') {
        value = '0'
      } else if (isNaN(parseFloat(value))) {
        upgradeValues.push({ low: undefined, mid: undefined, high: undefined })
        continue
      }

      const value10ths = Utils.truncate10ths(Utils.precisionRound(parseFloat(value)))
      const fixedValue: number = RelicRollFixer.fixSubStatValue(stat, value10ths, 5)

      const upgrades: RelicUpgradeValues = TsUtils.clone(SubStatValues[stat as SubStats][relicForm.grade as 5 | 4 | 3 | 2])

      if (Utils.isFlat(stat) && stat != Stats.SPD) {
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
  return Math.floor(TsUtils.precisionRound(value))
}

function renderPercentStat(value: number) {
  return Utils.truncate10ths(TsUtils.precisionRound(value))
}
