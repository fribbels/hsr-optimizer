import {
  type GpuExecutionContext,
  type RelicsByPart,
} from 'lib/gpu/webgpuTypes'
import {
  type PerSlotSetRanges,
  type ValidTriple,
} from 'lib/optimization/relicSetSolver'
import { BasicKey } from 'lib/optimization/basicStatsArray'
import {
  OrnamentSetToIndex,
  RelicSetToIndex,
  type SetsOrnaments,
  type SetsRelics,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import { type StringToNumberMap } from 'types/common'
import { type Relic } from 'types/relic'

export function generateParamsMatrix(
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
  const c1 = (offset - l) / lSize
  const p = c1 % pSize
  const c2 = (c1 - p) / pSize
  const f = c2 % fSize
  const c3 = (c2 - f) / fSize
  const b = c3 % bSize
  const c4 = (c3 - b) / bSize
  const g = c4 % gSize
  const h = (c4 - g) / gSize

  const permStride = gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION
  const permLimit = Math.min(permStride, gpuContext.permutations - offset)

  return new Float32Array([
    l,
    p,
    f,
    b,
    g,
    h,
    gpuContext.resultsQueue.size() >= gpuContext.RESULTS_LIMIT ? gpuContext.resultsQueue.topPriority() : 0,
    permLimit,
  ])
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
    output[startIndex + j++] = 0 // 23: vec4 padding
  }

  return output
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tuple dispatch: workgroup assignment builder
// ═══════════════════════════════════════════════════════════════════════════════

export type TupleParams = {
  xh: number, hSize: number,
  xg: number, gSize: number,
  xb: number, bSize: number,
}

export type FullSizes = {
  F: number, P: number, L: number,
}

export type WorkgroupEntry = {
  xh: number, hSize: number,
  xg: number, gSize: number,
  xb: number, bSize: number,
  fSize: number, pSize: number, lSize: number,
  permLimit: number,
  startOffset: number,
}

export function computeTupleParams(triple: ValidTriple, ranges: PerSlotSetRanges): TupleParams {
  return {
    xh: ranges.Head.setStart[triple.sH],
    hSize: ranges.Head.setEnd[triple.sH] - ranges.Head.setStart[triple.sH],
    xg: ranges.Hands.setStart[triple.sG],
    gSize: ranges.Hands.setEnd[triple.sG] - ranges.Hands.setStart[triple.sG],
    xb: ranges.Body.setStart[triple.sB],
    bSize: ranges.Body.setEnd[triple.sB] - ranges.Body.setStart[triple.sB],
  }
}

export function buildWorkgroupAssignments(
  tuples: TupleParams[],
  fullSizes: FullSizes,
  wgCapacity: number,
): WorkgroupEntry[] {
  const assignments: WorkgroupEntry[] = []
  for (const t of tuples) {
    const weight = t.hSize * t.gSize * t.bSize * fullSizes.F * fullSizes.P * fullSizes.L
    const numWGs = Math.ceil(weight / wgCapacity)
    for (let wg = 0; wg < numWGs; wg++) {
      const start = wg * wgCapacity
      const limit = Math.min(wgCapacity, weight - start)
      assignments.push({
        xh: t.xh, hSize: t.hSize,
        xg: t.xg, gSize: t.gSize,
        xb: t.xb, bSize: t.bSize,
        fSize: fullSizes.F, pSize: fullSizes.P, lSize: fullSizes.L,
        permLimit: limit,
        startOffset: start,
      })
    }
  }
  return assignments
}

const ASSIGNMENT_ENTRY_U32S = 16

export function serializeAssignments(assignments: WorkgroupEntry[]): ArrayBuffer {
  const buf = new ArrayBuffer(assignments.length * ASSIGNMENT_ENTRY_U32S * 4)
  const u = new Uint32Array(buf)
  for (let i = 0; i < assignments.length; i++) {
    const a = assignments[i]
    const off = i * ASSIGNMENT_ENTRY_U32S
    u[off + 0] = a.xh;     u[off + 1] = a.hSize
    u[off + 2] = a.xg;     u[off + 3] = a.gSize
    u[off + 4] = a.xb;     u[off + 5] = a.bSize
    u[off + 6] = a.fSize;  u[off + 7] = a.pSize;  u[off + 8] = a.lSize
    u[off + 9] = a.permLimit
    u[off + 10] = a.startOffset
    // 11-15: padding (zero)
  }
  return buf
}

function relicSetToIndex(relic: Relic) {
  if (SetsRelicsNames.some((name) => name === relic.set)) {
    return RelicSetToIndex[relic.set as SetsRelics]
  }
  return OrnamentSetToIndex[relic.set as SetsOrnaments]
}
