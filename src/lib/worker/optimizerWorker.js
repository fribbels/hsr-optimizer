import { OrnamentSetToIndex, RelicSetToIndex, SetsOrnaments, SetsRelics, Stats } from '../constants.ts'
import { BufferPacker } from '../bufferPacker.js'
import { baseCharacterStats, calculateBaseStats, calculateComputedStats, calculateElementalStats, calculateRelicStats, calculateSetCounts } from 'lib/optimizer/calculateStats'
import { calculateBaseMultis, calculateDamage } from 'lib/optimizer/calculateDamage'
import { calculatePostPrecomputeTeammates, calculateTeammates } from 'lib/optimizer/calculateTeammates'
import { calculateConditionals, calculatePostPrecomputeConditionals } from 'lib/optimizer/calculateConditionals'
import { SortOption } from 'lib/optimizer/sortOptions'

const relicSetCount = Object.values(SetsRelics).length
const ornamentSetCount = Object.values(SetsOrnaments).length

self.onmessage = function(e) {
  // console.log('Message received from main script', e.data)
  // console.log("Request received from main script", JSON.stringify(e.data.request.characterConditionals, null, 4));

  const data = e.data
  const request = data.request

  const params = data.params

  const relics = data.relics
  const arr = new Float64Array(data.buffer)

  const lSize = relics.LinkRope.length
  const pSize = relics.PlanarSphere.length
  const fSize = relics.Feet.length
  const bSize = relics.Body.length
  const gSize = relics.Hands.length
  const hSize = relics.Head.length

  const relicSetSolutions = data.relicSetSolutions
  const ornamentSetSolutions = data.ornamentSetSolutions

  const combatDisplay = request.statDisplay == 'combat'
  const baseDisplay = !combatDisplay
  let passCount = 0

  const { failsBasicFilter, failsCombatFilter } = generateResultMinFilter(request, combatDisplay)

  calculateConditionals(request, params)
  calculateTeammates(request, params)

  // PostPrecompute
  calculatePostPrecomputeConditionals(request, params)
  calculatePostPrecomputeTeammates(request, params)

  const limit = Math.min(data.permutations, data.WIDTH)

  for (let col = 0; col < limit; col++) {
    const index = data.skip + col

    if (index >= data.permutations) {
      break
    }

    const l = (index % lSize)
    const p = (((index - l) / lSize) % pSize)
    const f = (((index - p * lSize - l) / (lSize * pSize)) % fSize)
    const b = (((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize)
    const g = (((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize)
    const h = (((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize)

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

    // Exit early if sets don't match
    if (relicSetSolutions[relicSetIndex] != 1 || ornamentSetSolutions[ornamentSetIndex] != 1) {
      continue
    }

    const c = { ...baseCharacterStats }
    const x = { ...params.precomputedX }

    c.relicSetIndex = relicSetIndex
    c.ornamentSetIndex = ornamentSetIndex
    c.x = x

    calculateRelicStats(c, head, hands, body, feet, planarSphere, linkRope)
    calculateSetCounts(c, setH, setG, setB, setF, setP, setL)
    calculateBaseStats(c, request, params)
    calculateElementalStats(c, request, params)

    // Exit early on base display filters failing
    if (baseDisplay) {
      if (failsBasicFilter(c)) {
        continue
      }

      const fail
        = c[Stats.SPD] < request.minSpd || c[Stats.SPD] > request.maxSpd
        || c[Stats.HP] < request.minHp || c[Stats.HP] > request.maxHp
        || c[Stats.ATK] < request.minAtk || c[Stats.ATK] > request.maxAtk
        || c[Stats.DEF] < request.minDef || c[Stats.DEF] > request.maxDef
        || c[Stats.CR] < request.minCr || c[Stats.CR] > request.maxCr
        || c[Stats.CD] < request.minCd || c[Stats.CD] > request.maxCd
        || c[Stats.EHR] < request.minEhr || c[Stats.EHR] > request.maxEhr
        || c[Stats.RES] < request.minRes || c[Stats.RES] > request.maxRes
        || c[Stats.BE] < request.minBe || c[Stats.BE] > request.maxBe
        || c[Stats.ERR] < request.minErr || c[Stats.ERR] > request.maxErr
      if (fail) {
        continue
      }
    }

    calculateComputedStats(c, request, params)
    calculateBaseMultis(c, request, params)
    calculateDamage(c, request, params)

    if (failsCombatFilter(x)) {
      continue
    }

    // Since we exited early on the c comparisons, we only need to check against x stats here
    // Combat filters
    if (combatDisplay) {
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

    // Rating filters
    const fail = x.EHP < request.minEhp || x.EHP > request.maxEhp
      || x.WEIGHT < request.minWeight || x.WEIGHT > request.maxWeight
      || x.BASIC_DMG < request.minBasic || x.BASIC_DMG > request.maxBasic
      || x.SKILL_DMG < request.minSkill || x.SKILL_DMG > request.maxSkill
      || x.ULT_DMG < request.minUlt || x.ULT_DMG > request.maxUlt
      || x.FUA_DMG < request.minFua || x.FUA_DMG > request.maxFua
      || x.DOT_DMG < request.minDot || x.DOT_DMG > request.maxDot
      || x.BREAK_DMG < request.minBreak || x.BREAK_DMG > request.maxBreak
      || x.COMBO_DMG < request.minCombo || x.COMBO_DMG > request.maxCombo
    if (fail) {
      continue
    }

    // Pack the passing results into the ArrayBuffer to return
    c.id = index
    BufferPacker.packCharacter(arr, passCount, c)
    passCount++
  }

  self.postMessage({
    rows: [],
    buffer: data.buffer,
  }, [data.buffer])
}

function generateResultMinFilter(request, combatDisplay) {
  const filter = request.resultMinFilter
  const sortOption = SortOption[request.resultSort]
  const isComputedRating = sortOption.isComputedRating

  // Combat and basic filters apply at different places in the loop
  // Computed ratings (EHP, DMG, WEIGHT) only apply to the computed x values independent of the stat display
  if (combatDisplay || isComputedRating) {
    const property = sortOption.combatProperty
    return {
      failsBasicFilter: () => false,
      failsCombatFilter: (candidate) => {
        return candidate[property] < filter
      },
    }
  } else {
    const property = sortOption.basicProperty
    return {
      failsBasicFilter: (candidate) => {
        return candidate[property] < filter
      },
      failsCombatFilter: () => false,
    }
  }
}
