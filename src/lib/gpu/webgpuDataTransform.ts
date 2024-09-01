import { Relic } from 'types/Relic'
import { createGpuBuffer, GpuExecutionContext } from 'lib/gpu/webgpuInternals'
import { Constants, OrnamentSetToIndex, RelicSetToIndex, SetsRelicsNames, Stats } from 'lib/constants'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { StringToNumberMap } from 'types/Common'

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
  paramsArray: number[],
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

  paramsArray[6] = l
  paramsArray[7] = p
  paramsArray[8] = f
  paramsArray[9] = b
  paramsArray[10] = g
  paramsArray[11] = h
  paramsArray[12] = gpuContext.resultsQueue.top()?.value ?? 0

  return createGpuBuffer(device, new Float32Array(paramsArray), GPUBufferUsage.STORAGE)
}

export type RelicsByPart = {
  LinkRope: Relic[]
  PlanarSphere: Relic[]
  Feet: Relic[]
  Body: Relic[]
  Hands: Relic[]
  Head: Relic[]
}

export function generateBaseParamsArray(relics: RelicsByPart, params: OptimizerParams) {
  const paramsArray = [
    relics.LinkRope.length,
    relics.PlanarSphere.length,
    relics.Feet.length,
    relics.Body.length,
    relics.Hands.length,
    relics.Head.length,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    Object.keys(Constants.SetsRelics).length,
    Object.keys(Constants.SetsOrnaments).length, // 13
  ]

  for (const stat of Object.values(Constants.Stats)) {
    paramsArray[15 + StatsToWebgpuIndex[stat]] = params.character.base[stat]
  }
  for (const stat of Object.values(Constants.Stats)) {
    paramsArray[37 + StatsToWebgpuIndex[stat]] = params.character.lightCone[stat]
  }
  for (const stat of Object.values(Constants.Stats)) {
    paramsArray[59 + StatsToWebgpuIndex[stat]] = params.character.traces[stat]
  }

  return paramsArray
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

const RELIC_ARG_SIZE = 24

function relicsToArray(relics: Relic[]) {
  const output: number[] = []
  for (let i = 0; i < relics.length; i++) {
    const relic = relics[i]
    const startIndex = RELIC_ARG_SIZE * i
    let j = 0
    const uncondensedStats: StringToNumberMap = {}

    // @ts-expect-error This is a custom relic type with modified stats
    const condensedStats: StringToNumberMap[] = relic.condensedStats

    for (const condensedStat of condensedStats) {
      uncondensedStats[condensedStat[0]] = condensedStat[1]
    }
    output[startIndex + j++] = uncondensedStats[Stats.HP_P] || 0
    output[startIndex + j++] = uncondensedStats[Stats.ATK_P] || 0
    output[startIndex + j++] = uncondensedStats[Stats.DEF_P] || 0
    output[startIndex + j++] = uncondensedStats[Stats.SPD_P] || 0
    output[startIndex + j++] = uncondensedStats[Stats.HP] || 0
    output[startIndex + j++] = uncondensedStats[Stats.ATK] || 0
    output[startIndex + j++] = uncondensedStats[Stats.DEF] || 0
    output[startIndex + j++] = uncondensedStats[Stats.SPD] || 0
    output[startIndex + j++] = uncondensedStats[Stats.CR] || 0
    output[startIndex + j++] = uncondensedStats[Stats.CD] || 0
    output[startIndex + j++] = uncondensedStats[Stats.EHR] || 0 // 10
    output[startIndex + j++] = uncondensedStats[Stats.RES] || 0
    output[startIndex + j++] = uncondensedStats[Stats.BE] || 0
    output[startIndex + j++] = uncondensedStats[Stats.ERR] || 0
    output[startIndex + j++] = uncondensedStats[Stats.OHB] || 0
    output[startIndex + j++] = uncondensedStats[Stats.Physical_DMG] || 0
    output[startIndex + j++] = uncondensedStats[Stats.Fire_DMG] || 0
    output[startIndex + j++] = uncondensedStats[Stats.Ice_DMG] || 0
    output[startIndex + j++] = uncondensedStats[Stats.Lightning_DMG] || 0
    output[startIndex + j++] = uncondensedStats[Stats.Wind_DMG] || 0
    output[startIndex + j++] = uncondensedStats[Stats.Quantum_DMG] || 0 // 20
    output[startIndex + j++] = uncondensedStats[Stats.Imaginary_DMG] || 0
    output[startIndex + j++] = relicSetToIndex(relic)
    output[startIndex + j++] = relic.weightScore // 23
  }

  return output
}

function relicSetToIndex(relic: Relic) {
  if (SetsRelicsNames.includes(relic.set)) {
    return RelicSetToIndex[relic.set]
  }
  return OrnamentSetToIndex[relic.set]
}
