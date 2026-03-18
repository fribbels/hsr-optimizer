import {
  Constants,
  RelicSetFilterOptions,
} from 'lib/constants/constants'
import { type Form } from 'types/form'
import {
  OrnamentSetToIndex,
  RelicSetToIndex,
  SetsOrnaments,
  SetsOrnamentsNames,
  SetsRelics,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import { arrayOfZeroes, arrayOfValue } from 'lib/utils/arrayUtils'

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

export function bitpackBooleanArray(arr: number[]) {
  const paddedLength = Math.ceil(arr.length / 32) * 32
  const result: number[] = []
  for (let i = 0; i < paddedLength; i += 32) {
    let packedValue = 0
    for (let j = 0; j < 32; j++) {
      const val = i + j < arr.length ? arr[i + j] : 0
      packedValue |= (val << j)
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
