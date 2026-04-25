import {
  Constants,
  Parts,
  RelicSetFilterOptions,
} from 'lib/constants/constants'
import type { RelicsByPart } from 'lib/gpu/webgpuTypes'
import type { PartCountsBySet } from 'lib/relics/relicFilters'
import {
  OrnamentSetToIndex,
  RelicSetToIndex,
  SetsOrnaments,
  SetsOrnamentsNames,
  SetsRelics,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import {
  arrayOfValue,
  arrayOfZeroes,
} from 'lib/utils/arrayUtils'
import { type Form } from 'types/form'
import { type Relic } from 'types/relic'

// Here be dragons
export function generateRelicSetSolutions(request: Form) {
  // Init
  const len = SetsRelicsNames.length
  const setRequest = request.relicSets || []
  const setIndices: number[][] = []

  for (const setArr of setRequest) {
    if (setArr[0] == RelicSetFilterOptions.relic4Piece) {
      if (setArr.length == 2) {
        // Specific 4 piece
        const index = RelicSetToIndex[setArr[1]]
        const arr: number[] = arrayOfZeroes(len)
        arr[index] = 4
        const indices = relicSetAllowListToIndices(arr)
        setIndices.push(indices)
      }
    }

    if (setArr[0] == RelicSetFilterOptions.relic2PlusAny) {
      if (setArr.length == 2) {
        const index = RelicSetToIndex[setArr[1]]
        for (let i = 0; i < len; i++) {
          const arr: number[] = arrayOfZeroes(len)
          arr[index] = 2
          arr[i] += 2
          const indices = relicSetAllowListToIndices(arr)
          setIndices.push(indices)
        }

        // 2 + 0
        const arr: number[] = arrayOfZeroes(len)
        arr[index] = 2
        const indices = relicSetAllowListToIndices(arr)
        const filledIndices = fillRelicSetArrPossibilities(indices, len)
        setIndices.push(...filledIndices)
      }
    }

    if (setArr[0] == RelicSetFilterOptions.relic2Plus2Piece) {
      if (setArr.length == 3) {
        const arr: number[] = arrayOfZeroes(len)
        const index1 = RelicSetToIndex[setArr[1]]
        const index2 = RelicSetToIndex[setArr[2]]
        arr[index1] += 2
        arr[index2] += 2
        const indices = relicSetAllowListToIndices(arr)
        setIndices.push(indices)
      }
    }

    if (setArr[0] == RelicSetFilterOptions.relic2Plus2Any) {
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const arr: number[] = arrayOfZeroes(len)
          arr[i] = 2
          arr[j] = 2
          const indices = relicSetAllowListToIndices(arr)
          setIndices.push(indices)
        }
      }
    }
  }

  return convertRelicSetIndicesTo1D(setIndices)
}

export function generateOrnamentSetSolutions(request: Form) {
  const setRequest = request.ornamentSets || []
  const len = SetsOrnamentsNames.length

  if (setRequest.length == 0) {
    return arrayOfValue(len * len, 1)
  }

  const arr = arrayOfZeroes(len * len)
  for (const set of setRequest) {
    const setIndex = OrnamentSetToIndex[set]
    const index1D = setIndex + setIndex * len
    arr[index1D] = 1
  }

  return arr
}

// [0, 0, 0, 2, 0, 2] => [3, 3, 5, 5]
function relicSetAllowListToIndices(arr: number[]) {
  const out: number[] = []
  for (let i = 0; i < arr.length; i++) {
    while (arr[i]) {
      arr[i]--
      out.push(i)
    }
  }

  return out
}

// [5, 5] => [[5,5,0,0], [5,5,0,1], [5,5,1,1], [5,5,1,2], ...]
function fillRelicSetArrPossibilities(arr: number[], len: number) {
  const out: number[][] = []
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len; j++) {
      const newArr: number[] = arrayOfZeroes(4)
      newArr[0] = arr[0]
      newArr[1] = arr[1]
      newArr[2] = i
      newArr[3] = j

      out.push(newArr)
    }
  }

  return out
}

// [[5,5,0,0], [5,5,0,1], [5,5,1,1], [5,5,1,2], ...] => [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0..]
function convertRelicSetIndicesTo1D(setIndices: number[][]) {
  const len = SetsRelicsNames.length
  if (setIndices.length == 0) {
    return arrayOfValue(Math.pow(len, 4), 1)
  }

  const arr = arrayOfZeroes(Math.pow(len, 4))

  for (let i = 0; i < setIndices.length; i++) {
    const y = setIndices[i] // [5,5,2,3]
    const permutations = permutator(y)
    for (const x of permutations) {
      const index1D = encodeRelicSetKey(x[0], x[1], x[2], x[3])
      arr[index1D] = 1
    }
  }

  return arr
}

/**
 * Counts valid relic+ornament permutations accounting for set constraints.
 * Sums `Head[h] × Hands[g] × Body[b] × Feet[f]` over valid (h,g,b,f) set-tuples.
 */
export function computeValidPermutationCount(
  countsBySet: PartCountsBySet,
  relicSetSolutions: number[],
  ornamentSetSolutions: number[],
): number {
  const parts = computeValidPermutationParts(countsBySet, relicSetSolutions, ornamentSetSolutions)
  return parts.relicValid * parts.ornamentValid
}

/**
 * Returns relic and ornament valid counts separately (used by zero-permutation diagnostics).
 */
export function computeValidPermutationParts(
  countsBySet: PartCountsBySet,
  relicSetSolutions: number[],
  ornamentSetSolutions: number[],
): { relicValid: number, ornamentValid: number } {
  const relicLen = SetsRelicsNames.length
  const ornLen = SetsOrnamentsNames.length

  const cHead = countsBySet[Parts.Head]
  const cHands = countsBySet[Parts.Hands]
  const cBody = countsBySet[Parts.Body]
  const cFeet = countsBySet[Parts.Feet]
  const cSphere = countsBySet[Parts.PlanarSphere]
  const cRope = countsBySet[Parts.LinkRope]

  let relicValid = 0
  for (let h = 0; h < relicLen; h++) {
    const vH = cHead[h]
    if (!vH) continue
    for (let g = 0; g < relicLen; g++) {
      const vG = cHands[g]
      if (!vG) continue
      for (let b = 0; b < relicLen; b++) {
        const vB = cBody[b]
        if (!vB) continue
        for (let f = 0; f < relicLen; f++) {
          const vF = cFeet[f]
          if (!vF) continue
          const key = encodeRelicSetKey(h, g, b, f)
          if (relicSetSolutions[key] !== 1) continue
          relicValid += vH * vG * vB * vF
        }
      }
    }
  }

  let ornamentValid = 0
  for (let p = 0; p < ornLen; p++) {
    const vP = cSphere[p]
    if (!vP) continue
    for (let l = 0; l < ornLen; l++) {
      const vL = cRope[l]
      if (!vL) continue
      const key = p + l * ornLen
      if (ornamentSetSolutions[key] !== 1) continue
      ornamentValid += vP * vL
    }
  }

  return { relicValid, ornamentValid }
}

// Encodes a (Head, Hands, Body, Feet) set-index 4-tuple into a flat index for relicSetSolutions.
// Safe regardless of dimension order because relicSetSolutions is permutation-invariant.
function encodeRelicSetKey(sH: number, sG: number, sB: number, sF: number): number {
  const R = SetsRelicsNames.length
  return sH + sG * R + sB * R * R + sF * R * R * R
}

// ═══════════════════════════════════════════════════════════════════════════════
// Semi-join reduction: eliminate relics whose set can't appear in any valid tuple
// ═══════════════════════════════════════════════════════════════════════════════

export function applySemiJoinReduction(
  relics: RelicsByPart,
  relicSetSolutions: number[],
  ornamentSetSolutions: number[],
): RelicsByPart {
  const R = SetsRelicsNames.length
  const O = SetsOrnamentsNames.length

  // Project valid relic set indices per slot
  const validH = new Uint8Array(R)
  const validG = new Uint8Array(R)
  const validB = new Uint8Array(R)
  const validF = new Uint8Array(R)

  for (let sH = 0; sH < R; sH++) {
    for (let sG = 0; sG < R; sG++) {
      for (let sB = 0; sB < R; sB++) {
        for (let sF = 0; sF < R; sF++) {
          if (relicSetSolutions[encodeRelicSetKey(sH, sG, sB, sF)] === 1) {
            validH[sH] = 1
            validG[sG] = 1
            validB[sB] = 1
            validF[sF] = 1
          }
        }
      }
    }
  }

  // Project valid ornament set indices per slot (P, L)
  // Key encoding: sP + sL*O
  const validP = new Uint8Array(O)
  const validL = new Uint8Array(O)

  for (let sP = 0; sP < O; sP++) {
    for (let sL = 0; sL < O; sL++) {
      const key = sP + sL * O
      if (ornamentSetSolutions[key] === 1) {
        validP[sP] = 1
        validL[sL] = 1
      }
    }
  }

  const filterRelic = (r: Relic, valid: Uint8Array) => valid[RelicSetToIndex[r.set as SetsRelics]] === 1
  const filterOrnament = (r: Relic, valid: Uint8Array) => valid[OrnamentSetToIndex[r.set as SetsOrnaments]] === 1

  const filtered: RelicsByPart = {
    Head: relics.Head.filter((r) => filterRelic(r, validH)),
    Hands: relics.Hands.filter((r) => filterRelic(r, validG)),
    Body: relics.Body.filter((r) => filterRelic(r, validB)),
    Feet: relics.Feet.filter((r) => filterRelic(r, validF)),
    PlanarSphere: relics.PlanarSphere.filter((r) => filterOrnament(r, validP)),
    LinkRope: relics.LinkRope.filter((r) => filterOrnament(r, validL)),
  }

  return filtered
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tuple dispatch: set ranges + valid triple enumeration
// ═══════════════════════════════════════════════════════════════════════════════

export type SetRanges = { setStart: Int32Array, setEnd: Int32Array }

export type PerSlotSetRanges = {
  Head: SetRanges,
  Hands: SetRanges,
  Body: SetRanges,
  Feet: SetRanges,
  PlanarSphere: SetRanges,
  LinkRope: SetRanges,
}

function buildSetRangesForSlot(
  sortedRelics: Relic[],
  setIndexOf: (set: string) => number,
  setCount: number,
): SetRanges {
  const setStart = new Int32Array(setCount).fill(-1)
  const setEnd = new Int32Array(setCount).fill(-1)
  for (let i = 0; i < sortedRelics.length; i++) {
    const s = setIndexOf(sortedRelics[i].set)
    if (setStart[s] === -1) setStart[s] = i
    setEnd[s] = i + 1
  }
  return { setStart, setEnd }
}

export function buildPerSlotSetRanges(relics: RelicsByPart): PerSlotSetRanges {
  const relicSetCount = SetsRelicsNames.length
  const ornamentSetCount = SetsOrnamentsNames.length
  const relicIdx = (set: string) => RelicSetToIndex[set as SetsRelics]
  const ornIdx = (set: string) => OrnamentSetToIndex[set as SetsOrnaments]

  return {
    Head: buildSetRangesForSlot(relics.Head, relicIdx, relicSetCount),
    Hands: buildSetRangesForSlot(relics.Hands, relicIdx, relicSetCount),
    Body: buildSetRangesForSlot(relics.Body, relicIdx, relicSetCount),
    Feet: buildSetRangesForSlot(relics.Feet, relicIdx, relicSetCount),
    PlanarSphere: buildSetRangesForSlot(relics.PlanarSphere, ornIdx, ornamentSetCount),
    LinkRope: buildSetRangesForSlot(relics.LinkRope, ornIdx, ornamentSetCount),
  }
}

export type ValidQuad = { sH: number, sG: number, sB: number, sF: number }

export function enumerateValidQuadsD4(
  relicSetSolutions: number[],
  ranges: PerSlotSetRanges,
): ValidQuad[] {
  const R = SetsRelicsNames.length
  const out: ValidQuad[] = []
  for (let sH = 0; sH < R; sH++) {
    if (ranges.Head.setStart[sH] < 0) continue
    for (let sG = 0; sG < R; sG++) {
      if (ranges.Hands.setStart[sG] < 0) continue
      for (let sB = 0; sB < R; sB++) {
        if (ranges.Body.setStart[sB] < 0) continue
        for (let sF = 0; sF < R; sF++) {
          if (ranges.Feet.setStart[sF] < 0) continue
          if (relicSetSolutions[encodeRelicSetKey(sH, sG, sB, sF)] === 1) {
            out.push({ sH, sG, sB, sF })
          }
        }
      }
    }
  }
  return out
}

export function bitpackBooleanArray(arr: number[]) {
  const paddedLength = Math.ceil(arr.length / 32) * 32
  const result: number[] = []
  for (let i = 0; i < paddedLength; i += 32) {
    let packedValue = 0
    for (let j = 0; j < 32; j++) {
      const val = i + j < arr.length ? arr[i + j] : 0
      packedValue |= val << j
    }
    result.push(packedValue >>> 0)
  }
  return result
}

export function isSetSolutionValid(bitpackedArray: number[], index: number): boolean {
  const packedIndex = index >> 5
  const bitIndex = index & 31
  return ((bitpackedArray[packedIndex] >> bitIndex) & 1) === 1
}

const permutator = (inputArr: number[]) => {
  const result: number[][] = []

  const permute = (arr: number[], m: number[] = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice()
        const next = curr.splice(i, 1)
        permute(curr.slice(), m.concat(next))
      }
    }
  }

  permute(inputArr)
  return result
}
