import {Constants, Stats} from '../constants.js'
import { BufferPacker } from '../bufferPacker.js'
import { CharacterConditionals } from "../characterConditionals.js";
import { LightConeConditionals } from "../lightConeConditionals";

function sumRelicStats(headRelics, handsRelics, bodyRelics, feetRelics, planarSphereRelics, linkRopeRelics, h, g, b, f, p, l, statValues) {
  let summedStats = {}
  for (let stat of statValues) {
    summedStats[stat] = headRelics[h].augmentedStats[stat] +
      handsRelics[g].augmentedStats[stat] +
      bodyRelics[b].augmentedStats[stat] +
      feetRelics[f].augmentedStats[stat] +
      planarSphereRelics[p].augmentedStats[stat] +
      linkRopeRelics[l].augmentedStats[stat]
  }
  return summedStats
}

function calculateFlatStat(stat, statP, base, lc, trace, relicSum, setEffects) {
  let result = (base[stat] + lc[stat]) * (1 + setEffects + relicSum[statP] + trace[statP] + lc[statP]) + relicSum[stat] + trace[stat]
  return result
}

function calculateFlatStat2(stat, statP, baseValue, lc, trace, relicSum, setEffects) {
  let result = (baseValue) * (1 + setEffects + relicSum[statP] + trace[statP] + lc[statP]) + relicSum[stat] + trace[stat]
  return result
}

function calculateBaseStat(stat, base, lc) {
  let result = (base[stat] + lc[stat])
  return result
}

function calculatePercentStat(stat, base, lc, trace, relicSum, setEffects) {
  return base[stat] + lc[stat] + relicSum[stat] + trace[stat] + setEffects
}

self.onmessage = function (e) {
  console.warn("Message received from main script", e.data);
  console.warn("Request received from main script", JSON.stringify(e.data.request.characterConditionals, null, 4));

  let data = e.data;
  let relics = data.relics;
  let character = data.character;
  let Stats = Constants.Stats;
  let statValues = Object.values(Stats)
  let arr = new Float32Array(data.buffer)

  let headRelics = relics.Head;
  let handsRelics = relics.Hands;
  let bodyRelics = relics.Body;
  let feetRelics = relics.Feet;
  let planarSphereRelics = relics.PlanarSphere;
  let linkRopeRelics = relics.LinkRope;

  let rows = []
  let lSize = data.consts.lSize
  let pSize = data.consts.pSize
  let fSize = data.consts.fSize
  let bSize = data.consts.bSize
  let gSize = data.consts.gSize
  let hSize = data.consts.hSize

  let relicSetSolutions = data.consts.relicSetSolutions
  let ornamentSetSolutions = data.consts.ornamentSetSolutions

  let relicSetToIndex = data.relicSetToIndex
  let ornamentSetToIndex = data.ornamentSetToIndex

  let elementalMultipliers = data.elementalMultipliers

  let trace = character.traces
  let lc = character.lightCone
  let base = character.base

  let request = data.request
  let setConditionals = request.setConditionals

  let characterConditionals = CharacterConditionals.get(request)
  let lightConeConditionals = LightConeConditionals.get(request)

  let enabledHunterOfGlacialForest          = setConditionals[Constants.Sets.HunterOfGlacialForest][1] == true ? 1 : 0
  let enabledFiresmithOfLavaForging         = setConditionals[Constants.Sets.FiresmithOfLavaForging][1] == true ? 1 : 0
  let enabledGeniusOfBrilliantStars         = setConditionals[Constants.Sets.GeniusOfBrilliantStars][1] == true ? 1 : 0
  let enabledBandOfSizzlingThunder          = setConditionals[Constants.Sets.BandOfSizzlingThunder][1] == true ? 1 : 0
  let enabledMessengerTraversingHackerspace = setConditionals[Constants.Sets.MessengerTraversingHackerspace][1] == true ? 1 : 0
  let enabledPrisonerInDeepConfinement      = setConditionals[Constants.Sets.PrisonerInDeepConfinement][1] == true ? 1 : 0
  let enabledCelestialDifferentiator        = setConditionals[Constants.Sets.CelestialDifferentiator][1] == true ? 1 : 0

  let valueChampionOfStreetwiseBoxing  = setConditionals[Constants.Sets.ChampionOfStreetwiseBoxing][1]
  let valueWastelanderOfBanditryDesert = setConditionals[Constants.Sets.WastelanderOfBanditryDesert][1]
  let valueLongevousDisciple           = setConditionals[Constants.Sets.LongevousDisciple][1]
  let valueTheAshblazingGrandDuke      = setConditionals[Constants.Sets.TheAshblazingGrandDuke][1]

  // console.warn('!!!', request)
  // console.warn('!!!', setConditionals)
  // console.warn('!!!', enabledHunterOfGlacialForest)
  // console.warn('!!!', valueChampionOfStreetwiseBoxing)

  let brokenMultiplier = request.enemyWeaknessBroken ? 1 : 0.9
  let resistance = request.enemyElementalWeak ? 0 : request.enemyResistance

  let precomputedX = characterConditionals.precomputeEffects(request)
  lightConeConditionals.precomputeEffects(precomputedX, request)

  for (let row = 0; row < data.HEIGHT; row++) {
    for (let col = 0; col < data.WIDTH; col++) {
      let index = data.skip + row * data.HEIGHT + col

      if (index >= data.permutations) {
        continue;
      }

      let l = (index % lSize);
      let p = (((index - l) / lSize) % pSize);
      let f = (((index - p * lSize - l) / (lSize * pSize)) % fSize);
      let b = (((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize);
      let g = (((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize);
      let h = (((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize);

      let c = sumRelicStats(headRelics, handsRelics, bodyRelics, feetRelics, planarSphereRelics, linkRopeRelics, h, g, b, f, p, l, statValues)

      let setH = relicSetToIndex[relics.Head[h].set]
      let setG = relicSetToIndex[relics.Hands[g].set]
      let setB = relicSetToIndex[relics.Body[b].set]
      let setF = relicSetToIndex[relics.Feet[f].set]

      let setP = ornamentSetToIndex[relics.PlanarSphere[p].set]
      let setL = ornamentSetToIndex[relics.LinkRope[l].set]

      let relicSetCount = data.consts.relicSetCount
      let ornamentSetCount = data.consts.ornamentSetCount
      let relicSetIndex = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount
      let ornamentSetIndex = setP + setL * ornamentSetCount;

      c.sets = {}
      let sets = c.sets
      sets.PasserbyOfWanderingCloud       = (1 >> (setH ^ 0))  + (1 >> (setG ^ 0))  + (1 >> (setB ^ 0))  + (1 >> (setF ^ 0)) // * 4p -
      sets.MusketeerOfWildWheat           = (1 >> (setH ^ 1))  + (1 >> (setG ^ 1))  + (1 >> (setB ^ 1))  + (1 >> (setF ^ 1)) // * 4p SPD 6% + basic 10%
      sets.KnightOfPurityPalace           = (1 >> (setH ^ 2))  + (1 >> (setG ^ 2))  + (1 >> (setB ^ 2))  + (1 >> (setF ^ 2)) // * 4p SHIELD
      sets.HunterOfGlacialForest          = (1 >> (setH ^ 3))  + (1 >> (setG ^ 3))  + (1 >> (setB ^ 3))  + (1 >> (setF ^ 3)) // * 4p (25% CD)
      sets.ChampionOfStreetwiseBoxing     = (1 >> (setH ^ 4))  + (1 >> (setG ^ 4))  + (1 >> (setB ^ 4))  + (1 >> (setF ^ 4)) // * 4p (5x5% ATK)
      sets.GuardOfWutheringSnow           = (1 >> (setH ^ 5))  + (1 >> (setG ^ 5))  + (1 >> (setB ^ 5))  + (1 >> (setF ^ 5)) // * 4p -
      sets.FiresmithOfLavaForging         = (1 >> (setH ^ 6))  + (1 >> (setG ^ 6))  + (1 >> (setB ^ 6))  + (1 >> (setF ^ 6)) // * 4p 12% skill + (12% Fire)
      sets.GeniusOfBrilliantStars         = (1 >> (setH ^ 7))  + (1 >> (setG ^ 7))  + (1 >> (setB ^ 7))  + (1 >> (setF ^ 7)) //   4p !!! todo
      sets.BandOfSizzlingThunder          = (1 >> (setH ^ 8))  + (1 >> (setG ^ 8))  + (1 >> (setB ^ 8))  + (1 >> (setF ^ 8)) //   4p (20% ATK)
      sets.EagleOfTwilightLine            = (1 >> (setH ^ 9))  + (1 >> (setG ^ 9))  + (1 >> (setB ^ 9))  + (1 >> (setF ^ 9)) //   4p -
      sets.ThiefOfShootingMeteor          = (1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10)) //  4p 16% BE
      sets.WastelanderOfBanditryDesert    = (1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11)) //  4p (10% CD) + (20% CR)
      sets.LongevousDisciple              = (1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12)) //  4p (2x8% CR)
      sets.MessengerTraversingHackerspace = (1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13)) //  4p (12% SPD)
      sets.TheAshblazingGrandDuke         = (1 >> (setH ^ 14)) + (1 >> (setG ^ 14)) + (1 >> (setB ^ 14)) + (1 >> (setF ^ 14)) //  4p (8*6% ATK)
      sets.PrisonerInDeepConfinement      = (1 >> (setH ^ 15)) + (1 >> (setG ^ 15)) + (1 >> (setB ^ 15)) + (1 >> (setF ^ 15)) //  4p !!! todo

      sets.SpaceSealingStation           = (1 >> (setP ^ 0))  + (1 >> (setL ^ 0)) // (12% ATK)
      sets.FleetOfTheAgeless             = (1 >> (setP ^ 1))  + (1 >> (setL ^ 1)) // (8% ATK)
      sets.PanCosmicCommercialEnterprise = (1 >> (setP ^ 2))  + (1 >> (setL ^ 2)) // (25% ATK)
      sets.BelobogOfTheArchitects        = (1 >> (setP ^ 3))  + (1 >> (setL ^ 3)) // (15% DEF)
      sets.CelestialDifferentiator       = (1 >> (setP ^ 4))  + (1 >> (setL ^ 4)) // (60% CR)
      sets.InertSalsotto                 = (1 >> (setP ^ 5))  + (1 >> (setL ^ 5)) // (15% ULT/FUA)
      sets.TaliaKingdomOfBanditry        = (1 >> (setP ^ 6))  + (1 >> (setL ^ 6)) // (20% BE)
      sets.SprightlyVonwacq              = (1 >> (setP ^ 7))  + (1 >> (setL ^ 7)) // -
      sets.RutilantArena                 = (1 >> (setP ^ 8))  + (1 >> (setL ^ 8)) // (20% BASIC/SKILL)
      sets.BrokenKeel                    = (1 >> (setP ^ 9))  + (1 >> (setL ^ 9)) // (10% CD)
      sets.FirmamentFrontlineGlamoth     = (1 >> (setP ^ 10)) + (1 >> (setL ^ 10)) // (12%/18% DMG)
      sets.PenaconyLandOfTheDreams       = (1 >> (setP ^ 11)) + (1 >> (setL ^ 11)) // -

      // ************************************************************
      // Old elemental dmg logic
      // ************************************************************

      c.ELEMENTAL_DMG = 0
      if (elementalMultipliers[0]) c.ELEMENTAL_DMG = calculatePercentStat(Stats.Physical_DMG,  base, lc, trace, c, 0.10 * p2(sets.ChampionOfStreetwiseBoxing))
      if (elementalMultipliers[1]) c.ELEMENTAL_DMG = calculatePercentStat(Stats.Fire_DMG,      base, lc, trace, c, 0.10 * p2(sets.FiresmithOfLavaForging) + 0.10*enabledFiresmithOfLavaForging*p4(sets.FiresmithOfLavaForging))
      if (elementalMultipliers[2]) c.ELEMENTAL_DMG = calculatePercentStat(Stats.Ice_DMG,       base, lc, trace, c, 0.10 * p2(sets.HunterOfGlacialForest))
      if (elementalMultipliers[3]) c.ELEMENTAL_DMG = calculatePercentStat(Stats.Lightning_DMG, base, lc, trace, c, 0.10 * p2(sets.BandOfSizzlingThunder))
      if (elementalMultipliers[4]) c.ELEMENTAL_DMG = calculatePercentStat(Stats.Wind_DMG,      base, lc, trace, c, 0.10 * p2(sets.EagleOfTwilightLine))
      if (elementalMultipliers[5]) c.ELEMENTAL_DMG = calculatePercentStat(Stats.Quantum_DMG,   base, lc, trace, c, 0.10 * p2(sets.GeniusOfBrilliantStars))
      if (elementalMultipliers[6]) c.ELEMENTAL_DMG = calculatePercentStat(Stats.Imaginary_DMG, base, lc, trace, c, 0.10 * p2(sets.WastelanderOfBanditryDesert))

      let crSum = c[Stats.CR]
      let cdSum = c[Stats.CD]

      // ************************************************************
      // Calculate base stats
      // ************************************************************

      let baseHp  = calculateBaseStat(Stats.HP, base, lc)
      let baseAtk = calculateBaseStat(Stats.ATK, base, lc)
      let baseDef = calculateBaseStat(Stats.DEF, base, lc)
      let baseSpd = calculateBaseStat(Stats.SPD, base, lc)

      // ************************************************************
      // Calculate display stats with unconditional sets
      // ************************************************************

      c[Stats.HP]  = calculateFlatStat2(Stats.HP,  Stats.HP_P,  baseHp,  lc, trace, c,
        0.12*p2(sets.FleetOfTheAgeless) +
        0.12*p2(sets.LongevousDisciple))

      c[Stats.ATK] = calculateFlatStat2(Stats.ATK, Stats.ATK_P, baseAtk, lc, trace, c,
        0.12*p2(sets.SpaceSealingStation) +
        0.12*p2(sets.FirmamentFrontlineGlamoth) +
        0.12*p2(sets.MusketeerOfWildWheat) +
        0.12*p2(sets.PrisonerInDeepConfinement))

      c[Stats.DEF] = calculateFlatStat2(Stats.DEF, Stats.DEF_P, baseDef, lc, trace, c,
        0.15*p2(sets.BelobogOfTheArchitects) +
        0.15*p2(sets.KnightOfPurityPalace))

      c[Stats.SPD] = calculateFlatStat2(Stats.SPD, Stats.SPD_P, baseSpd, lc, trace, c,
        0.06*p2(sets.MessengerTraversingHackerspace) +
        0.06*p4(sets.MusketeerOfWildWheat))

      c[Stats.CR]  = calculatePercentStat(Stats.CR,  base, lc, trace, c,
        0.08*p2(sets.InertSalsotto) +
        0.08*p2(sets.RutilantArena))

      c[Stats.CD]  = calculatePercentStat(Stats.CD,  base, lc, trace, c,
        0.16*p2(sets.CelestialDifferentiator))

      c[Stats.EHR] = calculatePercentStat(Stats.EHR, base, lc, trace, c,
        0.10*p2(sets.PanCosmicCommercialEnterprise))

      c[Stats.RES] = calculatePercentStat(Stats.RES, base, lc, trace, c,
        0.10*p2(sets.BrokenKeel))

      c[Stats.BE]  = calculatePercentStat(Stats.BE,  base, lc, trace, c,
        0.16*p2(sets.TaliaKingdomOfBanditry) +
        0.16*p2(sets.ThiefOfShootingMeteor) +
        0.16*p4(sets.ThiefOfShootingMeteor))

      c[Stats.ERR] = calculatePercentStat(Stats.ERR, base, lc, trace, c,
        0.05*p2(sets.SprightlyVonwacq) +
        0.05*p2(sets.PenaconyLandOfTheDreams))

      c[Stats.OHB] = calculatePercentStat(Stats.OHB, base, lc, trace, c,
        0.10*p2(sets.PasserbyOfWanderingCloud))

      c.id = index

      // ************************************************************
      // Set up calculated stats storage x
      // ************************************************************

      let x = Object.assign({}, precomputedX)
      c.x = x

      x[Stats.ATK] += c[Stats.ATK]
      x[Stats.DEF] += c[Stats.DEF]
      x[Stats.HP]  += c[Stats.HP]
      x[Stats.SPD] += c[Stats.SPD]
      x[Stats.CD]  += c[Stats.CD]
      x[Stats.CR]  += c[Stats.CR]
      x[Stats.EHR] += c[Stats.EHR]
      x[Stats.RES] += c[Stats.RES]
      x[Stats.BE]  += c[Stats.BE]
      x[Stats.ERR] += c[Stats.ERR]
      x[Stats.OHB] += c[Stats.OHB]
      x.ELEMENTAL_DMG += c.ELEMENTAL_DMG

      x[Stats.ATK] += request.buffAtk
      x[Stats.ATK] += request.buffAtkP * baseAtk
      x[Stats.CD]  += request.buffCd
      x[Stats.CR]  += request.buffCr

      // ************************************************************
      // Calculate passive effects & buffs. x stores the internally calculated character stats
      // ************************************************************

      characterConditionals.calculatePassives(c, request)
      lightConeConditionals.calculatePassives(c, request)

      // ************************************************************
      // Calculate conditional set effects
      // ************************************************************

      x[Stats.SPD_P] +=
        0.12*enabledMessengerTraversingHackerspace*p4(sets.MessengerTraversingHackerspace)

      x[Stats.ATK_P] +=
        0.05*valueChampionOfStreetwiseBoxing*p4(sets.ChampionOfStreetwiseBoxing) +
        0.20*enabledBandOfSizzlingThunder*p4(sets.BandOfSizzlingThunder) +
        0.06*valueTheAshblazingGrandDuke*p4(sets.TheAshblazingGrandDuke) +
        0.12*(x[Stats.SPD] >= 120 ? 1 : 0)*p2(sets.SpaceSealingStation) +
        0.08*(x[Stats.SPD] >= 120 ? 1 : 0)*p2(sets.FleetOfTheAgeless) +
        Math.min(0.25, 0.25*c[Stats.EHR])*p2(sets.PanCosmicCommercialEnterprise)

      x[Stats.DEF_P] +=
        0.15*(c[Stats.EHR] >= 0.50 ? 1 : 0)*p2(sets.BelobogOfTheArchitects)

      x[Stats.CR] +=
        0.10*(valueWastelanderOfBanditryDesert > 0 ? 1 : 0)*p4(sets.WastelanderOfBanditryDesert) +
        0.08*valueLongevousDisciple*p4(sets.LongevousDisciple) +
        0.60*enabledCelestialDifferentiator*(c[Stats.CD] >= 1.20 ? 1 : 0)*p2(sets.CelestialDifferentiator)

      x[Stats.CD] +=
        0.25*enabledHunterOfGlacialForest*p4(sets.HunterOfGlacialForest) +
        0.10*(valueWastelanderOfBanditryDesert == 2 ? 1 : 0)*p4(sets.WastelanderOfBanditryDesert) +
        0.10*(c[Stats.RES] >= 0.30 ? 1 : 0)*p2(sets.BrokenKeel)

      x[Stats.BE] +=
        0.20*(c[Stats.SPD] >= 145 ? 1 : 0)*p2(sets.TaliaKingdomOfBanditry)

      x.BASIC_BOOST +=
        0.10*p4(sets.MusketeerOfWildWheat) +
        0.20*(x[Stats.CR] >= 0.70 ? 1 : 0)*p2(sets.RutilantArena)

      x.SKILL_BOOST +=
        0.12*p4(sets.FiresmithOfLavaForging) +
        0.20*(x[Stats.CR] >= 0.70 ? 1 : 0)*p2(sets.RutilantArena)

      x.ULT_BOOST +=
        0.15*(x[Stats.CR] >= 0.50 ? 1 : 0)*p2(c.sets.InertSalsotto)

      x.FUA_BOOST +=
        0.15*(x[Stats.CR] >= 0.50 ? 1 : 0)*p2(c.sets.InertSalsotto)

      x.DEF_SHRED += (enabledGeniusOfBrilliantStars && p4(c.sets.GeniusOfBrilliantStars)) ? (request.enemyQuantumWeak ? 0.20 : 0.10) : 0

      // These stats have no conditional set effects yet
      // x[Stats.HP_P] += 0
      // x[Stats.EHR]  += 0
      // x[Stats.RES]  += 0
      // x[Stats.ERR]  += 0
      // x[Stats.OHB]  += 0

      // ************************************************************
      // Calculate ratings
      // ************************************************************

      let damageBonus =
        0.12*(x[Stats.SPD] >= 135 ? 1 : 0)*p2(sets.FirmamentFrontlineGlamoth) +
        0.06*(x[Stats.SPD] >= 160 ? 1 : 0)*p2(sets.FirmamentFrontlineGlamoth)

      x.ELEMENTAL_DMG += damageBonus

      let cappedCrit = Math.min(x[Stats.CR] + request.buffCr, 1)
      let dmg = 0 // (x[Stats.ATK] + request.buffAtk + (request.buffAtkP * (base[Stats.ATK] + lc[Stats.ATK]))) * ((1 - cappedCrit) + (1 + x[Stats.CD] + request.buffCd) * cappedCrit) * (1 + x.ELEMENTAL_DMG + damageBonus)
      let mcd = 0 // (x[Stats.ATK] + request.buffAtk + (request.buffAtkP * (base[Stats.ATK] + lc[Stats.ATK]))) * (1 + x[Stats.CD] + request.buffCd) * (1 + x.ELEMENTAL_DMG + damageBonus)
      let ehp = 0 // x[Stats.HP] / (1 - x[Stats.DEF] / (x[Stats.DEF] + 200 + 10 * 80)) * (1 + 0.08*p2(sets.GuardOfWutheringSnow))
      let cv = 100 * (crSum * 2 + cdSum)

      c.CV = cv
      c.DMG = dmg
      c.MCD = mcd
      c.EHP = ehp

      // ************************************************************
      // Add % sum back to the base
      // ************************************************************

      x[Stats.ATK] += x[Stats.ATK_P] * baseAtk
      x[Stats.DEF] += x[Stats.DEF_P] * baseDef
      x[Stats.HP]  += x[Stats.HP_P]  * baseHp
      x[Stats.SPD] += x[Stats.SPD_P] * baseSpd

      // ************************************************************
      // Calculate skill base damage
      // ************************************************************

      characterConditionals.calculateBaseMultis(c, request)
      lightConeConditionals.calculateBaseMultis(c, request)

      // ************************************************************
      // Calculate overall multipliers
      // ************************************************************

      let cLevel = request.characterLevel
      let eLevel = request.enemyLevel
      let defReduction = x.DEF_SHRED
      let defIgnore = 0

      let dmgBoostMultiplier = 1 + x.ALL_DMG_MULTI + x.ELEMENTAL_DMG
      let resMultiplier = 1 - (resistance - x.RES_PEN)
      let dmgTakenMultiplier = 1 + x.DMG_TAKEN_MULTI
      let dmgReductionMultiplier = 1

      let universalMulti = resMultiplier * dmgTakenMultiplier * dmgReductionMultiplier * brokenMultiplier

      x.BASIC_DMG *= universalMulti * (dmgBoostMultiplier + x.BASIC_BOOST) * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BASIC_DEF_PEN) * (Math.min(1, x[Stats.CR] + x.BASIC_CR_BOOST) * (1 + x[Stats.CD] + x.BASIC_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.BASIC_CR_BOOST)))
      x.SKILL_DMG *= universalMulti * (dmgBoostMultiplier + x.SKILL_BOOST) * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.SKILL_DEF_PEN) * (Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST) * (1 + x[Stats.CD] + x.SKILL_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST)))
      x.ULT_DMG   *= universalMulti * (dmgBoostMultiplier + x.ULT_BOOST)   * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.ULT_DEF_PEN)   * (Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST)   * (1 + x[Stats.CD] + x.ULT_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST)))
      x.FUA_DMG   *= universalMulti * (dmgBoostMultiplier + x.FUA_BOOST)   * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.FUA_DEF_PEN)   * (Math.min(1, x[Stats.CR] + x.FUA_CR_BOOST)   * (1 + x[Stats.CD] + x.FUA_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.FUA_CR_BOOST)))

      // ************************************************************
      // Filter results
      // ************************************************************

      let result =
        c[Stats.HP]  >= request.minHp  && c[Stats.HP]  <= request.maxHp  &&
        c[Stats.ATK] >= request.minAtk && c[Stats.ATK] <= request.maxAtk &&
        c[Stats.DEF] >= request.minDef && c[Stats.DEF] <= request.maxDef &&
        c[Stats.SPD] >= request.minSpd && c[Stats.SPD] <= request.maxSpd &&
        c[Stats.CR]  >= request.minCr  && c[Stats.CR]  <= request.maxCr  &&
        c[Stats.CD]  >= request.minCd  && c[Stats.CD]  <= request.maxCd  &&
        c[Stats.EHR] >= request.minEhr && c[Stats.EHR] <= request.maxEhr &&
        c[Stats.RES] >= request.minRes && c[Stats.RES] <= request.maxRes &&
        c[Stats.BE]  >= request.minBe  && c[Stats.BE]  <= request.maxBe  &&
        cv  >= request.minCv  && cv  <= request.maxCv  &&
        dmg >= request.minDmg && dmg <= request.maxDmg &&
        mcd >= request.minMcd && mcd <= request.maxMcd &&
        ehp >= request.minEhp && ehp <= request.maxEhp

      // ************************************************************
      // Pack passing results into the ArrayBuffer to return
      // ************************************************************

      if (result && (relicSetSolutions[relicSetIndex] == 1) && (ornamentSetSolutions[ornamentSetIndex] == 1)) {
        BufferPacker.packCharacter(arr, row * data.HEIGHT + col, c);
      }
    }
  }

  self.postMessage({
    rows: [],
    buffer: data.buffer
  }, [data.buffer]);
}

function calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, additionalPen) {
  return (cLevel + 20) / ((eLevel + 20) * (1 - defReduction - defIgnore - additionalPen) + cLevel + 20)
}

function p4(set) {
  return set >> 2
}

function p2(set) {
  return Math.min(1, set >> 1)
}
