// import { Constants, OrnamentSetToIndex, RelicSetToIndex, Stats } from 'lib/constants'
//
// const relicSetCount = Object.values(Constants.SetsRelics).length
// const ornamentSetCount = Object.values(Constants.SetsOrnaments).length
// const statValues = Object.values(Stats)
// /*
// pseudo types
// params {
//   relicSetSolutions
//   ornamentSetSolutions
//   topRow
//   element
//   enabledHunterOfGlacialForest
//   enabledFiresmithOfLavaForging
//   enabledGeniusOfBrilliantStars
//   enabledBandOfSizzlingThunder
//   enabledMessengerTraversingHackerspace
//   enabledCelestialDifferentiator
//   enabledWatchmakerMasterOfDreamMachinations
//   valueChampionOfStreetwiseBoxing
//   valueWastelanderOfBanditryDesert
//   valueLongevousDisciple
//   valueTheAshblazingGrandDuke
//   valuePrisonerInDeepConfinement
//   valuePioneerDiverOfDeadWaters
// }
//
//  */
//
// function sumRelicStats(head, hands, body, feet, planarSphere, linkRope) {
//   let summedStats = {}
//   for (let stat of statValues) {
//     summedStats[stat]
//       = head.augmentedStats[stat]
//       + hands.augmentedStats[stat]
//       + body.augmentedStats[stat]
//       + feet.augmentedStats[stat]
//       + planarSphere.augmentedStats[stat]
//       + linkRope.augmentedStats[stat]
//   }
//   summedStats.WEIGHT
//     = head.weightScore
//     + hands.weightScore
//     + body.weightScore
//     + feet.weightScore
//     + planarSphere.weightScore
//     + linkRope.weightScore
//
//   return summedStats
// }
//
// function calculatePercentStat(stat, base, lc, trace, relicSum, setEffects) {
//   return base[stat] + lc[stat] + relicSum[stat] + trace[stat] + setEffects
// }
//
// function optimize(build, params, request) {
//   const head = build.Head
//   const hands = build.Hands
//   const body = build.Body
//   const feet = build.Feet
//   const planarSphere = build.PlanarSphere
//   const linkRope = build.LinkRope
//
//   const setH = RelicSetToIndex[head.set]
//   const setG = RelicSetToIndex[hands.set]
//   const setB = RelicSetToIndex[body.set]
//   const setF = RelicSetToIndex[feet.set]
//
//   const setP = OrnamentSetToIndex[planarSphere.set]
//   const setL = OrnamentSetToIndex[linkRope.set]
//
//   const relicSetIndex = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount
//   const ornamentSetIndex = setP + setL * ornamentSetCount
//
//   // Exit early if sets dont match unless its a topRow search
//   if (params.relicSetSolutions[relicSetIndex] != 1 || params.ornamentSetSolutions[ornamentSetIndex] != 1) {
//     if (!params.topRow) {
//       return null
//     }
//   }
//
//   const c = sumRelicStats(head, hands, body, feet, planarSphere, linkRope)
//
//   c.relicSetIndex = relicSetIndex
//   c.ornamentSetIndex = ornamentSetIndex
//
//   c.sets = {
//     PasserbyOfWanderingCloud: (1 >> (setH ^ 0)) + (1 >> (setG ^ 0)) + (1 >> (setB ^ 0)) + (1 >> (setF ^ 0)),
//     MusketeerOfWildWheat: (1 >> (setH ^ 1)) + (1 >> (setG ^ 1)) + (1 >> (setB ^ 1)) + (1 >> (setF ^ 1)),
//     KnightOfPurityPalace: (1 >> (setH ^ 2)) + (1 >> (setG ^ 2)) + (1 >> (setB ^ 2)) + (1 >> (setF ^ 2)),
//     HunterOfGlacialForest: (1 >> (setH ^ 3)) + (1 >> (setG ^ 3)) + (1 >> (setB ^ 3)) + (1 >> (setF ^ 3)),
//     ChampionOfStreetwiseBoxing: (1 >> (setH ^ 4)) + (1 >> (setG ^ 4)) + (1 >> (setB ^ 4)) + (1 >> (setF ^ 4)),
//     GuardOfWutheringSnow: (1 >> (setH ^ 5)) + (1 >> (setG ^ 5)) + (1 >> (setB ^ 5)) + (1 >> (setF ^ 5)),
//     FiresmithOfLavaForging: (1 >> (setH ^ 6)) + (1 >> (setG ^ 6)) + (1 >> (setB ^ 6)) + (1 >> (setF ^ 6)),
//     GeniusOfBrilliantStars: (1 >> (setH ^ 7)) + (1 >> (setG ^ 7)) + (1 >> (setB ^ 7)) + (1 >> (setF ^ 7)),
//     BandOfSizzlingThunder: (1 >> (setH ^ 8)) + (1 >> (setG ^ 8)) + (1 >> (setB ^ 8)) + (1 >> (setF ^ 8)),
//     EagleOfTwilightLine: (1 >> (setH ^ 9)) + (1 >> (setG ^ 9)) + (1 >> (setB ^ 9)) + (1 >> (setF ^ 9)),
//     ThiefOfShootingMeteor: (1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10)),
//     WastelanderOfBanditryDesert: (1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11)),
//     LongevousDisciple: (1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12)),
//     MessengerTraversingHackerspace: (1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13)),
//     TheAshblazingGrandDuke: (1 >> (setH ^ 14)) + (1 >> (setG ^ 14)) + (1 >> (setB ^ 14)) + (1 >> (setF ^ 14)),
//     PrisonerInDeepConfinement: (1 >> (setH ^ 15)) + (1 >> (setG ^ 15)) + (1 >> (setB ^ 15)) + (1 >> (setF ^ 15)),
//     PioneerDiverOfDeadWaters: (1 >> (setH ^ 16)) + (1 >> (setG ^ 16)) + (1 >> (setB ^ 16)) + (1 >> (setF ^ 16)),
//     WatchmakerMasterOfDreamMachinations: (1 >> (setH ^ 17)) + (1 >> (setG ^ 17)) + (1 >> (setB ^ 17)) + (1 >> (setF ^ 17)),
//
//     SpaceSealingStation: (1 >> (setP ^ 0)) + (1 >> (setL ^ 0)),
//     FleetOfTheAgeless: (1 >> (setP ^ 1)) + (1 >> (setL ^ 1)),
//     PanCosmicCommercialEnterprise: (1 >> (setP ^ 2)) + (1 >> (setL ^ 2)),
//     BelobogOfTheArchitects: (1 >> (setP ^ 3)) + (1 >> (setL ^ 3)),
//     CelestialDifferentiator: (1 >> (setP ^ 4)) + (1 >> (setL ^ 4)),
//     InertSalsotto: (1 >> (setP ^ 5)) + (1 >> (setL ^ 5)),
//     TaliaKingdomOfBanditry: (1 >> (setP ^ 6)) + (1 >> (setL ^ 6)),
//     SprightlyVonwacq: (1 >> (setP ^ 7)) + (1 >> (setL ^ 7)),
//     RutilantArena: (1 >> (setP ^ 8)) + (1 >> (setL ^ 8)),
//     BrokenKeel: (1 >> (setP ^ 9)) + (1 >> (setL ^ 9)),
//     FirmamentFrontlineGlamoth: (1 >> (setP ^ 10)) + (1 >> (setL ^ 10)),
//     PenaconyLandOfTheDreams: (1 >> (setP ^ 11)) + (1 >> (setL ^ 11)),
//   }
//   const sets = c.sets
//
//   /*
//    * ************************************************************
//    * Old elemental dmg logic
//    * ************************************************************
//    */
//
//   // NOTE: c.ELEMENTAL_DMG represents the character's type, while x.ELEMENTAL_DMG represents ALL types.
//   // This is mostly because there isnt a need to split out damage types while we're calculating display stats.
//   c.ELEMENTAL_DMG = 0
//   switch (params.element) {
//     case Stats.Physical_DMG:
//       c.ELEMENTAL_DMG = calculatePercentStat(Stats.Physical_DMG, base, lc, trace, c, 0.10 * p2(sets.ChampionOfStreetwiseBoxing))
//       break
//     case Stats.Fire_DMG:
//       c.ELEMENTAL_DMG = calculatePercentStat(Stats.Fire_DMG, base, lc, trace, c, 0.10 * p2(sets.FiresmithOfLavaForging) + 0.10 * enabledFiresmithOfLavaForging * p4(sets.FiresmithOfLavaForging))
//       break
//     case Stats.Ice_DMG:
//       c.ELEMENTAL_DMG = calculatePercentStat(Stats.Ice_DMG, base, lc, trace, c, 0.10 * p2(sets.HunterOfGlacialForest))
//       break
//     case Stats.Lightning_DMG:
//       c.ELEMENTAL_DMG = calculatePercentStat(Stats.Lightning_DMG, base, lc, trace, c, 0.10 * p2(sets.BandOfSizzlingThunder))
//       break
//     case Stats.Wind_DMG:
//       c.ELEMENTAL_DMG = calculatePercentStat(Stats.Wind_DMG, base, lc, trace, c, 0.10 * p2(sets.EagleOfTwilightLine))
//       break
//     case Stats.Quantum_DMG:
//       c.ELEMENTAL_DMG = calculatePercentStat(Stats.Quantum_DMG, base, lc, trace, c, 0.10 * p2(sets.GeniusOfBrilliantStars))
//       break
//     case Stats.Imaginary_DMG:
//       c.ELEMENTAL_DMG = calculatePercentStat(Stats.Imaginary_DMG, base, lc, trace, c, 0.10 * p2(sets.WastelanderOfBanditryDesert))
//       break
//   }
//   //
//   // const crSum = c[Stats.CR]
//   // const cdSum = c[Stats.CD]
//   //
//   // /*
//   //  * ************************************************************
//   //  * Calculate base stats
//   //  * ************************************************************
//   //  */
//   //
//   // /*
//   //  * ************************************************************
//   //  * Calculate display stats with unconditional sets
//   //  * ************************************************************
//   //  */
//   //
//   // c[Stats.SPD] = calculateFlatStat(Stats.SPD, Stats.SPD_P, baseSpd, lc, trace, c,
//   //   0.06 * p2(sets.MessengerTraversingHackerspace)
//   //   + 0.06 * p4(sets.MusketeerOfWildWheat))
//   //
//   // // SPD is the most common filter, use it to exit early
//   // if (baseDisplay && !topRow && (c[Stats.SPD] < request.minSpd || c[Stats.SPD] > request.maxSpd)) {
//   //   continue
//   // }
//   //
//   // c[Stats.HP] = calculateFlatStat(Stats.HP, Stats.HP_P, baseHp, lc, trace, c,
//   //   0.12 * p2(sets.FleetOfTheAgeless)
//   //   + 0.12 * p2(sets.LongevousDisciple))
//   //
//   // c[Stats.ATK] = calculateFlatStat(Stats.ATK, Stats.ATK_P, baseAtk, lc, trace, c,
//   //   0.12 * p2(sets.SpaceSealingStation)
//   //   + 0.12 * p2(sets.FirmamentFrontlineGlamoth)
//   //   + 0.12 * p2(sets.MusketeerOfWildWheat)
//   //   + 0.12 * p2(sets.PrisonerInDeepConfinement))
//   //
//   // c[Stats.DEF] = calculateFlatStat(Stats.DEF, Stats.DEF_P, baseDef, lc, trace, c,
//   //   0.15 * p2(sets.BelobogOfTheArchitects)
//   //   + 0.15 * p2(sets.KnightOfPurityPalace))
//   //
//   // c[Stats.CR] = calculatePercentStat(Stats.CR, base, lc, trace, c,
//   //   0.08 * p2(sets.InertSalsotto)
//   //   + 0.08 * p2(sets.RutilantArena))
//   //
//   // c[Stats.CD] = calculatePercentStat(Stats.CD, base, lc, trace, c,
//   //   0.16 * p2(sets.CelestialDifferentiator))
//   //
//   // c[Stats.EHR] = calculatePercentStat(Stats.EHR, base, lc, trace, c,
//   //   0.10 * p2(sets.PanCosmicCommercialEnterprise))
//   //
//   // c[Stats.RES] = calculatePercentStat(Stats.RES, base, lc, trace, c,
//   //   0.10 * p2(sets.BrokenKeel))
//   //
//   // c[Stats.BE] = calculatePercentStat(Stats.BE, base, lc, trace, c,
//   //   0.16 * p2(sets.TaliaKingdomOfBanditry)
//   //   + 0.16 * p2(sets.ThiefOfShootingMeteor)
//   //   + 0.16 * p4(sets.ThiefOfShootingMeteor)
//   //   + 0.16 * p2(sets.WatchmakerMasterOfDreamMachinations))
//   //
//   // c[Stats.ERR] = calculatePercentStat(Stats.ERR, base, lc, trace, c,
//   //   0.05 * p2(sets.SprightlyVonwacq)
//   //   + 0.05 * p2(sets.PenaconyLandOfTheDreams))
//   //
//   // c[Stats.OHB] = calculatePercentStat(Stats.OHB, base, lc, trace, c,
//   //   0.10 * p2(sets.PasserbyOfWanderingCloud))
//   //
//   // // Exit early on base display filters failing unless its a topRow search
//   // if (baseDisplay && !topRow) {
//   //   const fail
//   //     = c[Stats.HP] < request.minHp || c[Stats.HP] > request.maxHp
//   //     || c[Stats.ATK] < request.minAtk || c[Stats.ATK] > request.maxAtk
//   //     || c[Stats.DEF] < request.minDef || c[Stats.DEF] > request.maxDef
//   //     || c[Stats.CR] < request.minCr || c[Stats.CR] > request.maxCr
//   //     || c[Stats.CD] < request.minCd || c[Stats.CD] > request.maxCd
//   //     || c[Stats.EHR] < request.minEhr || c[Stats.EHR] > request.maxEhr
//   //     || c[Stats.RES] < request.minRes || c[Stats.RES] > request.maxRes
//   //     || c[Stats.BE] < request.minBe || c[Stats.BE] > request.maxBe
//   //     || c[Stats.ERR] < request.minErr || c[Stats.ERR] > request.maxErr
//   //     || c.WEIGHT < request.minWeight || c.WEIGHT > request.maxWeight
//   //   if (fail) {
//   //     continue
//   //   }
//   // }
//   //
//   // c.id = index
//   //
//   // /*
//   //  * ************************************************************
//   //  * Set up combat stats storage x
//   //  * ************************************************************
//   //  */
//   //
//   // const x = Object.assign({}, precomputedX)
//   // c.x = x
//   //
//   // x[Stats.ATK] += c[Stats.ATK]
//   // x[Stats.DEF] += c[Stats.DEF]
//   // x[Stats.HP] += c[Stats.HP]
//   // x[Stats.SPD] += c[Stats.SPD]
//   // x[Stats.CD] += c[Stats.CD]
//   // x[Stats.CR] += c[Stats.CR]
//   // x[Stats.EHR] += c[Stats.EHR]
//   // x[Stats.RES] += c[Stats.RES]
//   // x[Stats.BE] += c[Stats.BE]
//   // x[Stats.ERR] += c[Stats.ERR]
//   // x[Stats.OHB] += c[Stats.OHB]
//   // x[ELEMENTAL_DMG_TYPE] += c.ELEMENTAL_DMG
//   //
//   // x[Stats.ATK] += request.buffAtk
//   // x[Stats.ATK] += request.buffAtkP * baseAtk
//   // x[Stats.CD] += request.buffCd
//   // x[Stats.CR] += request.buffCr
//   // x[Stats.SPD] += request.buffSpdP * baseSpd + request.buffSpd
//   // x[Stats.BE] += request.buffBe
//   // x.ELEMENTAL_DMG += request.buffDmgBoost
//   //
//   // /*
//   //  * ************************************************************
//   //  * Calculate passive effects & buffs. x stores the internally calculated character stats (Combat stats)
//   //  * ************************************************************
//   //  */
//   //
//   // /*
//   //  * No longer needed
//   //  * characterConditionals.calculatePassives(c, request)
//   //  * lightConeConditionals.calculatePassives(c, request)
//   //  */
//   //
//   // /*
//   //  * ************************************************************
//   //  * Calculate conditional set effects
//   //  * ************************************************************
//   //  */
//   //
//   // x[Stats.SPD_P]
//   //   += 0.12 * enabledMessengerTraversingHackerspace * p4(sets.MessengerTraversingHackerspace)
//   // x[Stats.SPD] += x[Stats.SPD_P] * baseSpd
//   //
//   // x[Stats.ATK_P]
//   //   += 0.05 * valueChampionOfStreetwiseBoxing * p4(sets.ChampionOfStreetwiseBoxing)
//   //   + 0.20 * enabledBandOfSizzlingThunder * p4(sets.BandOfSizzlingThunder)
//   //   + 0.06 * valueTheAshblazingGrandDuke * p4(sets.TheAshblazingGrandDuke)
//   //   + 0.12 * (x[Stats.SPD] >= 120 ? 1 : 0) * p2(sets.SpaceSealingStation)
//   //   + 0.08 * (x[Stats.SPD] >= 120 ? 1 : 0) * p2(sets.FleetOfTheAgeless)
//   //   + Math.min(0.25, 0.25 * c[Stats.EHR]) * p2(sets.PanCosmicCommercialEnterprise)
//   // x[Stats.ATK] += x[Stats.ATK_P] * baseAtk
//   //
//   // x[Stats.DEF_P]
//   //   += 0.15 * (c[Stats.EHR] >= 0.50 ? 1 : 0) * p2(sets.BelobogOfTheArchitects)
//   // x[Stats.DEF] += x[Stats.DEF_P] * baseDef
//   //
//   // x[Stats.HP] += x[Stats.HP_P] * baseHp
//   //
//   // x[Stats.CR]
//   //   += 0.10 * (valueWastelanderOfBanditryDesert > 0 ? 1 : 0) * p4(sets.WastelanderOfBanditryDesert)
//   //   + 0.08 * valueLongevousDisciple * p4(sets.LongevousDisciple)
//   //   + 0.60 * enabledCelestialDifferentiator * (c[Stats.CD] >= 1.20 ? 1 : 0) * p2(sets.CelestialDifferentiator)
//   //   + 0.04 * (valuePioneerDiverOfDeadWaters > 2 ? 1 : 0) * p4(sets.PioneerDiverOfDeadWaters)
//   //
//   // x[Stats.CD]
//   //   += 0.25 * enabledHunterOfGlacialForest * p4(sets.HunterOfGlacialForest)
//   //   + 0.10 * (valueWastelanderOfBanditryDesert == 2 ? 1 : 0) * p4(sets.WastelanderOfBanditryDesert)
//   //   + 0.10 * (c[Stats.RES] >= 0.30 ? 1 : 0) * p2(sets.BrokenKeel)
//   //   + pioneerSetIndexToCd[valuePioneerDiverOfDeadWaters] * p4(sets.PioneerDiverOfDeadWaters)
//   //
//   // x[Stats.BE]
//   //   += 0.20 * (c[Stats.SPD] >= 145 ? 1 : 0) * p2(sets.TaliaKingdomOfBanditry)
//   //   + 0.30 * enabledWatchmakerMasterOfDreamMachinations * p4(sets.WatchmakerMasterOfDreamMachinations)
//   //
//   // x.BASIC_BOOST
//   //   += 0.10 * p4(sets.MusketeerOfWildWheat)
//   //   + 0.20 * (x[Stats.CR] >= 0.70 ? 1 : 0) * p2(sets.RutilantArena)
//   //
//   // x.SKILL_BOOST
//   //   += 0.12 * p4(sets.FiresmithOfLavaForging)
//   //   + 0.20 * (x[Stats.CR] >= 0.70 ? 1 : 0) * p2(sets.RutilantArena)
//   //
//   // x.ULT_BOOST
//   //   += 0.15 * (x[Stats.CR] >= 0.50 ? 1 : 0) * p2(c.sets.InertSalsotto)
//   //
//   // x.FUA_BOOST
//   //   += 0.15 * (x[Stats.CR] >= 0.50 ? 1 : 0) * p2(c.sets.InertSalsotto)
//   //
//   // x.FUA_BOOST
//   //   += 0.20 * p2(c.sets.TheAshblazingGrandDuke)
//   //
//   // x.DEF_SHRED
//   //   += p4(c.sets.GeniusOfBrilliantStars) ? (enabledGeniusOfBrilliantStars ? 0.20 : 0.10) : 0
//   //
//   // x.DEF_SHRED
//   //   += 0.06 * valuePrisonerInDeepConfinement * p4(c.sets.PrisonerInDeepConfinement)
//   //
//   // x.ELEMENTAL_DMG
//   //   += 0.12 * (x[Stats.SPD] >= 135 ? 1 : 0) * p2(sets.FirmamentFrontlineGlamoth)
//   //   + 0.06 * (x[Stats.SPD] >= 160 ? 1 : 0) * p2(sets.FirmamentFrontlineGlamoth)
//   //   + 0.12 * p2(sets.PioneerDiverOfDeadWaters)
//   //
//   // /*
//   //  * ************************************************************
//   //  * Calculate skill base damage
//   //  * ************************************************************
//   //  */
//   //
//   // lightConeConditionals.calculateBaseMultis(c, request)
//   // characterConditionals.calculateBaseMultis(c, request)
//   //
//   // /*
//   //  * ************************************************************
//   //  * Calculate overall multipliers
//   //  * ************************************************************
//   //  */
//   //
//   // // After calculations are done, merge the character type's damage back into X for display
//   // x.ELEMENTAL_DMG += x[ELEMENTAL_DMG_TYPE]
//   //
//   // const cLevel = request.characterLevel
//   // const eLevel = request.enemyLevel
//   // const defReduction = x.DEF_SHRED + request.buffDefShred
//   // const defIgnore = 0
//   //
//   // const dmgBoostMultiplier = 1 + x.ELEMENTAL_DMG
//   // const dmgReductionMultiplier = 1
//   // const originalDmgMultiplier = 1 + x.ORIGINAL_DMG_BOOST
//   //
//   // let ehp = x[Stats.HP] / (1 - x[Stats.DEF] / (x[Stats.DEF] + 200 + 10 * request.enemyLevel))
//   // ehp *= 1 / ((1 - 0.08 * p2(sets.GuardOfWutheringSnow)) * x.DMG_RED_MULTI)
//   // c.EHP = ehp
//   // const cv = 100 * (crSum * 2 + cdSum)
//   // c.CV = cv
//   //
//   // const universalMulti = dmgReductionMultiplier * brokenMultiplier * originalDmgMultiplier
//   // const baseResistance = resistance - x.RES_PEN - x[RES_PEN_TYPE]
//   //
//   // calculateDamage(
//   //   x,
//   //   universalMulti,
//   //   dmgBoostMultiplier,
//   //   cLevel,
//   //   eLevel,
//   //   defReduction,
//   //   defIgnore,
//   //   baseResistance,
//   // )
//   //
//   // /*
//   //  * ************************************************************
//   //  * Filter results
//   //  * ************************************************************
//   //  */
//   //
//   // // Since we exited early on the c comparisons, we only need to check against x stats here. Ignore if top row search
//   // if (combatDisplay && !topRow) {
//   //   const fail
//   //     = x[Stats.HP] < request.minHp || x[Stats.HP] > request.maxHp
//   //     || x[Stats.ATK] < request.minAtk || x[Stats.ATK] > request.maxAtk
//   //     || x[Stats.DEF] < request.minDef || x[Stats.DEF] > request.maxDef
//   //     || x[Stats.SPD] < request.minSpd || x[Stats.SPD] > request.maxSpd
//   //     || x[Stats.CR] < request.minCr || x[Stats.CR] > request.maxCr
//   //     || x[Stats.CD] < request.minCd || x[Stats.CD] > request.maxCd
//   //     || x[Stats.EHR] < request.minEhr || x[Stats.EHR] > request.maxEhr
//   //     || x[Stats.RES] < request.minRes || x[Stats.RES] > request.maxRes
//   //     || x[Stats.BE] < request.minBe || x[Stats.BE] > request.maxBe
//   //     || x[Stats.ERR] < request.minErr || x[Stats.ERR] > request.maxErr
//   //   if (fail) {
//   //     continue
//   //   }
//   // }
//   //
//   // const fail = (
//   //   cv < request.minCv || cv > request.maxCv
//   //   || ehp < request.minEhp || ehp > request.maxEhp
//   //   || x.BASIC_DMG < request.minBasic || x.BASIC_DMG > request.maxBasic
//   //   || x.SKILL_DMG < request.minSkill || x.SKILL_DMG > request.maxSkill
//   //   || x.ULT_DMG < request.minUlt || x.ULT_DMG > request.maxUlt
//   //   || x.FUA_DMG < request.minFua || x.FUA_DMG > request.maxFua
//   //   || x.DOT_DMG < request.minDot || x.DOT_DMG > request.maxDot
//   // )
// }
