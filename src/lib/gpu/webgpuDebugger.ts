import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { GpuExecutionContext } from 'lib/gpu/webgpuTypes'
import { Utils } from 'lib/utils'

export function logIterationTimer(i: number, gpuContext: GpuExecutionContext) {
  const endTime = new Date().getTime()
  const timeTaken = (endTime - gpuContext.startTime) / 1000
  const permsCompleted = i * gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION
  const perSec = Math.floor(permsCompleted / (timeTaken))
  console.log(`Iteration: ${i}, Time: ${timeTaken}s, Completed: ${permsCompleted}, Per sec: ${perSec.toLocaleString()}`)
}

export function debugWebgpuOutput(gpuContext: GpuExecutionContext, arrayBuffer: ArrayBuffer) {
  const array = new Float32Array(arrayBuffer)
  console.log(array)

  debugPrintWebgpuArray(array)
  debugPinOptimizerWebgpuArray(array)
}

export function debugExportWebgpuResult(array: Float32Array) {
  return {
    ED: array[22],
    BASIC: array[69],
    SKILL: array[70],
    ULT: array[71],
    FUA: array[72],
    DOT: array[73],
    BREAK: array[74],
    COMBO: array[75],
    EHP: array[77],
    HEAL: array[102],
    SHIELD: array[105],
    xHP: array[4],
    xATK: array[5],
    xDEF: array[6],
    xSPD: array[7],
    xCR: array[8],
    xCD: array[9],
    xEHR: array[10],
    xRES: array[11],
    xBE: array[12],
    xERR: array[13],
    xOHB: array[14],
    xELEMENTAL_DMG: array[22],
  }
}

export function debugPinOptimizerWebgpuArray(array: Float32Array) {
  const currentPinned = window.optimizerGrid.current!.api.getGridOption('pinnedTopRowData') ?? []
  const x = debugExportWebgpuResult(array)

  currentPinned[1] = x
  window.optimizerGrid.current!.api.updateGridOptions({ pinnedTopRowData: currentPinned })
}

export function debugWebgpuComputedStats(array: Float32Array): ComputedStatsObject {
  let i = 0
  return {
    ['HP%']: array[i++],
    ['ATK%']: array[i++],
    ['DEF%']: array[i++],
    ['SPD%']: array[i++],
    ['HP']: array[i++],
    ['ATK']: array[i++],
    ['DEF']: array[i++],
    ['SPD']: array[i++],
    ['CRIT Rate']: array[i++],
    ['CRIT DMG']: array[i++],
    ['Effect Hit Rate']: array[i++],
    ['Effect RES']: array[i++],
    ['Break Effect']: array[i++],
    ['Energy Regeneration Rate']: array[i++],
    ['Outgoing Healing Boost']: array[i++],
    ['Physical DMG Boost']: array[i++],
    ['Fire DMG Boost']: array[i++],
    ['Ice DMG Boost']: array[i++],
    ['Lightning DMG Boost']: array[i++],
    ['Wind DMG Boost']: array[i++],
    ['Quantum DMG Boost']: array[i++],
    ['Imaginary DMG Boost']: array[i++],
    ELEMENTAL_DMG: array[i++],
    BASIC_SCALING: array[i++],
    SKILL_SCALING: array[i++],
    ULT_SCALING: array[i++],
    FUA_SCALING: array[i++],
    DOT_SCALING: array[i++],
    BASIC_CR_BOOST: array[i++],
    SKILL_CR_BOOST: array[i++],
    ULT_CR_BOOST: array[i++],
    FUA_CR_BOOST: array[i++],
    BASIC_CD_BOOST: array[i++],
    SKILL_CD_BOOST: array[i++],
    ULT_CD_BOOST: array[i++],
    FUA_CD_BOOST: array[i++],
    BASIC_BOOST: array[i++],
    SKILL_BOOST: array[i++],
    ULT_BOOST: array[i++],
    FUA_BOOST: array[i++],
    DOT_BOOST: array[i++],
    VULNERABILITY: array[i++],
    BASIC_VULNERABILITY: array[i++],
    SKILL_VULNERABILITY: array[i++],
    ULT_VULNERABILITY: array[i++],
    FUA_VULNERABILITY: array[i++],
    DOT_VULNERABILITY: array[i++],
    BREAK_VULNERABILITY: array[i++],
    DEF_PEN: array[i++],
    BASIC_DEF_PEN: array[i++],
    SKILL_DEF_PEN: array[i++],
    ULT_DEF_PEN: array[i++],
    FUA_DEF_PEN: array[i++],
    DOT_DEF_PEN: array[i++],
    BREAK_DEF_PEN: array[i++],
    SUPER_BREAK_DEF_PEN: array[i++],
    RES_PEN: array[i++],
    PHYSICAL_RES_PEN: array[i++],
    FIRE_RES_PEN: array[i++],
    ICE_RES_PEN: array[i++],
    LIGHTNING_RES_PEN: array[i++],
    WIND_RES_PEN: array[i++],
    QUANTUM_RES_PEN: array[i++],
    IMAGINARY_RES_PEN: array[i++],
    BASIC_RES_PEN: array[i++],
    SKILL_RES_PEN: array[i++],
    ULT_RES_PEN: array[i++],
    FUA_RES_PEN: array[i++],
    DOT_RES_PEN: array[i++],
    BASIC_DMG: array[i++],
    SKILL_DMG: array[i++],
    ULT_DMG: array[i++],
    FUA_DMG: array[i++],
    DOT_DMG: array[i++],
    BREAK_DMG: array[i++],
    COMBO_DMG: array[i++],
    DMG_RED_MULTI: array[i++],
    EHP: array[i++],
    DOT_CHANCE: array[i++],
    EFFECT_RES_PEN: array[i++],
    DOT_SPLIT: array[i++],
    DOT_STACKS: array[i++],
    SUMMONS: array[i++],
    ENEMY_WEAKNESS_BROKEN: array[i++],
    SUPER_BREAK_MODIFIER: array[i++],
    BASIC_SUPER_BREAK_MODIFIER: array[i++],
    SUPER_BREAK_HMC_MODIFIER: array[i++],
    BASIC_TOUGHNESS_DMG: array[i++],
    SKILL_TOUGHNESS_DMG: array[i++],
    ULT_TOUGHNESS_DMG: array[i++],
    FUA_TOUGHNESS_DMG: array[i++],
    BASIC_ORIGINAL_DMG_BOOST: array[i++],
    SKILL_ORIGINAL_DMG_BOOST: array[i++],
    ULT_ORIGINAL_DMG_BOOST: array[i++],
    BASIC_BREAK_DMG_MODIFIER: array[i++],
    ULT_ADDITIONAL_DMG_CR_OVERRIDE: array[i++],
    ULT_ADDITIONAL_DMG_CD_OVERRIDE: array[i++],
    SKILL_OHB: array[i++],
    ULT_OHB: array[i++],
    HEAL_TYPE: array[i++],
    HEAL_FLAT: array[i++],
    HEAL_SCALING: array[i++],
    HEAL_VALUE: array[i++],
    SHIELD_FLAT: array[i++],
    SHIELD_SCALING: array[i++],
    SHIELD_VALUE: array[i++],
    BASIC_ADDITIONAL_DMG_SCALING: array[i++],
    SKILL_ADDITIONAL_DMG_SCALING: array[i++],
    ULT_ADDITIONAL_DMG_SCALING: array[i++],
    FUA_ADDITIONAL_DMG_SCALING: array[i++],
    BASIC_ADDITIONAL_DMG: array[i++],
    SKILL_ADDITIONAL_DMG: array[i++],
    ULT_ADDITIONAL_DMG: array[i++],
    FUA_ADDITIONAL_DMG: array[i++],
    RATIO_BASED_HP_BUFF: array[i++],
    RATIO_BASED_HP_P_BUFF: array[i++],
    RATIO_BASED_ATK_BUFF: array[i++],
    RATIO_BASED_ATK_P_BUFF: array[i++],
    RATIO_BASED_DEF_BUFF: array[i++],
    RATIO_BASED_DEF_P_BUFF: array[i++],
    RATIO_BASED_SPD_BUFF: array[i++],
    RATIO_BASED_CD_BUFF: array[i++],
    BREAK_EFFICIENCY_BOOST: array[i++],
    BASIC_BREAK_EFFICIENCY_BOOST: array[i++],
    ULT_BREAK_EFFICIENCY_BOOST: array[i++],
    BASIC_DMG_TYPE: array[i++],
    SKILL_DMG_TYPE: array[i++],
    ULT_DMG_TYPE: array[i++],
    FUA_DMG_TYPE: array[i++],
    DOT_DMG_TYPE: array[i++],
    BREAK_DMG_TYPE: array[i++],
    SUPER_BREAK_DMG_TYPE: array[i++],
  } as ComputedStatsObject
}

// export type WebgpuComputedStats = ReturnType<typeof debugWebgpuComputedStats>

export function debugPrintWebgpuArray(array: Float32Array) {
  const computedStats = debugWebgpuComputedStats(array)
  for (const [key, value] of Object.entries(computedStats)) {
    if (typeof value === 'number') {
      computedStats[key] = fixed(value)
    }
  }
  console.log(debugWebgpuComputedStats(array))
}

function fixed(n: number) {
  return Utils.precisionRound(n, 5) || ''
}
