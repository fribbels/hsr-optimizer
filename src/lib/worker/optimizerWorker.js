import { Constants, Sets, Stats } from '../constants.ts'
import { BufferPacker } from '../bufferPacker.js'
import { CharacterConditionals } from '../characterConditionals'
import { LightConeConditionals } from '../lightConeConditionals'

function sumRelicStats(headRelics, handsRelics, bodyRelics, feetRelics, planarSphereRelics, linkRopeRelics, h, g, b, f, p, l, statValues) {
  let summedStats = {}
  for (let stat of statValues) {
    summedStats[stat]
      = headRelics[h].augmentedStats[stat]
      + handsRelics[g].augmentedStats[stat]
      + bodyRelics[b].augmentedStats[stat]
      + feetRelics[f].augmentedStats[stat]
      + planarSphereRelics[p].augmentedStats[stat]
      + linkRopeRelics[l].augmentedStats[stat]
  }
  summedStats.WEIGHT
    = headRelics[h].weightScore
    + handsRelics[g].weightScore
    + bodyRelics[b].weightScore
    + feetRelics[f].weightScore
    + planarSphereRelics[p].weightScore
    + linkRopeRelics[l].weightScore

  return summedStats
}

function calculateFlatStat(stat, statP, baseValue, lc, trace, relicSum, setEffects) {
  return (baseValue) * (1 + setEffects + relicSum[statP] + trace[statP] + lc[statP]) + relicSum[stat] + trace[stat]
}

function calculateBaseStat(stat, base, lc) {
  return base[stat] + lc[stat]
}

function calculatePercentStat(stat, base, lc, trace, relicSum, setEffects) {
  return base[stat] + lc[stat] + relicSum[stat] + trace[stat] + setEffects
}

const pioneerSetIndexToCd = {
  0: 0,
  1: 0.08,
  2: 0.12,
  3: 0.16,
  4: 0.24,
}

function elementToDamageType(element) {
  return {
    [Stats.Physical_DMG]: 'PHYSICAL_DMG_BOOST',
    [Stats.Fire_DMG]: 'FIRE_DMG_BOOST',
    [Stats.Ice_DMG]: 'ICE_DMG_BOOST',
    [Stats.Lightning_DMG]: 'LIGHTNING_DMG_BOOST',
    [Stats.Wind_DMG]: 'WIND_DMG_BOOST',
    [Stats.Quantum_DMG]: 'QUANTUM_DMG_BOOST',
    [Stats.Imaginary_DMG]: 'IMAGINARY_DMG_BOOST',
  }[element]
}

function elementToResPenType(element) {
  return {
    [Stats.Physical_DMG]: 'PHYSICAL_RES_PEN',
    [Stats.Fire_DMG]: 'FIRE_RES_PEN',
    [Stats.Ice_DMG]: 'ICE_RES_PEN',
    [Stats.Lightning_DMG]: 'LIGHTNING_RES_PEN',
    [Stats.Wind_DMG]: 'WIND_RES_PEN',
    [Stats.Quantum_DMG]: 'QUANTUM_RES_PEN',
    [Stats.Imaginary_DMG]: 'IMAGINARY_RES_PEN',
  }[element]
}

function calculateDamage(
  x,
  universalMulti,
  dmgBoostMultiplier,
  cLevel,
  eLevel,
  defReduction,
  defIgnore,
  baseResistance,
) {
  x.BASIC_DMG
    *= universalMulti
    * (dmgBoostMultiplier + x.BASIC_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BASIC_DEF_PEN)
    * (Math.min(1, x[Stats.CR] + x.BASIC_CR_BOOST) * (1 + x[Stats.CD] + x.BASIC_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.BASIC_CR_BOOST)))
    * (1 + x.DMG_TAKEN_MULTI + x.BASIC_VULNERABILITY)
    * (1 - (baseResistance - x.BASIC_RES_PEN))

  x.SKILL_DMG
    *= universalMulti
    * (dmgBoostMultiplier + x.SKILL_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.SKILL_DEF_PEN)
    * (Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST) * (1 + x[Stats.CD] + x.SKILL_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST)))
    * (1 + x.DMG_TAKEN_MULTI + x.SKILL_VULNERABILITY)
    * (1 - (baseResistance - x.SKILL_RES_PEN))

  x.ULT_DMG
    *= universalMulti
    * (dmgBoostMultiplier + x.ULT_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.ULT_DEF_PEN)
    * (Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST) * (1 + x[Stats.CD] + x.ULT_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST)))
    * (1 + x.DMG_TAKEN_MULTI + x.ULT_VULNERABILITY)
    * (1 - (baseResistance - x.ULT_RES_PEN))

  x.FUA_DMG
    *= universalMulti
    * (dmgBoostMultiplier + x.FUA_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.FUA_DEF_PEN)
    * (Math.min(1, x[Stats.CR] + x.FUA_CR_BOOST) * (1 + x[Stats.CD] + x.FUA_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.FUA_CR_BOOST)))
    * (1 + x.DMG_TAKEN_MULTI + x.FUA_VULNERABILITY)
    * (1 - (baseResistance - x.FUA_RES_PEN))

  x.DOT_DMG
    *= universalMulti
    * (dmgBoostMultiplier + x.DOT_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.DOT_DEF_PEN)
    * (1 + x.DMG_TAKEN_MULTI + x.DOT_VULNERABILITY)
    * (1 - (baseResistance - x.DOT_RES_PEN))
}

self.onmessage = function(e) {
  // console.log('Message received from main script', e.data)
  // console.log("Request received from main script", JSON.stringify(e.data.request.characterConditionals, null, 4));

  let data = e.data
  let relics = data.relics
  let character = data.character
  let Stats = Constants.Stats
  let statValues = Object.values(Stats)
  let arr = new Float64Array(data.buffer)

  let headRelics = relics.Head
  let handsRelics = relics.Hands
  let bodyRelics = relics.Body
  let feetRelics = relics.Feet
  let planarSphereRelics = relics.PlanarSphere
  let linkRopeRelics = relics.LinkRope

  let relicSetCount = Object.values(Constants.SetsRelics).length
  let ornamentSetCount = Object.values(Constants.SetsOrnaments).length

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

  const element = data.damageElement
  const ELEMENTAL_DMG_TYPE = elementToDamageType(element)
  const RES_PEN_TYPE = elementToResPenType(element)

  let trace = character.traces
  let lc = character.lightCone
  let base = character.base

  let request = data.request
  let setConditionals = request.setConditionals

  let combatDisplay = request.statDisplay == 'combat'
  let baseDisplay = !combatDisplay

  let enabledHunterOfGlacialForest = setConditionals[Constants.Sets.HunterOfGlacialForest][1] == true ? 1 : 0
  let enabledFiresmithOfLavaForging = setConditionals[Constants.Sets.FiresmithOfLavaForging][1] == true ? 1 : 0
  let enabledGeniusOfBrilliantStars = setConditionals[Constants.Sets.GeniusOfBrilliantStars][1] == true ? 1 : 0
  let enabledBandOfSizzlingThunder = setConditionals[Constants.Sets.BandOfSizzlingThunder][1] == true ? 1 : 0
  let enabledMessengerTraversingHackerspace = setConditionals[Constants.Sets.MessengerTraversingHackerspace][1] == true ? 1 : 0
  let enabledCelestialDifferentiator = setConditionals[Constants.Sets.CelestialDifferentiator][1] == true ? 1 : 0
  let enabledWatchmakerMasterOfDreamMachinations = setConditionals[Constants.Sets.WatchmakerMasterOfDreamMachinations][1] == true ? 1 : 0

  let valueChampionOfStreetwiseBoxing = setConditionals[Constants.Sets.ChampionOfStreetwiseBoxing][1]
  let valueWastelanderOfBanditryDesert = setConditionals[Constants.Sets.WastelanderOfBanditryDesert][1]
  let valueLongevousDisciple = setConditionals[Constants.Sets.LongevousDisciple][1]
  let valueTheAshblazingGrandDuke = setConditionals[Constants.Sets.TheAshblazingGrandDuke][1]
  let valuePrisonerInDeepConfinement = setConditionals[Constants.Sets.PrisonerInDeepConfinement][1]
  let valuePioneerDiverOfDeadWaters = setConditionals[Constants.Sets.PioneerDiverOfDeadWaters][1]

  let brokenMultiplier = request.enemyWeaknessBroken ? 1 : 0.9
  let resistance = (request.enemyElementalWeak ? 0 : request.enemyResistance) - request.buffResPen

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
    if (teammateCharacterConditionals.precomputeTeammateEffects) teammateCharacterConditionals.precomputeTeammateEffects(precomputedX, request, teammateRequest)
    if (teammateLightConeConditionals.precomputeTeammateEffects) teammateLightConeConditionals.precomputeTeammateEffects(precomputedX, request, teammateRequest)

    switch (teammateRequest.teamOrnamentSet) {
      case Sets.BrokenKeel:
        precomputedX[Stats.CD] += 0.10
        break
      case Sets.FleetOfTheAgeless:
        precomputedX[Stats.ATK_P] += 0.08
        break
      case Sets.PenaconyLandOfTheDreams:
        if (teammateRequest.damageElement != element) break
        precomputedX[ELEMENTAL_DMG_TYPE] += 0.10
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

    let setH = relicSetToIndex[relics.Head[h].set]
    let setG = relicSetToIndex[relics.Hands[g].set]
    let setB = relicSetToIndex[relics.Body[b].set]
    let setF = relicSetToIndex[relics.Feet[f].set]

    let setP = ornamentSetToIndex[relics.PlanarSphere[p].set]
    let setL = ornamentSetToIndex[relics.LinkRope[l].set]

    let relicSetIndex = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount
    let ornamentSetIndex = setP + setL * ornamentSetCount

    // Exit early if sets dont match unless its a topRow search
    if (relicSetSolutions[relicSetIndex] != 1 || ornamentSetSolutions[ornamentSetIndex] != 1) {
      if (!topRow) {
        continue
      }
    }

    let c = sumRelicStats(headRelics, handsRelics, bodyRelics, feetRelics, planarSphereRelics, linkRopeRelics, h, g, b, f, p, l, statValues)

    c.relicSetIndex = relicSetIndex
    c.ornamentSetIndex = ornamentSetIndex

    c.sets = {}
    let sets = c.sets
    sets.PasserbyOfWanderingCloud = (1 >> (setH ^ 0)) + (1 >> (setG ^ 0)) + (1 >> (setB ^ 0)) + (1 >> (setF ^ 0)) // * 4p -
    sets.MusketeerOfWildWheat = (1 >> (setH ^ 1)) + (1 >> (setG ^ 1)) + (1 >> (setB ^ 1)) + (1 >> (setF ^ 1)) // * 4p SPD 6% + basic 10%
    sets.KnightOfPurityPalace = (1 >> (setH ^ 2)) + (1 >> (setG ^ 2)) + (1 >> (setB ^ 2)) + (1 >> (setF ^ 2)) // * 4p SHIELD
    sets.HunterOfGlacialForest = (1 >> (setH ^ 3)) + (1 >> (setG ^ 3)) + (1 >> (setB ^ 3)) + (1 >> (setF ^ 3)) // * 4p (25% CD)
    sets.ChampionOfStreetwiseBoxing = (1 >> (setH ^ 4)) + (1 >> (setG ^ 4)) + (1 >> (setB ^ 4)) + (1 >> (setF ^ 4)) // * 4p (5x5% ATK)
    sets.GuardOfWutheringSnow = (1 >> (setH ^ 5)) + (1 >> (setG ^ 5)) + (1 >> (setB ^ 5)) + (1 >> (setF ^ 5)) // * 4p -
    sets.FiresmithOfLavaForging = (1 >> (setH ^ 6)) + (1 >> (setG ^ 6)) + (1 >> (setB ^ 6)) + (1 >> (setF ^ 6)) // * 4p 12% skill + (12% Fire)
    sets.GeniusOfBrilliantStars = (1 >> (setH ^ 7)) + (1 >> (setG ^ 7)) + (1 >> (setB ^ 7)) + (1 >> (setF ^ 7)) //   4p done
    sets.BandOfSizzlingThunder = (1 >> (setH ^ 8)) + (1 >> (setG ^ 8)) + (1 >> (setB ^ 8)) + (1 >> (setF ^ 8)) //   4p (20% ATK)
    sets.EagleOfTwilightLine = (1 >> (setH ^ 9)) + (1 >> (setG ^ 9)) + (1 >> (setB ^ 9)) + (1 >> (setF ^ 9)) //   4p -
    sets.ThiefOfShootingMeteor = (1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10)) //  4p 16% BE
    sets.WastelanderOfBanditryDesert = (1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11)) //  4p (10% CD) + (20% CR)
    sets.LongevousDisciple = (1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12)) //  4p (2x8% CR)
    sets.MessengerTraversingHackerspace = (1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13)) //  4p (12% SPD)
    sets.TheAshblazingGrandDuke = (1 >> (setH ^ 14)) + (1 >> (setG ^ 14)) + (1 >> (setB ^ 14)) + (1 >> (setF ^ 14)) //  4p (8*6% ATK)
    sets.PrisonerInDeepConfinement = (1 >> (setH ^ 15)) + (1 >> (setG ^ 15)) + (1 >> (setB ^ 15)) + (1 >> (setF ^ 15)) //  4p done
    sets.PioneerDiverOfDeadWaters = (1 >> (setH ^ 16)) + (1 >> (setG ^ 16)) + (1 >> (setB ^ 16)) + (1 >> (setF ^ 16))
    sets.WatchmakerMasterOfDreamMachinations = (1 >> (setH ^ 17)) + (1 >> (setG ^ 17)) + (1 >> (setB ^ 17)) + (1 >> (setF ^ 17))

    sets.SpaceSealingStation = (1 >> (setP ^ 0)) + (1 >> (setL ^ 0)) // (12% ATK)
    sets.FleetOfTheAgeless = (1 >> (setP ^ 1)) + (1 >> (setL ^ 1)) // (8% ATK)
    sets.PanCosmicCommercialEnterprise = (1 >> (setP ^ 2)) + (1 >> (setL ^ 2)) // (25% ATK)
    sets.BelobogOfTheArchitects = (1 >> (setP ^ 3)) + (1 >> (setL ^ 3)) // (15% DEF)
    sets.CelestialDifferentiator = (1 >> (setP ^ 4)) + (1 >> (setL ^ 4)) // (60% CR)
    sets.InertSalsotto = (1 >> (setP ^ 5)) + (1 >> (setL ^ 5)) // (15% ULT/FUA)
    sets.TaliaKingdomOfBanditry = (1 >> (setP ^ 6)) + (1 >> (setL ^ 6)) // (20% BE)
    sets.SprightlyVonwacq = (1 >> (setP ^ 7)) + (1 >> (setL ^ 7)) // -
    sets.RutilantArena = (1 >> (setP ^ 8)) + (1 >> (setL ^ 8)) // (20% BASIC/SKILL)
    sets.BrokenKeel = (1 >> (setP ^ 9)) + (1 >> (setL ^ 9)) // (10% CD)
    sets.FirmamentFrontlineGlamoth = (1 >> (setP ^ 10)) + (1 >> (setL ^ 10)) // (12%/18% DMG)
    sets.PenaconyLandOfTheDreams = (1 >> (setP ^ 11)) + (1 >> (setL ^ 11)) // -

    /*
     * ************************************************************
     * Old elemental dmg logic
     * ************************************************************
     */

    // NOTE: c.ELEMENTAL_DMG represents the character's type, while x.ELEMENTAL_DMG represents ALL types.
    // This is mostly because there isnt a need to split out damage types while we're calculating display stats.
    c.ELEMENTAL_DMG = 0
    switch (element) {
      case Stats.Physical_DMG:
        c.ELEMENTAL_DMG = calculatePercentStat(Stats.Physical_DMG, base, lc, trace, c, 0.10 * p2(sets.ChampionOfStreetwiseBoxing))
        break
      case Stats.Fire_DMG:
        c.ELEMENTAL_DMG = calculatePercentStat(Stats.Fire_DMG, base, lc, trace, c, 0.10 * p2(sets.FiresmithOfLavaForging) + 0.10 * enabledFiresmithOfLavaForging * p4(sets.FiresmithOfLavaForging))
        break
      case Stats.Ice_DMG:
        c.ELEMENTAL_DMG = calculatePercentStat(Stats.Ice_DMG, base, lc, trace, c, 0.10 * p2(sets.HunterOfGlacialForest))
        break
      case Stats.Lightning_DMG:
        c.ELEMENTAL_DMG = calculatePercentStat(Stats.Lightning_DMG, base, lc, trace, c, 0.10 * p2(sets.BandOfSizzlingThunder))
        break
      case Stats.Wind_DMG:
        c.ELEMENTAL_DMG = calculatePercentStat(Stats.Wind_DMG, base, lc, trace, c, 0.10 * p2(sets.EagleOfTwilightLine))
        break
      case Stats.Quantum_DMG:
        c.ELEMENTAL_DMG = calculatePercentStat(Stats.Quantum_DMG, base, lc, trace, c, 0.10 * p2(sets.GeniusOfBrilliantStars))
        break
      case Stats.Imaginary_DMG:
        c.ELEMENTAL_DMG = calculatePercentStat(Stats.Imaginary_DMG, base, lc, trace, c, 0.10 * p2(sets.WastelanderOfBanditryDesert))
        break
    }

    let crSum = c[Stats.CR]
    let cdSum = c[Stats.CD]

    /*
     * ************************************************************
     * Calculate base stats
     * ************************************************************
     */

    let baseHp = calculateBaseStat(Stats.HP, base, lc)
    let baseAtk = calculateBaseStat(Stats.ATK, base, lc)
    let baseDef = calculateBaseStat(Stats.DEF, base, lc)
    let baseSpd = calculateBaseStat(Stats.SPD, base, lc)
    c.baseAtk = baseAtk

    /*
     * ************************************************************
     * Calculate display stats with unconditional sets
     * ************************************************************
     */

    c[Stats.HP] = calculateFlatStat(Stats.HP, Stats.HP_P, baseHp, lc, trace, c,
      0.12 * p2(sets.FleetOfTheAgeless)
      + 0.12 * p2(sets.LongevousDisciple))

    c[Stats.ATK] = calculateFlatStat(Stats.ATK, Stats.ATK_P, baseAtk, lc, trace, c,
      0.12 * p2(sets.SpaceSealingStation)
      + 0.12 * p2(sets.FirmamentFrontlineGlamoth)
      + 0.12 * p2(sets.MusketeerOfWildWheat)
      + 0.12 * p2(sets.PrisonerInDeepConfinement))

    c[Stats.DEF] = calculateFlatStat(Stats.DEF, Stats.DEF_P, baseDef, lc, trace, c,
      0.15 * p2(sets.BelobogOfTheArchitects)
      + 0.15 * p2(sets.KnightOfPurityPalace))

    c[Stats.SPD] = calculateFlatStat(Stats.SPD, Stats.SPD_P, baseSpd, lc, trace, c,
      0.06 * p2(sets.MessengerTraversingHackerspace)
      + 0.06 * p4(sets.MusketeerOfWildWheat))

    c[Stats.CR] = calculatePercentStat(Stats.CR, base, lc, trace, c,
      0.08 * p2(sets.InertSalsotto)
      + 0.08 * p2(sets.RutilantArena))

    c[Stats.CD] = calculatePercentStat(Stats.CD, base, lc, trace, c,
      0.16 * p2(sets.CelestialDifferentiator))

    c[Stats.EHR] = calculatePercentStat(Stats.EHR, base, lc, trace, c,
      0.10 * p2(sets.PanCosmicCommercialEnterprise))

    c[Stats.RES] = calculatePercentStat(Stats.RES, base, lc, trace, c,
      0.10 * p2(sets.BrokenKeel))

    c[Stats.BE] = calculatePercentStat(Stats.BE, base, lc, trace, c,
      0.16 * p2(sets.TaliaKingdomOfBanditry)
      + 0.16 * p2(sets.ThiefOfShootingMeteor)
      + 0.16 * p4(sets.ThiefOfShootingMeteor))

    c[Stats.ERR] = calculatePercentStat(Stats.ERR, base, lc, trace, c,
      0.05 * p2(sets.SprightlyVonwacq)
      + 0.05 * p2(sets.PenaconyLandOfTheDreams))

    c[Stats.OHB] = calculatePercentStat(Stats.OHB, base, lc, trace, c,
      0.10 * p2(sets.PasserbyOfWanderingCloud))

    // Exit early on base display filters failing unless its a topRow search
    if (baseDisplay && !topRow) {
      const pass
        = c[Stats.HP] >= request.minHp && c[Stats.HP] <= request.maxHp
        && c[Stats.ATK] >= request.minAtk && c[Stats.ATK] <= request.maxAtk
        && c[Stats.DEF] >= request.minDef && c[Stats.DEF] <= request.maxDef
        && c[Stats.SPD] >= request.minSpd && c[Stats.SPD] <= request.maxSpd
        && c[Stats.CR] >= request.minCr && c[Stats.CR] <= request.maxCr
        && c[Stats.CD] >= request.minCd && c[Stats.CD] <= request.maxCd
        && c[Stats.EHR] >= request.minEhr && c[Stats.EHR] <= request.maxEhr
        && c[Stats.RES] >= request.minRes && c[Stats.RES] <= request.maxRes
        && c[Stats.BE] >= request.minBe && c[Stats.BE] <= request.maxBe
        && c.WEIGHT >= request.minWeight && c.WEIGHT <= request.maxWeight
      if (!pass) {
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
    x[ELEMENTAL_DMG_TYPE] += c.ELEMENTAL_DMG

    x[Stats.ATK] += request.buffAtk
    x[Stats.ATK] += request.buffAtkP * baseAtk
    x[Stats.CD] += request.buffCd
    x[Stats.CR] += request.buffCr
    x[Stats.SPD] += request.buffSpdP * baseSpd + request.buffSpd
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

    x[Stats.SPD_P]
      += 0.12 * enabledMessengerTraversingHackerspace * p4(sets.MessengerTraversingHackerspace)
    x[Stats.SPD] += x[Stats.SPD_P] * baseSpd

    x[Stats.ATK_P]
      += 0.05 * valueChampionOfStreetwiseBoxing * p4(sets.ChampionOfStreetwiseBoxing)
      + 0.20 * enabledBandOfSizzlingThunder * p4(sets.BandOfSizzlingThunder)
      + 0.06 * valueTheAshblazingGrandDuke * p4(sets.TheAshblazingGrandDuke)
      + 0.12 * (x[Stats.SPD] >= 120 ? 1 : 0) * p2(sets.SpaceSealingStation)
      + 0.08 * (x[Stats.SPD] >= 120 ? 1 : 0) * p2(sets.FleetOfTheAgeless)
      + Math.min(0.25, 0.25 * c[Stats.EHR]) * p2(sets.PanCosmicCommercialEnterprise)
    x[Stats.ATK] += x[Stats.ATK_P] * baseAtk

    x[Stats.DEF_P]
      += 0.15 * (c[Stats.EHR] >= 0.50 ? 1 : 0) * p2(sets.BelobogOfTheArchitects)
    x[Stats.DEF] += x[Stats.DEF_P] * baseDef

    x[Stats.HP] += x[Stats.HP_P] * baseHp

    x[Stats.CR]
      += 0.10 * (valueWastelanderOfBanditryDesert > 0 ? 1 : 0) * p4(sets.WastelanderOfBanditryDesert)
      + 0.08 * valueLongevousDisciple * p4(sets.LongevousDisciple)
      + 0.60 * enabledCelestialDifferentiator * (c[Stats.CD] >= 1.20 ? 1 : 0) * p2(sets.CelestialDifferentiator)
      + 0.04 * (valuePioneerDiverOfDeadWaters > 2 ? 1 : 0) * p4(sets.PioneerDiverOfDeadWaters)

    x[Stats.CD]
      += 0.25 * enabledHunterOfGlacialForest * p4(sets.HunterOfGlacialForest)
      + 0.10 * (valueWastelanderOfBanditryDesert == 2 ? 1 : 0) * p4(sets.WastelanderOfBanditryDesert)
      + 0.10 * (c[Stats.RES] >= 0.30 ? 1 : 0) * p2(sets.BrokenKeel)
      + pioneerSetIndexToCd[valuePioneerDiverOfDeadWaters] * p4(sets.PioneerDiverOfDeadWaters)

    x[Stats.BE]
      += 0.20 * (c[Stats.SPD] >= 145 ? 1 : 0) * p2(sets.TaliaKingdomOfBanditry)
      + 0.30 * enabledWatchmakerMasterOfDreamMachinations * p4(sets.WatchmakerMasterOfDreamMachinations)

    x.BASIC_BOOST
      += 0.10 * p4(sets.MusketeerOfWildWheat)
      + 0.20 * (x[Stats.CR] >= 0.70 ? 1 : 0) * p2(sets.RutilantArena)

    x.SKILL_BOOST
      += 0.12 * p4(sets.FiresmithOfLavaForging)
      + 0.20 * (x[Stats.CR] >= 0.70 ? 1 : 0) * p2(sets.RutilantArena)

    x.ULT_BOOST
      += 0.15 * (x[Stats.CR] >= 0.50 ? 1 : 0) * p2(c.sets.InertSalsotto)

    x.FUA_BOOST
      += 0.15 * (x[Stats.CR] >= 0.50 ? 1 : 0) * p2(c.sets.InertSalsotto)

    x.FUA_BOOST
      += 0.20 * p2(c.sets.TheAshblazingGrandDuke)

    x.DEF_SHRED
      += p4(c.sets.GeniusOfBrilliantStars) ? (enabledGeniusOfBrilliantStars ? 0.20 : 0.10) : 0

    x.DEF_SHRED
      += 0.06 * valuePrisonerInDeepConfinement * p4(c.sets.PrisonerInDeepConfinement)

    x.ELEMENTAL_DMG
      += 0.12 * (x[Stats.SPD] >= 135 ? 1 : 0) * p2(sets.FirmamentFrontlineGlamoth)
      + 0.06 * (x[Stats.SPD] >= 160 ? 1 : 0) * p2(sets.FirmamentFrontlineGlamoth)
      + 0.12 * p2(sets.PioneerDiverOfDeadWaters)

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
    x.ELEMENTAL_DMG += x[ELEMENTAL_DMG_TYPE]

    let cLevel = request.characterLevel
    let eLevel = request.enemyLevel
    let defReduction = x.DEF_SHRED + request.buffDefShred
    let defIgnore = 0

    let dmgBoostMultiplier = 1 + x.ALL_DMG_MULTI + x.ELEMENTAL_DMG
    let dmgReductionMultiplier = 1

    let ehp = x[Stats.HP] / (1 - x[Stats.DEF] / (x[Stats.DEF] + 200 + 10 * request.enemyLevel))
    ehp *= 1 / ((1 - 0.08 * p2(sets.GuardOfWutheringSnow)) * x.DMG_RED_MULTI)
    c.EHP = ehp
    let cv = 100 * (crSum * 2 + cdSum)
    c.CV = cv

    let universalMulti = dmgReductionMultiplier * brokenMultiplier
    const baseResistance = resistance - x.RES_PEN - x[RES_PEN_TYPE]

    calculateDamage(
      x,
      universalMulti,
      dmgBoostMultiplier,
      cLevel,
      eLevel,
      defReduction,
      defIgnore,
      baseResistance,
    )

    /*
     * ************************************************************
     * Filter results
     * ************************************************************
     */

    // Since we exited early on the c comparisons, we only need to check against x stats here. Ignore if top row search
    if (combatDisplay && !topRow) {
      const pass
        = x[Stats.HP] >= request.minHp && x[Stats.HP] <= request.maxHp
        && x[Stats.ATK] >= request.minAtk && x[Stats.ATK] <= request.maxAtk
        && x[Stats.DEF] >= request.minDef && x[Stats.DEF] <= request.maxDef
        && x[Stats.SPD] >= request.minSpd && x[Stats.SPD] <= request.maxSpd
        && x[Stats.CR] >= request.minCr && x[Stats.CR] <= request.maxCr
        && x[Stats.CD] >= request.minCd && x[Stats.CD] <= request.maxCd
        && x[Stats.EHR] >= request.minEhr && x[Stats.EHR] <= request.maxEhr
        && x[Stats.RES] >= request.minRes && x[Stats.RES] <= request.maxRes
        && x[Stats.BE] >= request.minBe && x[Stats.BE] <= request.maxBe
      if (!pass) {
        continue
      }
    }

    let result = (
      cv >= request.minCv && cv <= request.maxCv
      && ehp >= request.minEhp && ehp <= request.maxEhp
      && x.BASIC_DMG >= request.minBasic && x.BASIC_DMG <= request.maxBasic
      && x.SKILL_DMG >= request.minSkill && x.SKILL_DMG <= request.maxSkill
      && x.ULT_DMG >= request.minUlt && x.ULT_DMG <= request.maxUlt
      && x.FUA_DMG >= request.minFua && x.FUA_DMG <= request.maxFua
      && x.DOT_DMG >= request.minDot && x.DOT_DMG <= request.maxDot
    )

    /*
     * ************************************************************
     * Pack the passing results into the ArrayBuffer to return
     * ************************************************************
     */

    if (topRow || result) {
      BufferPacker.packCharacter(arr, col, c)
    }
  }

  self.postMessage({
    rows: [],
    buffer: data.buffer,
  }, [data.buffer])
}

function calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, additionalPen) {
  return (cLevel + 20) / ((eLevel + 20) * Math.max(0, 1 - defReduction - defIgnore - additionalPen) + cLevel + 20)
}

function p4(set) {
  return set >> 2
}

function p2(set) {
  return Math.min(1, set >> 1)
}
