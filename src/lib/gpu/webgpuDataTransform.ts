import { OrnamentSetToIndex, RelicSetToIndex, SetsOrnaments, SetsRelics, SetsRelicsNames, Stats } from 'lib/constants/constants'
import { GpuExecutionContext, RelicsByPart } from 'lib/gpu/webgpuTypes'
import { Key } from 'lib/optimization/computedStatsArray'
import { StringToNumberMap } from 'types/common'
import { Relic } from 'types/relic'

export const StatsToWebgpuIndex = {
  [Stats.HP_P]: 0,
  [Stats.ATK_P]: 1,
  [Stats.DEF_P]: 2,
  [Stats.SPD_P]: 3,
  [Stats.HP]: 4,
  [Stats.ATK]: 5,
  [Stats.DEF]: 6,
  [Stats.SPD]: 7,
  [Stats.CR]: 8,
  [Stats.CD]: 9,
  [Stats.EHR]: 10,
  [Stats.RES]: 11,
  [Stats.BE]: 12,
  [Stats.ERR]: 13,
  [Stats.OHB]: 14,
  [Stats.Physical_DMG]: 15,
  [Stats.Fire_DMG]: 16,
  [Stats.Ice_DMG]: 17,
  [Stats.Lightning_DMG]: 18,
  [Stats.Wind_DMG]: 19,
  [Stats.Quantum_DMG]: 20,
  [Stats.Imaginary_DMG]: 21,
}

export function generateParamsMatrix(
  device: GPUDevice,
  offset: number,
  relics: RelicsByPart,
  gpuContext: GpuExecutionContext,
) {
  const lSize = relics.LinkRope.length
  const pSize = relics.PlanarSphere.length
  const fSize = relics.Feet.length
  const bSize = relics.Body.length
  const gSize = relics.Hands.length
  const hSize = relics.Head.length

  const l = (offset % lSize)
  const p = (((offset - l) / lSize) % pSize)
  const f = (((offset - p * lSize - l) / (lSize * pSize)) % fSize)
  const b = (((offset - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize)
  const g = (((offset - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize)
  const h = (((offset - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize)

  return new Float32Array([
    l,
    p,
    f,
    b,
    g,
    h,
    gpuContext.resultsQueue.size() >= gpuContext.RESULTS_LIMIT ? (gpuContext.resultsQueue.top()?.value ?? 0) : 0,
  ])
  // return createGpuBuffer(device, new Float32Array(paramsArray), GPUBufferUsage.STORAGE)
}

export function mergeRelicsIntoArray(relics: RelicsByPart) {
  return relicsToArray([
    ...relics.Head,
    ...relics.Hands,
    ...relics.Body,
    ...relics.Feet,
    ...relics.PlanarSphere,
    ...relics.LinkRope,
  ])
}

const RELIC_ARG_SIZE = 23

function relicsToArray(relics: Relic[]) {
  const output: number[] = []
  for (let i = 0; i < relics.length; i++) {
    const relic = relics[i]
    const startIndex = RELIC_ARG_SIZE * i
    let j = 0
    const uncondensedStats: StringToNumberMap = {}
    const condensedStats: [number, number][] = relic.condensedStats!

    for (const condensedStat of condensedStats) {
      uncondensedStats[condensedStat[0]] = condensedStat[1]
    }
    output[startIndex + j++] = uncondensedStats[Key.HP_P] || 0
    output[startIndex + j++] = uncondensedStats[Key.ATK_P] || 0
    output[startIndex + j++] = uncondensedStats[Key.DEF_P] || 0
    output[startIndex + j++] = uncondensedStats[Key.SPD_P] || 0
    output[startIndex + j++] = uncondensedStats[Key.HP] || 0
    output[startIndex + j++] = uncondensedStats[Key.ATK] || 0
    output[startIndex + j++] = uncondensedStats[Key.DEF] || 0
    output[startIndex + j++] = uncondensedStats[Key.SPD] || 0
    output[startIndex + j++] = uncondensedStats[Key.CR] || 0
    output[startIndex + j++] = uncondensedStats[Key.CD] || 0
    output[startIndex + j++] = uncondensedStats[Key.EHR] || 0 // 10
    output[startIndex + j++] = uncondensedStats[Key.RES] || 0
    output[startIndex + j++] = uncondensedStats[Key.BE] || 0
    output[startIndex + j++] = uncondensedStats[Key.ERR] || 0
    output[startIndex + j++] = uncondensedStats[Key.OHB] || 0
    output[startIndex + j++] = uncondensedStats[Key.PHYSICAL_DMG_BOOST] || 0
    output[startIndex + j++] = uncondensedStats[Key.FIRE_DMG_BOOST] || 0
    output[startIndex + j++] = uncondensedStats[Key.ICE_DMG_BOOST] || 0
    output[startIndex + j++] = uncondensedStats[Key.LIGHTNING_DMG_BOOST] || 0
    output[startIndex + j++] = uncondensedStats[Key.WIND_DMG_BOOST] || 0
    output[startIndex + j++] = uncondensedStats[Key.QUANTUM_DMG_BOOST] || 0 // 20
    output[startIndex + j++] = uncondensedStats[Key.IMAGINARY_DMG_BOOST] || 0
    output[startIndex + j++] = relicSetToIndex(relic) // 22
  }

  return output
}

function relicSetToIndex(relic: Relic) {
  if (SetsRelicsNames.some((name) => name === relic.set)) {
    return RelicSetToIndex[relic.set as SetsRelics]
  }
  return OrnamentSetToIndex[relic.set as SetsOrnaments]
}
