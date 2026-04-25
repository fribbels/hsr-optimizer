import {
  type GpuExecutionContext,
  type RelicsByPart,
} from 'lib/gpu/webgpuTypes'
import {
  type PerSlotSetRanges,
  type ValidQuad,
} from 'lib/optimization/relicSetSolver'
import { BasicKey } from 'lib/optimization/basicStatsArray'
import {
  OrnamentSetToIndex,
  RelicSetToIndex,
  type SetsOrnaments,
  type SetsRelics,
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
  const threshold = gpuContext.resultsQueue.size() >= gpuContext.RESULTS_LIMIT ? gpuContext.resultsQueue.topPriority() : 0

  const buf = new ArrayBuffer(32)
  const f32 = new Float32Array(buf)
  const u32 = new Uint32Array(buf)
  f32[0] = l
  f32[1] = p
  f32[2] = f
  f32[3] = b
  f32[4] = g
  f32[5] = h
  f32[6] = threshold
  u32[7] = permLimit
  return buf
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
  xf: number, fSize: number,
}

export type FullSizes = {
  pSize: number, lSize: number,
}

export type WorkgroupEntry = {
  xh: number, hSize: number,
  xg: number, gSize: number,
  xb: number, bSize: number,
  xf: number, fSize: number,
  pSize: number, lSize: number,
  permLimit: number,
  startOffset: number,
}

export function computeTupleParams(quad: ValidQuad, ranges: PerSlotSetRanges): TupleParams {
  return {
    xh: ranges.Head.setStart[quad.sH],
    hSize: ranges.Head.setEnd[quad.sH] - ranges.Head.setStart[quad.sH],
    xg: ranges.Hands.setStart[quad.sG],
    gSize: ranges.Hands.setEnd[quad.sG] - ranges.Hands.setStart[quad.sG],
    xb: ranges.Body.setStart[quad.sB],
    bSize: ranges.Body.setEnd[quad.sB] - ranges.Body.setStart[quad.sB],
    xf: ranges.Feet.setStart[quad.sF],
    fSize: ranges.Feet.setEnd[quad.sF] - ranges.Feet.setStart[quad.sF],
  }
}

const MAX_TUPLE_WEIGHT = 2 ** 31 - 1

export function buildWorkgroupAssignments(
  tuples: TupleParams[],
  fullSizes: FullSizes,
  wgCapacity: number,
): WorkgroupEntry[] {
  const safeTuples = splitOversizedTuples(tuples, fullSizes)
  const assignments: WorkgroupEntry[] = []
  for (const t of safeTuples) {
    const weight = t.hSize * t.gSize * t.bSize * t.fSize * fullSizes.pSize * fullSizes.lSize
    const numWGs = Math.ceil(weight / wgCapacity)
    for (let wg = 0; wg < numWGs; wg++) {
      const start = wg * wgCapacity
      const limit = Math.min(wgCapacity, weight - start)
      assignments.push({
        xh: t.xh, hSize: t.hSize,
        xg: t.xg, gSize: t.gSize,
        xb: t.xb, bSize: t.bSize,
        xf: t.xf, fSize: t.fSize,
        pSize: fullSizes.pSize, lSize: fullSizes.lSize,
        permLimit: limit,
        startOffset: start,
      })
    }
  }
  return assignments
}

function splitOversizedTuples(tuples: TupleParams[], fullSizes: FullSizes): TupleParams[] {
  const result: TupleParams[] = []
  const queue = [...tuples]
  while (queue.length > 0) {
    const t = queue.pop()!
    const weight = t.hSize * t.gSize * t.bSize * t.fSize * fullSizes.pSize * fullSizes.lSize
    if (weight <= MAX_TUPLE_WEIGHT) {
      result.push(t)
      continue
    }
    const dims: { key: 'hSize' | 'gSize' | 'bSize' | 'fSize', xKey: 'xh' | 'xg' | 'xb' | 'xf' }[] = [
      { key: 'hSize', xKey: 'xh' },
      { key: 'gSize', xKey: 'xg' },
      { key: 'bSize', xKey: 'xb' },
      { key: 'fSize', xKey: 'xf' },
    ]
    const largest = dims.reduce((a, b) => t[a.key] >= t[b.key] ? a : b)
    const size = t[largest.key]
    if (size <= 1) {
      result.push(t)
      continue
    }
    const half = Math.floor(size / 2)
    queue.push({ ...t, [largest.key]: half })
    queue.push({ ...t, [largest.xKey]: t[largest.xKey] + half, [largest.key]: size - half })
  }
  return result
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
    u[off + 6] = a.xf;     u[off + 7] = a.fSize
    u[off + 8] = a.pSize;  u[off + 9] = a.lSize
    u[off + 10] = a.permLimit
    u[off + 11] = a.startOffset
    // 12-15: padding (zero)
  }
  return buf
}

function relicSetToIndex(relic: Relic) {
  if (relic.set in RelicSetToIndex) {
    return RelicSetToIndex[relic.set as SetsRelics]
  }
  return OrnamentSetToIndex[relic.set as SetsOrnaments]
}
