import { Constants, Sets } from '../constants.ts'
import { BufferPacker } from '../bufferPacker.js'
import { CharacterConditionals } from '../characterConditionals'
import { LightConeConditionals } from '../lightConeConditionals'
import { generateParams } from 'lib/optimizer/computeParams'
import {
  calculateBaseStats,
  calculateComputedStats,
  calculateElementalStats,
  calculateSetCounts,
  sumRelicStats,
} from 'lib/optimizer/computeStats'
import { computeDamage } from 'lib/optimizer/computeDamage'

const relicSetCount = Object.values(Constants.SetsRelics).length
const ornamentSetCount = Object.values(Constants.SetsOrnaments).length

self.onmessage = function(e) {
  // console.log('Message received from main script', e.data)
  // console.log("Request received from main script", JSON.stringify(e.data.request.characterConditionals, null, 4));

  let data = e.data
  let request = data.request

  const params = generateParams(request)

  let relics = data.relics
  let character = data.character
  let Stats = Constants.Stats
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

  let relicSetToIndex = data.relicSetToIndex
  let ornamentSetToIndex = data.ornamentSetToIndex

  let trace = character.traces
  let lc = character.lightCone
  let base = character.base

  let combatDisplay = request.statDisplay == 'combat'
  let baseDisplay = !combatDisplay

  let characterConditionals = CharacterConditionals.get(request)
  let lightConeConditionals = LightConeConditionals.get(request)

  let precomputedX = characterConditionals.precomputeEffects(request)
  if (characterConditionals.precomputeMutualEffects) characterConditionals.precomputeMutualEffects(precomputedX, request)

  lightConeConditionals.precomputeEffects(precomputedX, request)
  if (lightConeConditionals.precomputeMutualEffects) lightConeConditionals.precomputeMutualEffects(precomputedX, request)

  // Precompute teammate effects
  const teammateSetEffects = {}
  const teammates = [
    request.teammate0,
    request.teammate1,
    request.teammate2,
  ].filter((x) => !!x.characterId)
  for (let i = 0; i < teammates.length; i++) {
    const teammateRequest = Object.assign({}, request, teammates[i])

    const teammateCharacterConditionals = CharacterConditionals.get(teammateRequest)
    const teammateLightConeConditionals = LightConeConditionals.get(teammateRequest)

    if (teammateCharacterConditionals.precomputeMutualEffects) teammateCharacterConditionals.precomputeMutualEffects(precomputedX, teammateRequest)
    if (teammateCharacterConditionals.precomputeTeammateEffects) teammateCharacterConditionals.precomputeTeammateEffects(precomputedX, teammateRequest)

    if (teammateLightConeConditionals.precomputeMutualEffects) teammateLightConeConditionals.precomputeMutualEffects(precomputedX, teammateRequest)
    if (teammateLightConeConditionals.precomputeTeammateEffects) teammateLightConeConditionals.precomputeTeammateEffects(precomputedX, teammateRequest)

    switch (teammateRequest.teamOrnamentSet) {
      case Sets.BrokenKeel:
        precomputedX[Stats.CD] += 0.10
        break
      case Sets.FleetOfTheAgeless:
        precomputedX[Stats.ATK_P] += 0.08
        break
      case Sets.PenaconyLandOfTheDreams:
        if (teammateRequest.damageElement != params.damageElement) break
        precomputedX[params.ELEMENTAL_DMG_TYPE] += 0.10
        break
      default:
    }

    switch (teammateRequest.teamRelicSet) {
      case Sets.MessengerTraversingHackerspace:
        if (teammateSetEffects[Sets.MessengerTraversingHackerspace]) break
        precomputedX[Stats.SPD_P] += 0.12
        break
      case Sets.WatchmakerMasterOfDreamMachinations:
        if (teammateSetEffects[Sets.WatchmakerMasterOfDreamMachinations]) break
        precomputedX[Stats.BE] += 0.30
        break
      default:
    }

    // Track unique buffs
    teammateSetEffects[teammateRequest.teamOrnamentSet] = true
    teammateSetEffects[teammateRequest.teamRelicSet] = true
  }

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

    const setH = relicSetToIndex[head.set]
    const setG = relicSetToIndex[hands.set]
    const setB = relicSetToIndex[body.set]
    const setF = relicSetToIndex[feet.set]

    const setP = ornamentSetToIndex[planarSphere.set]
    const setL = ornamentSetToIndex[linkRope.set]

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

    calculateElementalStats(c, request, params, base, lc, trace)

    calculateBaseStats(c, request, base, lc, trace)

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

    c.id = index

    /*
     * ************************************************************
     * Set up combat stats storage x
     * ************************************************************
     */

    let x = Object.assign({}, precomputedX)
    c.x = x

    x[Stats.ATK] += c[Stats.ATK]
    x[Stats.DEF] += c[Stats.DEF]
    x[Stats.HP] += c[Stats.HP]
    x[Stats.SPD] += c[Stats.SPD]
    x[Stats.CD] += c[Stats.CD]
    x[Stats.CR] += c[Stats.CR]
    x[Stats.EHR] += c[Stats.EHR]
    x[Stats.RES] += c[Stats.RES]
    x[Stats.BE] += c[Stats.BE]
    x[Stats.ERR] += c[Stats.ERR]
    x[Stats.OHB] += c[Stats.OHB]
    x[params.ELEMENTAL_DMG_TYPE] += c.ELEMENTAL_DMG

    x[Stats.ATK] += request.buffAtk
    x[Stats.ATK] += request.buffAtkP * request.baseAtk
    x[Stats.CD] += request.buffCd
    x[Stats.CR] += request.buffCr
    x[Stats.SPD] += request.buffSpdP * request.baseSpd + request.buffSpd
    x[Stats.BE] += request.buffBe
    x.ELEMENTAL_DMG += request.buffDmgBoost

    /*
     * ************************************************************
     * Calculate passive effects & buffs. x stores the internally calculated character stats (Combat stats)
     * ************************************************************
     */

    /*
     * No longer needed
     * characterConditionals.calculatePassives(c, request)
     * lightConeConditionals.calculatePassives(c, request)
     */

    /*
     * ************************************************************
     * Calculate conditional set effects
     * ************************************************************
     */

    const sets = c.sets

    calculateComputedStats(c, x, params, request)

    /*
     * ************************************************************
     * Calculate skill base damage
     * ************************************************************
     */

    lightConeConditionals.calculateBaseMultis(c, request)
    characterConditionals.calculateBaseMultis(c, request)

    /*
     * ************************************************************
     * Calculate overall multipliers
     * ************************************************************
     */

    // After calculations are done, merge the character type's damage back into X for display
    x.ELEMENTAL_DMG += x[params.ELEMENTAL_DMG_TYPE]

    computeDamage(c, x, params, request, sets)

    /*
     * ************************************************************
     * Filter results
     * ************************************************************
     */

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
