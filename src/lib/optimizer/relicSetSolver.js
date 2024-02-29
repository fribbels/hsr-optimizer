import { Constants, RelicSetFilterOptions } from 'lib/constants'
import { Utils } from 'lib/utils'

// Here be dragons
export function generateRelicSetSolutions(request) {
  // Init
  let len = Constants.SetsRelicsNames.length
  let setRequest = request.relicSets || []
  let relicSetAllowList = []
  let setIndices = []

  for (let setArr of setRequest) {
    if (setArr[0] == RelicSetFilterOptions.relic4Piece) {
      if (setArr.length == 1) {
        // All 4 pieces
        for (let i = 0; i < len; i++) {
          let arr = Utils.arrayOfZeroes(len)
          arr[i] = 4
          relicSetAllowList.push(arr.join())
          let indices = relicSetAllowListToIndices(arr)
          setIndices.push(indices)
        }
      }

      if (setArr.length == 2) {
        // Specific 4 piece
        let index = Constants.RelicSetToIndex[setArr[1]]
        let arr = Utils.arrayOfZeroes(len)
        arr[index] = 4
        relicSetAllowList.push(arr.join())
        let indices = relicSetAllowListToIndices(arr)
        setIndices.push(indices)
      }
    }

    if (setArr[0] == RelicSetFilterOptions.relic2PlusAny) {
      if (setArr.length == 1) { // Is this one even possible
        // All 2 + Any
        for (let i = 0; i < len; i++) {
          let arr = Utils.arrayOfZeroes(len)
          arr[i] = 4
          relicSetAllowList.push(arr.join())
          let indices = relicSetAllowListToIndices(arr)
          setIndices.push(indices)
        }
      }

      if (setArr.length == 2) {
        let index = Constants.RelicSetToIndex[setArr[1]]
        for (let i = 0; i < len; i++) {
          let arr = Utils.arrayOfZeroes(len)
          arr[index] = 2
          arr[i] += 2
          relicSetAllowList.push(arr.join())
          let indices = relicSetAllowListToIndices(arr)
          setIndices.push(indices)
        }

        // 2 + 0
        let arr = Utils.arrayOfZeroes(len)
        arr[index] = 2
        relicSetAllowList.push(arr.join())
        let indices = relicSetAllowListToIndices(arr)
        let filledIndices = fillRelicSetArrPossibilities(indices, len)
        setIndices.push(...filledIndices)
      }
    }

    // '2 Piece' is deprecated, but leaving it here for compatibility
    if (setArr[0] == RelicSetFilterOptions.relic2Plus2Piece || setArr[0] == '2 Piece') {
      if (setArr.length == 1) {
        // Any 2 piece + Any
        for (let i = 0; i < len; i++) {
          let arr = Utils.arrayOfZeroes(len)
          arr[i] = 2
          relicSetAllowList.push(arr.join())
          let indices = relicSetAllowListToIndices(arr)
          let filledIndices = fillRelicSetArrPossibilities(indices, len)
          setIndices.push(...filledIndices)
        }

        // Also means 2 + 2 pieces are allowed
        for (let i = 0; i < len; i++) {
          for (let j = 0; j < len; j++) {
            let arr = Utils.arrayOfZeroes(len)
            arr[i] += 2
            arr[j] += 2
            relicSetAllowList.push(arr.join())
            let indices = relicSetAllowListToIndices(arr)
            setIndices.push(indices)
          }
        }
      }

      if (setArr.length == 2) {
        // Single 2 piece + Any
        // 2 + 2s
        let index = Constants.RelicSetToIndex[setArr[1]]
        for (let i = 0; i < len; i++) {
          let arr = Utils.arrayOfZeroes(len)
          arr[index] = 2
          arr[i] += 2
          relicSetAllowList.push(arr.join())
          let indices = relicSetAllowListToIndices(arr)
          setIndices.push(indices)
        }

        // 2 + 0
        let arr = Utils.arrayOfZeroes(len)
        arr[index] = 2
        relicSetAllowList.push(arr.join())
        let indices = relicSetAllowListToIndices(arr)
        let filledIndices = fillRelicSetArrPossibilities(indices, len)
        setIndices.push(...filledIndices)
      }

      if (setArr.length == 3) {
        // Specific 2 piece + (2 piece OR any)
        // 'Any' is deprecated, but leaving it here for compatibility
        if (setArr[2] == 'Any') {
          let index = Constants.RelicSetToIndex[setArr[1]]
          for (let i = 0; i < len; i++) {
            let arr = Utils.arrayOfZeroes(len)
            arr[index] = 2
            arr[i] += 2
            relicSetAllowList.push(arr.join())
            let indices = relicSetAllowListToIndices(arr)
            setIndices.push(indices)
          }

          // 2 + 0
          let arr = Utils.arrayOfZeroes(len)
          arr[index] = 2
          relicSetAllowList.push(arr.join())
          let indices = relicSetAllowListToIndices(arr)
          let filledIndices = fillRelicSetArrPossibilities(indices, len)
          setIndices.push(...filledIndices)
        } else {
          let arr = Utils.arrayOfZeroes(len)
          let index1 = Constants.RelicSetToIndex[setArr[1]]
          let index2 = Constants.RelicSetToIndex[setArr[2]]
          arr[index1] += 2
          arr[index2] += 2
          relicSetAllowList.push(arr.join())
          let indices = relicSetAllowListToIndices(arr)
          setIndices.push(indices)
        }
      }
    }
  }

  // I dont remember what the allow list was for
  // relicSetAllowList = [...new Set(relicSetAllowList)]
  return convertRelicSetIndicesTo1D(setIndices)
}

export function generateOrnamentSetSolutions(request) {
  let setRequest = request.ornamentSets || []
  let len = Constants.SetsOrnamentsNames.length

  if (setRequest.length == 0) {
    return Utils.arrayOfValue(len * len, 1)
  }

  let arr = Utils.arrayOfZeroes(len * len)
  for (let set of setRequest) {
    let setIndex = Constants.OrnamentSetToIndex[set]
    let index1D = setIndex + setIndex * len
    arr[index1D] = 1
  }

  return arr
}

// [0, 0, 0, 2, 0, 2] => [3, 3, 5, 5]
function relicSetAllowListToIndices(arr) {
  let out = []
  for (let i = 0; i < arr.length; i++) {
    while (arr[i]) {
      arr[i]--
      out.push(i)
    }
  }

  return out
}

// [5, 5] => [[5,5,0,0], [5,5,0,1], [5,5,1,1], [5,5,1,2], ...]
function fillRelicSetArrPossibilities(arr, len) {
  let out = []
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len; j++) {
      let newArr = Utils.arrayOfZeroes(4)
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
function convertRelicSetIndicesTo1D(setIndices) {
  let len = Constants.SetsRelicsNames.length
  if (setIndices.length == 0) {
    return Utils.arrayOfValue(Math.pow(len, 4), 1)
  }

  let arr = Utils.arrayOfZeroes(Math.pow(len, 4))

  for (let i = 0; i < setIndices.length; i++) {
    let y = setIndices[i] // [5,5,2,3]
    let permutations = permutator(y)
    for (let x of permutations) {
      let index1D = x[0] + x[1] * Math.pow(len, 1) + x[2] * Math.pow(len, 2) + x[3] * Math.pow(len, 3)
      arr[index1D] = 1
    }
  }

  return arr
}

const permutator = (inputArr) => {
  let result = []

  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice()
        let next = curr.splice(i, 1)
        permute(curr.slice(), m.concat(next))
      }
    }
  }

  permute(inputArr)
  return result
}
