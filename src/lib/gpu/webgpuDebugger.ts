import { Utils } from 'lib/utils'
import { GpuExecutionContext } from 'lib/gpu/webgpuInternals'

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

export function debugPrintWebgpuArray(array: Float32Array) {
  console.log('HP_P', fixed(array[0]))
  console.log('ATK_P', fixed(array[1]))
  console.log('DEF_P', fixed(array[2]))
  console.log('SPD_P', fixed(array[3]))
  console.log('HP', fixed(array[4]))
  console.log('ATK', fixed(array[5]))
  console.log('DEF', fixed(array[6]))
  console.log('SPD', fixed(array[7]))
  console.log('CR', fixed(array[8]))
  console.log('CD', fixed(array[9]))
  console.log('EHR', fixed(array[10]))
  console.log('RES', fixed(array[11]))
  console.log('BE', fixed(array[12]))
  console.log('ERR', fixed(array[13]))
  console.log('OHB', fixed(array[14]))

  console.log('Physical_DMG', fixed(array[15]))
  console.log('Fire_DMG', fixed(array[16]))
  console.log('Ice_DMG', fixed(array[17]))
  console.log('Lightning_DMG', fixed(array[18]))
  console.log('Wind_DMG', fixed(array[19]))
  console.log('Quantum_DMG', fixed(array[20]))
  console.log('Imaginary_DMG', fixed(array[21]))
  console.log('ELEMENTAL_DMG', fixed(array[22]))
  console.log('BASIC_SCALING', fixed(array[23]))
  console.log('SKILL_SCALING', fixed(array[24]))
  console.log('ULT_SCALING', fixed(array[25]))
  console.log('FUA_SCALING', fixed(array[26]))
  console.log('DOT_SCALING', fixed(array[27]))
  console.log('BASIC_CR_BOOST', fixed(array[28]))
  console.log('SKILL_CR_BOOST', fixed(array[29]))
  console.log('ULT_CR_BOOST', fixed(array[30]))
  console.log('FUA_CR_BOOST', fixed(array[31]))
  console.log('BASIC_CD_BOOST', fixed(array[32]))
  console.log('SKILL_CD_BOOST', fixed(array[33]))
  console.log('ULT_CD_BOOST', fixed(array[34]))
  console.log('FUA_CD_BOOST', fixed(array[35]))
  console.log('BASIC_BOOST', fixed(array[36]))
  console.log('SKILL_BOOST', fixed(array[37]))
  console.log('ULT_BOOST', fixed(array[38]))
  console.log('FUA_BOOST', fixed(array[39]))
  console.log('DOT_BOOST', fixed(array[40]))
  console.log('VULNERABILITY', fixed(array[41]))
  console.log('BASIC_VULNERABILITY', fixed(array[42]))
  console.log('SKILL_VULNERABILITY', fixed(array[43]))
  console.log('ULT_VULNERABILITY', fixed(array[44]))
  console.log('FUA_VULNERABILITY', fixed(array[45]))
  console.log('DOT_VULNERABILITY', fixed(array[46]))

  console.log('BREAK_VULNERABILITY', fixed(array[47]))
  console.log('DEF_PEN', fixed(array[48]))
  console.log('BASIC_DEF_PEN', fixed(array[49]))
  console.log('SKILL_DEF_PEN', fixed(array[50]))
  console.log('ULT_DEF_PEN', fixed(array[51]))
  console.log('FUA_DEF_PEN', fixed(array[52]))
  console.log('DOT_DEF_PEN', fixed(array[53]))
  console.log('BREAK_DEF_PEN', fixed(array[54]))
  console.log('SUPER_BREAK_DEF_PEN', fixed(array[55]))
  console.log('RES_PEN', fixed(array[56]))
  console.log('PHYSICAL_RES_PEN', fixed(array[57]))
  console.log('FIRE_RES_PEN', fixed(array[58]))
  console.log('ICE_RES_PEN', fixed(array[59]))
  console.log('LIGHTNING_RES_PEN', fixed(array[60]))
  console.log('WIND_RES_PEN', fixed(array[61]))
  console.log('QUANTUM_RES_PEN', fixed(array[62]))
  console.log('IMAGINARY_RES_PEN', fixed(array[63]))
  console.log('BASIC_RES_PEN', fixed(array[64]))
  console.log('SKILL_RES_PEN', fixed(array[65]))
  console.log('ULT_RES_PEN', fixed(array[66]))
  console.log('FUA_RES_PEN', fixed(array[67]))
  console.log('DOT_RES_PEN', fixed(array[68]))
  console.log('BASIC_DMG', fixed(array[69]))
  console.log('SKILL_DMG', fixed(array[70]))
  console.log('ULT_DMG', fixed(array[71]))
  console.log('FUA_DMG', fixed(array[72]))
  console.log('DOT_DMG', fixed(array[73]))
  console.log('BREAK_DMG', fixed(array[74]))
  console.log('COMBO_DMG', fixed(array[75]))
  console.log('DMG_RED_MULTI', fixed(array[76]))
  console.log('EHP', fixed(array[77]))

  console.log('DOT_CHANCE', fixed(array[78]))
  console.log('EFFECT_RES_PEN', fixed(array[79]))
  console.log('DOT_SPLIT', fixed(array[80]))
  console.log('DOT_STACKS', fixed(array[81]))
  console.log('ENEMY_WEAKNESS_BROKEN', fixed(array[82]))
  console.log('SUPER_BREAK_MODIFIER', fixed(array[83]))
  console.log('SUPER_BREAK_HMC_MODIFIER', fixed(array[84]))
  console.log('BASIC_TOUGHNESS_DMG', fixed(array[85]))
  console.log('SKILL_TOUGHNESS_DMG', fixed(array[86]))
  console.log('ULT_TOUGHNESS_DMG', fixed(array[87]))
  console.log('FUA_TOUGHNESS_DMG', fixed(array[88]))
  console.log('BASIC_ORIGINAL_DMG_BOOST', fixed(array[89]))
  console.log('SKILL_ORIGINAL_DMG_BOOST', fixed(array[90]))
  console.log('ULT_ORIGINAL_DMG_BOOST', fixed(array[91]))
  console.log('BASIC_BREAK_DMG_MODIFIER', fixed(array[92]))
  console.log('ULT_CD_OVERRIDE', fixed(array[93]))
  console.log('ULT_BOOSTS_MULTI', fixed(array[94]))
  console.log('RATIO_BASED_HP_BUFF', fixed(array[95]))
  console.log('RATIO_BASED_HP_P_BUFF', fixed(array[96]))
  console.log('RATIO_BASED_ATK_BUFF', fixed(array[97]))
  console.log('RATIO_BASED_ATK_P_BUFF', fixed(array[98]))
  console.log('RATIO_BASED_DEF_BUFF', fixed(array[99]))
  console.log('RATIO_BASED_DEF_P_BUFF', fixed(array[100]))
  console.log('RATIO_BASED_SPD_BUFF', fixed(array[101]))
  console.log('RATIO_BASED_CD_BUFF', fixed(array[102]))
  console.log('BREAK_EFFICIENCY_BOOST', fixed(array[103]))
  console.log('BASIC_BREAK_EFFICIENCY_BOOST', fixed(array[104]))
  console.log('ULT_BREAK_EFFICIENCY_BOOST', fixed(array[105]))
  console.log('BASIC_DMG_TYPE', fixed(array[106]))
  console.log('SKILL_DMG_TYPE', fixed(array[107]))
  console.log('ULT_DMG_TYPE', fixed(array[108]))
  console.log('FUA_DMG_TYPE', fixed(array[109]))
  console.log('DOT_DMG_TYPE', fixed(array[110]))
  console.log('BREAK_DMG_TYPE', fixed(array[111]))
  console.log('SUPER_BREAK_DMG_TYPE', fixed(array[112]))
  console.log('WEIGHT', fixed(array[113]))
}

function fixed(n: number) {
  return Utils.precisionRound(n, 5) || ''
}
