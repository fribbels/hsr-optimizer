import i18next from 'i18next'
import {
  Constants,
  type MainStats,
  type Parts,
  type Sets,
  Stats,
  type StatsValues,
  type SubStats,
  SubStatValues,
} from 'lib/constants/constants'
import {
  SetsOrnaments,
  SetsOrnamentsNames,
  SetsRelics,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import { Message } from 'lib/interactions/message'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import { RelicRollFixer } from 'lib/relics/relicRollFixer'
import * as equipmentService from 'lib/services/equipmentService'
import { SaveState } from 'lib/state/saveState'
import { recalculatePermutations } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { arrayIncludes } from 'lib/utils/arrayUtils'
import {
  calculateRelicMainStatValue,
  partIsOrnament,
  partIsRelic,
} from 'lib/relics/relicUtils'
import { clone } from 'lib/utils/objectUtils'
import { Assets } from 'lib/rendering/assets'
import type { Relic } from 'types/relic'
import { isFlat } from 'lib/utils/statUtils'
import { truncate10ths, precisionRound } from 'lib/utils/mathUtils'
import type { MainStatOption, RelicForm, RelicFormStat, RelicUpgradeValues } from './relicModalTypes'
import type { RelicModalConfig } from './relicModalStore'
import { defaultMainStatPerPart, defaultSubstatValues, renderMainStat } from './relicModalHelpers'

// ─── Initialization ──────────────────────────────────────────────────────────

export function computeInitialFormValues(config: RelicModalConfig): RelicForm {
  const { selectedRelic, selectedPart, defaultWearer } = config

  if (selectedRelic) {
    return {
      equippedBy: selectedRelic.equippedBy ?? defaultWearer ?? 'None',
      grade: selectedRelic.grade,
      enhance: selectedRelic.enhance,
      set: selectedRelic.set,
      part: selectedRelic.part,
      mainStatType: renderMainStat(selectedRelic)?.stat,
      mainStatValue: renderMainStat(selectedRelic)?.value,
      ...defaultSubstatValues(selectedRelic),
    }
  }

  const defaultPart = selectedPart ?? Constants.Parts.Head
  const defaultMain = defaultMainStatPerPart[defaultPart]
  let defaultValue = precisionRound(
    Constants.MainStatsValues[defaultMain][5].base
    + Constants.MainStatsValues[defaultMain][5].increment * 15,
  )
  defaultValue = isFlat(defaultMain) ? Math.floor(defaultValue) : defaultValue

  return {
    equippedBy: defaultWearer ?? 'None',
    grade: 5,
    enhance: 15,
    part: defaultPart,
    mainStatType: defaultMain,
    mainStatValue: defaultValue,
  } as RelicForm
}

// ─── Derived state (computed during render) ──────────────────────────────────

export function computeMainStatOptions(part: Parts | undefined): MainStatOption[] {
  if (!part) return []
  const tStats = i18next.getFixedT(null, 'common', 'Stats')
  return Object.entries(Constants.PartsMainStats[part]).map((entry) => ({
    label: tStats(entry[1] as StatsValues),
    value: entry[1],
    icon: Assets.getStatIcon(entry[1], true),
  }))
}

export function computeMainStatDisplayValue(
  mainStatType: MainStats | undefined,
  grade: number | undefined,
  enhance: number | undefined,
): number | undefined {
  if (mainStatType == null || enhance == null || grade == null) return undefined

  const specialStats = [
    Stats.OHB, Stats.Physical_DMG, Stats.Fire_DMG, Stats.Ice_DMG,
    Stats.Lightning_DMG, Stats.Wind_DMG, Stats.Quantum_DMG, Stats.Imaginary_DMG,
  ]
  const floorStats = [Stats.HP, Stats.ATK]

  let value = calculateRelicMainStatValue(mainStatType, grade, enhance)

  // @ts-expect-error - MainStats vs Stats type mismatch in includes check
  if (specialStats.includes(mainStatType)) {
    value = truncate10ths(value)
  // @ts-expect-error - MainStats vs Stats type mismatch in includes check
  } else if (floorStats.includes(mainStatType)) {
    value = Math.floor(value)
  } else {
    value = truncate10ths(value)
  }

  return value
}

// ─── Event handler logic ─────────────────────────────────────────────────────

export function computePartChangeUpdates(
  newPart: Parts,
  currentSet: Sets | undefined,
  relicOptions: { value: string }[],
  planarOptions: { value: string }[],
): Partial<RelicForm> {
  const updates: Partial<RelicForm> = {}

  const newMainStatOptions = Object.entries(Constants.PartsMainStats[newPart])
  if (newMainStatOptions.length > 0) {
    updates.mainStatType = newMainStatOptions[0][1] as MainStats
  }

  const isOrnamentPart = newPart === Constants.Parts.PlanarSphere || newPart === Constants.Parts.LinkRope
  if (isOrnamentPart) {
    // @ts-expect-error - Sets vs string type mismatch in includes check
    if (!Object.values(SetsOrnaments).includes(currentSet)) {
      updates.set = planarOptions[0]?.value as Sets
    }
  } else {
    // @ts-expect-error - Sets vs string type mismatch in includes check
    if (!Object.values(SetsRelics).includes(currentSet)) {
      updates.set = relicOptions[0]?.value as Sets
    }
  }

  return updates
}

// ─── Static options ──────────────────────────────────────────────────────────

export const ENHANCE_OPTIONS: { value: string; label: string }[] = Array.from(
  { length: 16 },
  (_, i) => ({ value: String(15 - i), label: `+${15 - i}` }),
)

export const GRADE_OPTIONS = [
  { value: '2', label: '2 \u2605' },
  { value: '3', label: '3 \u2605' },
  { value: '4', label: '4 \u2605' },
  { value: '5', label: '5 \u2605' },
]

// ─── Existing: Validation ────────────────────────────────────────────────────

export const RelicModalController = {
  onEditOk: (selectedRelic: Relic, relic: Relic) => {
    relic.id = selectedRelic.id

    const updatedRelic = { ...selectedRelic, ...relic }

    equipmentService.upsertRelicWithEquipment(updatedRelic)

    Message.success(i18next.t('modals:Relic.Messages.EditSuccess') /* Successfully edited relic */)

    setTimeout(() => {
      SaveState.delayedSave()
      recalculatePermutations()
    }, 200)

    return updatedRelic
  },
}

function invalidValue(value?: string) {
  if (!value) return true
  return isNaN(parseFloat(value))
}

export function validateRelic(relicForm: RelicForm): Relic | void {
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
  if (substatNumber0 < 0 || substatNumber1 < 0 || substatNumber2 < 0 || substatNumber3 < 0) {
    return Message.error(t('SubTooSmall') /* Substat values should be positive */)
  }
  if (
    substatNumber0 === 0 && !relicForm.substat0IsPreview
    || substatNumber1 === 0 && !relicForm.substat1IsPreview
    || substatNumber2 === 0 && !relicForm.substat2IsPreview
    || substatNumber3 === 0 && !relicForm.substat3IsPreview
  ) {
    return Message.error(t('SubTooSmall') /* Substat values should be positive */)
  }

  if (relicForm.mainStatValue <= 0) {
    return Message.error(t('MainTooSmall') /* Main stat values should be positive */)
  }

  const relic: Relic = {
    equippedBy: relicForm.equippedBy === 'None' ? undefined : relicForm.equippedBy,
    enhance: relicForm.enhance,
    grade: relicForm.grade,
    part: relicForm.part,
    set: relicForm.set,
    main: {
      stat: relicForm.mainStatType,
      value: relicForm.mainStatValue,
    },
  } as Relic

  const substats: { value: number; stat: SubStats }[] = []
  const previewSubstats: { value: number; stat: SubStats }[] = []
  if (relicForm.substatType0 != undefined && relicForm.substatValue0 != undefined) {
    if (relicForm.substat0IsPreview) {
      previewSubstats.push({
        stat: relicForm.substatType0,
        value: relicForm.substat0IsPreview,
      })
    } else {
      substats.push({
        stat: relicForm.substatType0,
        value: substatNumber0,
      })
    }
  }
  if (relicForm.substatType1 != undefined && relicForm.substatValue1 != undefined) {
    if (relicForm.substat1IsPreview) {
      previewSubstats.push({
        stat: relicForm.substatType1,
        value: relicForm.substat1IsPreview,
      })
    } else {
      substats.push({
        stat: relicForm.substatType1,
        value: substatNumber1,
      })
    }
  }
  if (relicForm.substatType2 != undefined && relicForm.substatValue2 != undefined) {
    if (relicForm.substat2IsPreview) {
      previewSubstats.push({
        stat: relicForm.substatType2,
        value: relicForm.substat2IsPreview,
      })
    } else {
      substats.push({
        stat: relicForm.substatType2,
        value: substatNumber2,
      })
    }
  }
  if (relicForm.substatType3 != undefined && relicForm.substatValue3 != undefined) {
    if (relicForm.substat3IsPreview) {
      previewSubstats.push({
        stat: relicForm.substatType3,
        value: relicForm.substat3IsPreview,
      })
    } else {
      substats.push({
        stat: relicForm.substatType3,
        value: substatNumber3,
      })
    }
  }
  relic.substats = substats
  relic.previewSubstats = previewSubstats
  RelicAugmenter.augment(relic)

  return relic
}

// ─── Existing: Upgrade values ────────────────────────────────────────────────

export function calculateUpgradeValues(relicForm: RelicForm): RelicUpgradeValues[] {
  const statPairs: RelicFormStat[] = [
    { stat: relicForm.substatType0, value: relicForm.substatValue0, isPreview: relicForm.substat0IsPreview },
    { stat: relicForm.substatType1, value: relicForm.substatValue1, isPreview: relicForm.substat1IsPreview },
    { stat: relicForm.substatType2, value: relicForm.substatValue2, isPreview: relicForm.substat2IsPreview },
    { stat: relicForm.substatType3, value: relicForm.substatValue3, isPreview: relicForm.substat3IsPreview },
  ]

  const upgradeValues: RelicUpgradeValues[] = []

  for (let { stat, value, isPreview } of statPairs) {
    if (stat != undefined && value != undefined) {
      if (value === '') {
        value = '0'
      } else if (isNaN(parseFloat(value))) {
        upgradeValues.push({ low: undefined, mid: undefined, high: undefined })
        continue
      }

      const value10ths = truncate10ths(precisionRound(parseFloat(value)))
      const fixedValue: number = RelicRollFixer.fixSubStatValue(stat, value10ths, 5)

      const upgrades: RelicUpgradeValues = clone(SubStatValues[stat as SubStats][relicForm.grade as 5 | 4 | 3 | 2])

      if (isPreview) {
        const previewValue = RelicRollFixer.fixSubStatValue(stat, truncate10ths(precisionRound(isPreview)), 5)
        upgradeValues.push({
          high: null,
          mid: (isFlat(stat) && stat != Stats.SPD)
            ? renderFlatStat(fixedValue + previewValue)
            : renderPercentStat(fixedValue + previewValue),
          low: null,
        })

        continue
      }

      if (isFlat(stat) && stat != Stats.SPD) {
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
  return Math.floor(precisionRound(value))
}

function renderPercentStat(value: number) {
  return truncate10ths(precisionRound(value))
}
