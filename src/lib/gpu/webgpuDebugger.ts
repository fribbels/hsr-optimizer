import { Utils } from 'lib/utils'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { GpuExecutionContext } from 'lib/gpu/webgpuTypes'

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
    WEIGHT: array[113],
    EHP: array[77],
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
  return {
    ['HP%']: array[0],
    ['ATK%']: array[1],
    ['DEF%']: array[2],
    ['SPD%']: array[3],
    ['HP']: array[4],
    ['ATK']: array[5],
    ['DEF']: array[6],
    ['SPD']: array[7],
    ['CRIT Rate']: array[8],
    ['CRIT DMG']: array[9],
    ['Effect Hit Rate']: array[10],
    ['Effect RES']: array[11],
    ['Break Effect']: array[12],
    ['Energy Regeneration Rate']: array[13],
    ['Outgoing Healing Boost']: array[14],
    ['Physical DMG Boost']: array[15],
    ['Fire DMG Boost']: array[16],
    ['Ice DMG Boost']: array[17],
    ['Lightning DMG Boost']: array[18],
    ['Wind DMG Boost']: array[19],
    ['Quantum DMG Boost']: array[20],
    ['Imaginary DMG Boost']: array[21],
    ELEMENTAL_DMG: array[22],
    BASIC_SCALING: array[23],
    SKILL_SCALING: array[24],
    ULT_SCALING: array[25],
    FUA_SCALING: array[26],
    DOT_SCALING: array[27],
    BASIC_CR_BOOST: array[28],
    SKILL_CR_BOOST: array[29],
    ULT_CR_BOOST: array[30],
    FUA_CR_BOOST: array[31],
    BASIC_CD_BOOST: array[32],
    SKILL_CD_BOOST: array[33],
    ULT_CD_BOOST: array[34],
    FUA_CD_BOOST: array[35],
    BASIC_BOOST: array[36],
    SKILL_BOOST: array[37],
    ULT_BOOST: array[38],
    FUA_BOOST: array[39],
    DOT_BOOST: array[40],
    VULNERABILITY: array[41],
    BASIC_VULNERABILITY: array[42],
    SKILL_VULNERABILITY: array[43],
    ULT_VULNERABILITY: array[44],
    FUA_VULNERABILITY: array[45],
    DOT_VULNERABILITY: array[46],
    BREAK_VULNERABILITY: array[47],
    DEF_PEN: array[48],
    BASIC_DEF_PEN: array[49],
    SKILL_DEF_PEN: array[50],
    ULT_DEF_PEN: array[51],
    FUA_DEF_PEN: array[52],
    DOT_DEF_PEN: array[53],
    BREAK_DEF_PEN: array[54],
    SUPER_BREAK_DEF_PEN: array[55],
    RES_PEN: array[56],
    PHYSICAL_RES_PEN: array[57],
    FIRE_RES_PEN: array[58],
    ICE_RES_PEN: array[59],
    LIGHTNING_RES_PEN: array[60],
    WIND_RES_PEN: array[61],
    QUANTUM_RES_PEN: array[62],
    IMAGINARY_RES_PEN: array[63],
    BASIC_RES_PEN: array[64],
    SKILL_RES_PEN: array[65],
    ULT_RES_PEN: array[66],
    FUA_RES_PEN: array[67],
    DOT_RES_PEN: array[68],
    BASIC_DMG: array[69],
    SKILL_DMG: array[70],
    ULT_DMG: array[71],
    FUA_DMG: array[72],
    DOT_DMG: array[73],
    BREAK_DMG: array[74],
    COMBO_DMG: array[75],
    DMG_RED_MULTI: array[76],
    EHP: array[77],
    DOT_CHANCE: array[78],
    EFFECT_RES_PEN: array[79],
    DOT_SPLIT: array[80],
    DOT_STACKS: array[81],
    ENEMY_WEAKNESS_BROKEN: array[82],
    SUPER_BREAK_MODIFIER: array[83],
    BASIC_SUPER_BREAK_MODIFIER: array[84],
    SUPER_BREAK_HMC_MODIFIER: array[85],
    BASIC_TOUGHNESS_DMG: array[86],
    SKILL_TOUGHNESS_DMG: array[87],
    ULT_TOUGHNESS_DMG: array[88],
    FUA_TOUGHNESS_DMG: array[89],
    BASIC_ORIGINAL_DMG_BOOST: array[90],
    SKILL_ORIGINAL_DMG_BOOST: array[91],
    ULT_ORIGINAL_DMG_BOOST: array[92],
    BASIC_BREAK_DMG_MODIFIER: array[93],
    ULT_CD_OVERRIDE: array[94],
    ULT_BOOSTS_MULTI: array[95],
    RATIO_BASED_HP_BUFF: array[96],
    RATIO_BASED_HP_P_BUFF: array[97],
    RATIO_BASED_ATK_BUFF: array[98],
    RATIO_BASED_ATK_P_BUFF: array[99],
    RATIO_BASED_DEF_BUFF: array[100],
    RATIO_BASED_DEF_P_BUFF: array[101],
    RATIO_BASED_SPD_BUFF: array[102],
    RATIO_BASED_CD_BUFF: array[103],
    BREAK_EFFICIENCY_BOOST: array[104],
    BASIC_BREAK_EFFICIENCY_BOOST: array[105],
    ULT_BREAK_EFFICIENCY_BOOST: array[106],
    BASIC_DMG_TYPE: array[107],
    SKILL_DMG_TYPE: array[108],
    ULT_DMG_TYPE: array[109],
    FUA_DMG_TYPE: array[110],
    DOT_DMG_TYPE: array[111],
    BREAK_DMG_TYPE: array[112],
    SUPER_BREAK_DMG_TYPE: array[113],
    WEIGHT: array[114],
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
