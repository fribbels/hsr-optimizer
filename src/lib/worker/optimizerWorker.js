import { lib } from './testLib.js'
import { Constants } from '../constants.js'
import { character } from 'stylis';

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
  console.log("Message received from main script", e.data);

  let data = e.data;
  let relics = data.relics;
  let character = data.character;
  let Stats = Constants.Stats;
  let statValues = Object.values(Stats)

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

  console.warn('!!!', request)
  console.warn('!!!', setConditionals)
  console.warn('!!!', enabledHunterOfGlacialForest)
  console.warn('!!!', valueChampionOfStreetwiseBoxing)

  for (let row = 0; row < data.HEIGHT; row++) {
    for (let col = 0; col < data.WIDTH; col++) {
      
      let x = data.skip + row * data.HEIGHT + col

      if (x >= data.permutations) {
        continue;
      }

      let l = (x % lSize);
      let p = (((x - l) / lSize) % pSize);
      let f = (((x - p * lSize - l) / (lSize * pSize)) % fSize);
      let b = (((x - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize);
      let g = (((x - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize);
      let h = (((x - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize);

      let relicSum = sumRelicStats(headRelics, handsRelics, bodyRelics, feetRelics, planarSphereRelics, linkRopeRelics, h, g, b, f, p, l, statValues)

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

      let PasserbyOfWanderingCloud       = (1 >> (setH ^ 0))  + (1 >> (setG ^ 0))  + (1 >> (setB ^ 0))  + (1 >> (setF ^ 0)) // * 4p -
      let MusketeerOfWildWheat           = (1 >> (setH ^ 1))  + (1 >> (setG ^ 1))  + (1 >> (setB ^ 1))  + (1 >> (setF ^ 1)) // * 4p SPD 6% + basic 10%
      let KnightOfPurityPalace           = (1 >> (setH ^ 2))  + (1 >> (setG ^ 2))  + (1 >> (setB ^ 2))  + (1 >> (setF ^ 2)) // * 4p SHIELD
      let HunterOfGlacialForest          = (1 >> (setH ^ 3))  + (1 >> (setG ^ 3))  + (1 >> (setB ^ 3))  + (1 >> (setF ^ 3)) // * 4p (25% CD)
      let ChampionOfStreetwiseBoxing     = (1 >> (setH ^ 4))  + (1 >> (setG ^ 4))  + (1 >> (setB ^ 4))  + (1 >> (setF ^ 4)) // * 4p (5x5% ATK)
      let GuardOfWutheringSnow           = (1 >> (setH ^ 5))  + (1 >> (setG ^ 5))  + (1 >> (setB ^ 5))  + (1 >> (setF ^ 5)) // * 4p -
      let FiresmithOfLavaForging         = (1 >> (setH ^ 6))  + (1 >> (setG ^ 6))  + (1 >> (setB ^ 6))  + (1 >> (setF ^ 6)) // * 4p 12% skill + (12% Fire)
      let GeniusOfBrilliantStars         = (1 >> (setH ^ 7))  + (1 >> (setG ^ 7))  + (1 >> (setB ^ 7))  + (1 >> (setF ^ 7)) //   4p !!! todo
      let BandOfSizzlingThunder          = (1 >> (setH ^ 8))  + (1 >> (setG ^ 8))  + (1 >> (setB ^ 8))  + (1 >> (setF ^ 8)) //   4p (20% ATK)
      let EagleOfTwilightLine            = (1 >> (setH ^ 9))  + (1 >> (setG ^ 9))  + (1 >> (setB ^ 9))  + (1 >> (setF ^ 9)) //   4p -
      let ThiefOfShootingMeteor          = (1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10)) //  4p 16% BE
      let WastelanderOfBanditryDesert    = (1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11)) //  4p (10% CD) + (20% CR)
      let LongevousDisciple              = (1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12)) //  4p (2x8% CR)
      let MessengerTraversingHackerspace = (1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13)) //  4p (12% SPD)
      let TheAshblazingGrandDuke         = (1 >> (setH ^ 14)) + (1 >> (setG ^ 14)) + (1 >> (setB ^ 14)) + (1 >> (setF ^ 14)) //  4p (8*6% ATK)
      let PrisonerInDeepConfinement      = (1 >> (setH ^ 15)) + (1 >> (setG ^ 15)) + (1 >> (setB ^ 15)) + (1 >> (setF ^ 15)) //  4p !!! todo

      let SpaceSealingStation           = (1 >> (setP ^ 0))  + (1 >> (setL ^ 0)) // (12% ATK)
      let FleetOfTheAgeless             = (1 >> (setP ^ 1))  + (1 >> (setL ^ 1)) //
      let PanCosmicCommercialEnterprise = (1 >> (setP ^ 2))  + (1 >> (setL ^ 2)) //
      let BelobogOfTheArchitects        = (1 >> (setP ^ 3))  + (1 >> (setL ^ 3)) //
      let CelestialDifferentiator       = (1 >> (setP ^ 4))  + (1 >> (setL ^ 4)) //
      let InertSalsotto                 = (1 >> (setP ^ 5))  + (1 >> (setL ^ 5)) //
      let TaliaKingdomOfBanditry        = (1 >> (setP ^ 6))  + (1 >> (setL ^ 6)) //
      let SprightlyVonwacq              = (1 >> (setP ^ 7))  + (1 >> (setL ^ 7)) //
      let RutilantArena                 = (1 >> (setP ^ 8))  + (1 >> (setL ^ 8)) //
      let BrokenKeel                    = (1 >> (setP ^ 9))  + (1 >> (setL ^ 9)) //
      let FirmamentFrontlineGlamoth     = (1 >> (setP ^ 10)) + (1 >> (setL ^ 10)) //
      let PenaconyLandOfTheDreams       = (1 >> (setP ^ 11)) + (1 >> (setL ^ 11)) // 

      let elementalDmg = 0
      if (elementalMultipliers[0]) elementalDmg = calculatePercentStat(Stats.Physical_DMG,  base, lc, trace, relicSum, 0.10 * p2(ChampionOfStreetwiseBoxing))
      if (elementalMultipliers[1]) elementalDmg = calculatePercentStat(Stats.Fire_DMG,      base, lc, trace, relicSum, 0.10 * p2(FiresmithOfLavaForging) + 0.10*enabledFiresmithOfLavaForging*p4(FiresmithOfLavaForging))
      if (elementalMultipliers[2]) elementalDmg = calculatePercentStat(Stats.Ice_DMG,       base, lc, trace, relicSum, 0.10 * p2(HunterOfGlacialForest))
      if (elementalMultipliers[3]) elementalDmg = calculatePercentStat(Stats.Lightning_DMG, base, lc, trace, relicSum, 0.10 * p2(BandOfSizzlingThunder))
      if (elementalMultipliers[4]) elementalDmg = calculatePercentStat(Stats.Wind_DMG,      base, lc, trace, relicSum, 0.10 * p2(EagleOfTwilightLine))
      if (elementalMultipliers[5]) elementalDmg = calculatePercentStat(Stats.Quantum_DMG,   base, lc, trace, relicSum, 0.10 * p2(GeniusOfBrilliantStars))
      if (elementalMultipliers[6]) elementalDmg = calculatePercentStat(Stats.Imaginary_DMG, base, lc, trace, relicSum, 0.10 * p2(WastelanderOfBanditryDesert))

      let character = {}

      let crSum = relicSum[Stats.CR]
      let cdSum = relicSum[Stats.CD]

      let baseHp  = calculateBaseStat(Stats.HP, base, lc)
      let baseAtk = calculateBaseStat(Stats.ATK, base, lc)
      let baseDef = calculateBaseStat(Stats.DEF, base, lc)
      let baseSpd = calculateBaseStat(Stats.SPD, base, lc)

      character[Stats.HP]  = calculateFlatStat2(Stats.HP,  Stats.HP_P,  baseHp,  lc, trace, relicSum, 0.12*p2(FleetOfTheAgeless) +
                                                                                                      0.12*p2(LongevousDisciple))
      character[Stats.ATK] = calculateFlatStat2(Stats.ATK, Stats.ATK_P, baseAtk, lc, trace, relicSum, 0.12*p2(SpaceSealingStation) +
                                                                                                      0.12*p2(FirmamentFrontlineGlamoth) +
                                                                                                      0.12*p2(MusketeerOfWildWheat) +
                                                                                                      0.12*p2(PrisonerInDeepConfinement))
      character[Stats.DEF] = calculateFlatStat2(Stats.DEF, Stats.DEF_P, baseDef, lc, trace, relicSum, 0.15*p2(BelobogOfTheArchitects) +
                                                                                                      0.15*p2(KnightOfPurityPalace))
      character[Stats.SPD] = calculateFlatStat2(Stats.SPD, Stats.SPD_P, baseSpd, lc, trace, relicSum, 0.06*p2(MessengerTraversingHackerspace) +
                                                                                                      0.06*p4(MusketeerOfWildWheat))

      character[Stats.CR]  = calculatePercentStat(Stats.CR,  base, lc, trace, relicSum, 0.08*p2(InertSalsotto) +
                                                                                        0.08*p2(RutilantArena))
      character[Stats.CD]  = calculatePercentStat(Stats.CD,  base, lc, trace, relicSum, 0.16*p2(CelestialDifferentiator))
      character[Stats.EHR] = calculatePercentStat(Stats.EHR, base, lc, trace, relicSum, 0.10*p2(PanCosmicCommercialEnterprise))
      character[Stats.RES] = calculatePercentStat(Stats.RES, base, lc, trace, relicSum, 0.10*p2(BrokenKeel))
      character[Stats.BE]  = calculatePercentStat(Stats.BE,  base, lc, trace, relicSum, 0.16*p2(TaliaKingdomOfBanditry) +
                                                                                        0.16*p2(ThiefOfShootingMeteor) +
                                                                                        0.16*p4(ThiefOfShootingMeteor))
      character[Stats.ERR] = calculatePercentStat(Stats.ERR, base, lc, trace, relicSum, 0.05*p2(SprightlyVonwacq) +
                                                                                        0.05*p2(PenaconyLandOfTheDreams))
      character[Stats.OHB] = calculatePercentStat(Stats.OHB, base, lc, trace, relicSum, 0.10*p2(PasserbyOfWanderingCloud))
      character.ED = elementalDmg
      character.id = x

      let calculatedSpd = character[Stats.SPD] + 0.12*baseSpd*enabledMessengerTraversingHackerspace*p4(MessengerTraversingHackerspace)

      let calculated = {
        [Stats.HP]:  character[Stats.HP],
        [Stats.ATK]: character[Stats.ATK] + baseAtk*(0.05*valueChampionOfStreetwiseBoxing*p4(ChampionOfStreetwiseBoxing) + 
                                                     0.20*enabledBandOfSizzlingThunder*p4(BandOfSizzlingThunder) + 
                                                     0.06*valueTheAshblazingGrandDuke*p4(TheAshblazingGrandDuke) +
                                                     0.12*(calculatedSpd >= 120 ? 1 : 0)*p2(SpaceSealingStation) +
                                                     0.08*(calculatedSpd >= 120 ? 1 : 0)*p2(FleetOfTheAgeless)),
        [Stats.DEF]: character[Stats.DEF],
        [Stats.SPD]: calculatedSpd,
        [Stats.CR]:  character[Stats.CR] + 0.10*(valueWastelanderOfBanditryDesert > 0 ? 1 : 0)*p4(WastelanderOfBanditryDesert) + 
                                           0.08*valueLongevousDisciple*p4(LongevousDisciple),
        [Stats.CD]:  character[Stats.CD] + 0.25*enabledHunterOfGlacialForest*p4(HunterOfGlacialForest) + 
                                           0.10*(valueWastelanderOfBanditryDesert == 2 ? 1 : 0)*p4(WastelanderOfBanditryDesert),
        [Stats.EHR]: character[Stats.EHR],
        [Stats.RES]: character[Stats.RES],
        [Stats.BE]:  character[Stats.BE],
        [Stats.ERR]: character[Stats.ERR],
        [Stats.OHB]: character[Stats.OHB],
        [Stats.ED]:  character.ED,
      }

      let cappedCrit = Math.min(calculated[Stats.CR] + request.buffCr, 1)
      let dmg = (calculated[Stats.ATK] + request.buffAtk + (request.buffAtkP * (base[Stats.ATK] + lc[Stats.ATK]))) * ((1 - cappedCrit) + (1 + calculated[Stats.CD] + request.buffCd) * cappedCrit) * (1 + elementalDmg)
      let mcd = (calculated[Stats.ATK] + request.buffAtk + (request.buffAtkP * (base[Stats.ATK] + lc[Stats.ATK]))) * (1 + calculated[Stats.CD] + request.buffCd) * (1 + elementalDmg)
      let ehp = calculated[Stats.HP] / (1 - calculated[Stats.DEF] / (calculated[Stats.DEF] + 200 + 10 * 80)) * (1 + 0.08*p2(GuardOfWutheringSnow))
      let cv = 100 * (crSum * 2 + cdSum)

      character.CV = cv
      character.DMG = dmg
      character.MCD = mcd
      character.EHP = ehp

      character.basic = 100 * (1 + 0.10*p4(MusketeerOfWildWheat))
      character.skill = 100 * (1 + 0.12*p4(FiresmithOfLavaForging))
      character.ult =   100 * (1 + 0)
      character.extra = 100 * (1 + 0)

      let result =
        character[Stats.HP]  >= request.minHp  && character[Stats.HP]  <= request.maxHp  &&
        character[Stats.ATK] >= request.minAtk && character[Stats.ATK] <= request.maxAtk &&
        character[Stats.DEF] >= request.minDef && character[Stats.DEF] <= request.maxDef &&
        character[Stats.SPD] >= request.minSpd && character[Stats.SPD] <= request.maxSpd &&
        character[Stats.CR]  >= request.minCr  && character[Stats.CR]  <= request.maxCr  &&
        character[Stats.CD]  >= request.minCd  && character[Stats.CD]  <= request.maxCd  &&
        character[Stats.EHR] >= request.minEhr && character[Stats.EHR] <= request.maxEhr &&
        character[Stats.RES] >= request.minRes && character[Stats.RES] <= request.maxRes &&
        character[Stats.BE]  >= request.minBe  && character[Stats.BE]  <= request.maxBe  &&
        cv  >= request.minCv  && cv  <= request.maxCv  &&
        dmg >= request.minDmg && dmg <= request.maxDmg &&
        mcd >= request.minMcd && mcd <= request.maxMcd &&
        ehp >= request.minEhp && ehp <= request.maxEhp

      // calculateCharacterColumns(character)

      if (result && (relicSetSolutions[relicSetIndex] == 1) && (ornamentSetSolutions[ornamentSetIndex] == 1)) {
        rows.push(character)
      }
    }
  }

  self.postMessage({
    rows: rows,
  });
}

function p4(set) {
  return set >> 2
}

function p2(set) {
  return Math.min(1, set >> 1)
}