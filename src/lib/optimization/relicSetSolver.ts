import {
  Constants,
  Parts,
  RelicSetFilterOptions,
} from 'lib/constants/constants'
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
      const index1D = x[0] + x[1] * Math.pow(len, 1) + x[2] * Math.pow(len, 2) + x[3] * Math.pow(len, 3)
      arr[index1D] = 1
    }
  }

  return arr
}

/**
 * Computes the true number of valid relic+ornament permutations after accounting for
 * multi-piece set constraints (2pc / 4pc / 2+2 filters). The naive slot-product
 * (`|Head| × |Hands| × |Body| × |Feet| × |Sphere| × |Rope|`) overestimates whenever
 * a 2+Any filter widens the per-slot allow-list but the set solver actually restricts
 * which 4-tuples of sets are valid. See issue #1482.
 *
 * This sums `countsBySet.Head[h] × Hands[g] × Body[b] × Feet[f]` over every (h,g,b,f)
 * 4-tuple marked valid by `generateRelicSetSolutions`, and similarly for ornaments.
 *
 * Expected size is SetsRelicsNames.length^4 ≈ 20^4 = 160k iterations per call, trivial.
 *
 * NOTE: the index encoding here (`h + g·len + b·len² + f·len³`) matches
 * `convertRelicSetIndicesTo1D`. The CPU/GPU search workers happen to decode with
 * body/hands swapped, which is harmless there because `permutator()` marks every
 * permutation of a set multiset as valid, but do not "fix" this to match the worker.
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
 * Like `computeValidPermutationCount` but returns the relic (head/hands/body/feet)
 * and ornament (sphere/rope) sums separately. The zero-permutation diagnosis in
 * `suggestionsEngine` uses this to tell a user whether their relic filter or their
 * ornament filter is the infeasible one.
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
      const hgBase = h + g * relicLen
      for (let b = 0; b < relicLen; b++) {
        const vB = cBody[b]
        if (!vB) continue
        const hgbBase = hgBase + b * relicLen * relicLen
        for (let f = 0; f < relicLen; f++) {
          const vF = cFeet[f]
          if (!vF) continue
          const key = hgbBase + f * relicLen * relicLen * relicLen
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
