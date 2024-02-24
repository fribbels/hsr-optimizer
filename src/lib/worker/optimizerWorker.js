import { OrnamentSetToIndex, RelicSetToIndex, SetsOrnaments, SetsRelics, Stats } from '../constants.ts'
import { BufferPacker } from '../bufferPacker.js'
import {
  calculateBaseStats,
  calculateComputedStats,
  calculateElementalStats,
  calculateSetCounts,
  sumRelicStats,
} from 'lib/optimizer/computeStats'
import { calculateBaseMultis, calculateDamage } from 'lib/optimizer/computeDamage'
import { calculateTeammates } from 'lib/optimizer/computeTeammates'
import { generateConditionals } from 'lib/optimizer/computeConditionals'

const relicSetCount = Object.values(SetsRelics).length
const ornamentSetCount = Object.values(SetsOrnaments).length

self.onmessage = function(e) {
  // console.log('Message received from main script', e.data)
  // console.log("Request received from main script", JSON.stringify(e.data.request.characterConditionals, null, 4));

  let data = e.data
  let request = data.request

  const params = data.params

  let relics = data.relics
  let arr = new Float64Array(data.buffer)

  let topRow = data.topRow

  let lSize = topRow ? 1 : relics.LinkRope.length
  let pSize = topRow ? 1 : relics.PlanarSphere.length
  let fSize = topRow ? 1 : relics.Feet.length
  let bSize = topRow ? 1 : relics.Body.length
  let gSize = topRow ? 1 : relics.Hands.length
  let hSize = topRow ? 1 : relics.Head.length

  let relicSetSolutions = data.relicSetSolutions
  let ornamentSetSolutions = data.ornamentSetSolutions

  let combatDisplay = request.statDisplay == 'combat'
  let baseDisplay = !combatDisplay

  generateConditionals(request, params)
  calculateTeammates(request, params)

  const limit = Math.min(data.permutations, data.WIDTH)

  for (let col = 0; col < limit; col++) {
    let index = data.skip + col

    if (index >= data.permutations) {
      break
    }

    let l = (index % lSize)
    let p = (((index - l) / lSize) % pSize)
    let f = (((index - p * lSize - l) / (lSize * pSize)) % fSize)
    let b = (((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize)
    let g = (((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize)
    let h = (((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize)

    const head = relics.Head[h]
    const hands = relics.Hands[g]
    const body = relics.Body[b]
    const feet = relics.Feet[f]
    const planarSphere = relics.PlanarSphere[p]
    const linkRope = relics.LinkRope[l]

    const setH = RelicSetToIndex[head.set]
    const setG = RelicSetToIndex[hands.set]
    const setB = RelicSetToIndex[body.set]
    const setF = RelicSetToIndex[feet.set]
    const setP = OrnamentSetToIndex[planarSphere.set]
    const setL = OrnamentSetToIndex[linkRope.set]

    const relicSetIndex = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount
    const ornamentSetIndex = setP + setL * ornamentSetCount

    // Exit early if sets don't match unless for a topRow search
    if (relicSetSolutions[relicSetIndex] != 1 || ornamentSetSolutions[ornamentSetIndex] != 1) {
      if (!topRow) {
        continue
      }
    }

    const c = sumRelicStats(head, hands, body, feet, planarSphere, linkRope)
    c.relicSetIndex = relicSetIndex
    c.ornamentSetIndex = ornamentSetIndex

    calculateSetCounts(c, setH, setG, setB, setF, setP, setL)
    calculateBaseStats(c, request, params)
    calculateElementalStats(c, request, params)

    // SPD is the most common filter, use it to exit early
    if (baseDisplay && !topRow && (c[Stats.SPD] < request.minSpd || c[Stats.SPD] > request.maxSpd)) {
      continue
    }

    // Exit early on base display filters failing unless for a topRow search
    if (baseDisplay && !topRow) {
      const fail
        = c[Stats.HP] < request.minHp || c[Stats.HP] > request.maxHp
        || c[Stats.ATK] < request.minAtk || c[Stats.ATK] > request.maxAtk
        || c[Stats.DEF] < request.minDef || c[Stats.DEF] > request.maxDef
        || c[Stats.CR] < request.minCr || c[Stats.CR] > request.maxCr
        || c[Stats.CD] < request.minCd || c[Stats.CD] > request.maxCd
        || c[Stats.EHR] < request.minEhr || c[Stats.EHR] > request.maxEhr
        || c[Stats.RES] < request.minRes || c[Stats.RES] > request.maxRes
        || c[Stats.BE] < request.minBe || c[Stats.BE] > request.maxBe
        || c[Stats.ERR] < request.minErr || c[Stats.ERR] > request.maxErr
        || c.WEIGHT < request.minWeight || c.WEIGHT > request.maxWeight
      if (fail) {
        continue
      }
    }

    const x = calculateComputedStats(c, params, request)
    calculateBaseMultis(c, params, request)
    calculateDamage(c, x, params, request)

    // Since we exited early on the c comparisons, we only need to check against x stats here. Ignore if top row search
    if (combatDisplay && !topRow) {
      const fail
        = x[Stats.HP] < request.minHp || x[Stats.HP] > request.maxHp
        || x[Stats.ATK] < request.minAtk || x[Stats.ATK] > request.maxAtk
        || x[Stats.DEF] < request.minDef || x[Stats.DEF] > request.maxDef
        || x[Stats.SPD] < request.minSpd || x[Stats.SPD] > request.maxSpd
        || x[Stats.CR] < request.minCr || x[Stats.CR] > request.maxCr
        || x[Stats.CD] < request.minCd || x[Stats.CD] > request.maxCd
        || x[Stats.EHR] < request.minEhr || x[Stats.EHR] > request.maxEhr
        || x[Stats.RES] < request.minRes || x[Stats.RES] > request.maxRes
        || x[Stats.BE] < request.minBe || x[Stats.BE] > request.maxBe
        || x[Stats.ERR] < request.minErr || x[Stats.ERR] > request.maxErr
      if (fail) {
        continue
      }
    }

    let fail = (
      c.ehp < request.minEhp || c.ehp > request.maxEhp
      || x.BASIC_DMG < request.minBasic || x.BASIC_DMG > request.maxBasic
      || x.SKILL_DMG < request.minSkill || x.SKILL_DMG > request.maxSkill
      || x.ULT_DMG < request.minUlt || x.ULT_DMG > request.maxUlt
      || x.FUA_DMG < request.minFua || x.FUA_DMG > request.maxFua
      || x.DOT_DMG < request.minDot || x.DOT_DMG > request.maxDot
    )

    /*
     * ************************************************************
     * Pack the passing results into the ArrayBuffer to return
     * ************************************************************
     */

    if (topRow || !fail) {
      c.id = index
      BufferPacker.packCharacter(arr, col, c)
    }
  }

  self.postMessage({
    rows: [],
    buffer: data.buffer,
  }, [data.buffer])
}

function p4(set) {
  return set >> 2
}

function p2(set) {
  return Math.min(1, set >> 1)
}
