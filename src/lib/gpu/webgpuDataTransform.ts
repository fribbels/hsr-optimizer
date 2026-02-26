import {
  OrnamentSetToIndex,
  RelicSetToIndex,
  SetsOrnaments,
  SetsRelics,
  SetsRelicsNames,
} from 'lib/constants/constants'
import {
  GpuExecutionContext,
  RelicsByPart,
} from 'lib/gpu/webgpuTypes'
import { BasicKey } from 'lib/optimization/basicStatsArray'
import { StringToNumberMap } from 'types/common'
import { Relic } from 'types/relic'

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

  const l = offset % lSize
  const p = ((offset - l) / lSize) % pSize
  const f = ((offset - p * lSize - l) / (lSize * pSize)) % fSize
  const b = ((offset - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize
  const g = ((offset - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize
  const h =
    ((offset - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize))
    % hSize

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
    output[startIndex + j++] = uncondensedStats[BasicKey.HP_P] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.ATK_P] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.DEF_P] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.SPD_P] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.HP] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.ATK] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.DEF] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.SPD] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.CR] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.CD] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.EHR] || 0 // 10
    output[startIndex + j++] = uncondensedStats[BasicKey.RES] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.BE] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.ERR] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.OHB] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.PHYSICAL_DMG_BOOST] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.FIRE_DMG_BOOST] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.ICE_DMG_BOOST] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.LIGHTNING_DMG_BOOST] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.WIND_DMG_BOOST] || 0
    output[startIndex + j++] = uncondensedStats[BasicKey.QUANTUM_DMG_BOOST] || 0 // 20
    output[startIndex + j++] = uncondensedStats[BasicKey.IMAGINARY_DMG_BOOST] || 0
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
