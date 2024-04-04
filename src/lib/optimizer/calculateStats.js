import { Stats } from 'lib/constants.ts'
import { p2, p4 } from 'lib/optimizer/optimizerUtils'

const statValues = Object.values(Stats)

export function calculateSetCounts(c, setH, setG, setB, setF, setP, setL) {
  c.sets = {
    PasserbyOfWanderingCloud: (1 >> (setH ^ 0)) + (1 >> (setG ^ 0)) + (1 >> (setB ^ 0)) + (1 >> (setF ^ 0)),
    MusketeerOfWildWheat: (1 >> (setH ^ 1)) + (1 >> (setG ^ 1)) + (1 >> (setB ^ 1)) + (1 >> (setF ^ 1)),
    KnightOfPurityPalace: (1 >> (setH ^ 2)) + (1 >> (setG ^ 2)) + (1 >> (setB ^ 2)) + (1 >> (setF ^ 2)),
    HunterOfGlacialForest: (1 >> (setH ^ 3)) + (1 >> (setG ^ 3)) + (1 >> (setB ^ 3)) + (1 >> (setF ^ 3)),
    ChampionOfStreetwiseBoxing: (1 >> (setH ^ 4)) + (1 >> (setG ^ 4)) + (1 >> (setB ^ 4)) + (1 >> (setF ^ 4)),
    GuardOfWutheringSnow: (1 >> (setH ^ 5)) + (1 >> (setG ^ 5)) + (1 >> (setB ^ 5)) + (1 >> (setF ^ 5)),
    FiresmithOfLavaForging: (1 >> (setH ^ 6)) + (1 >> (setG ^ 6)) + (1 >> (setB ^ 6)) + (1 >> (setF ^ 6)),
    GeniusOfBrilliantStars: (1 >> (setH ^ 7)) + (1 >> (setG ^ 7)) + (1 >> (setB ^ 7)) + (1 >> (setF ^ 7)),
    BandOfSizzlingThunder: (1 >> (setH ^ 8)) + (1 >> (setG ^ 8)) + (1 >> (setB ^ 8)) + (1 >> (setF ^ 8)),
    EagleOfTwilightLine: (1 >> (setH ^ 9)) + (1 >> (setG ^ 9)) + (1 >> (setB ^ 9)) + (1 >> (setF ^ 9)),
    ThiefOfShootingMeteor: (1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10)),
    WastelanderOfBanditryDesert: (1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11)),
    LongevousDisciple: (1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12)),
    MessengerTraversingHackerspace: (1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13)),
    TheAshblazingGrandDuke: (1 >> (setH ^ 14)) + (1 >> (setG ^ 14)) + (1 >> (setB ^ 14)) + (1 >> (setF ^ 14)),
    PrisonerInDeepConfinement: (1 >> (setH ^ 15)) + (1 >> (setG ^ 15)) + (1 >> (setB ^ 15)) + (1 >> (setF ^ 15)),
    PioneerDiverOfDeadWaters: (1 >> (setH ^ 16)) + (1 >> (setG ^ 16)) + (1 >> (setB ^ 16)) + (1 >> (setF ^ 16)),
    WatchmakerMasterOfDreamMachinations: (1 >> (setH ^ 17)) + (1 >> (setG ^ 17)) + (1 >> (setB ^ 17)) + (1 >> (setF ^ 17)),

    SpaceSealingStation: (1 >> (setP ^ 0)) + (1 >> (setL ^ 0)),
    FleetOfTheAgeless: (1 >> (setP ^ 1)) + (1 >> (setL ^ 1)),
    PanCosmicCommercialEnterprise: (1 >> (setP ^ 2)) + (1 >> (setL ^ 2)),
    BelobogOfTheArchitects: (1 >> (setP ^ 3)) + (1 >> (setL ^ 3)),
    CelestialDifferentiator: (1 >> (setP ^ 4)) + (1 >> (setL ^ 4)),
    InertSalsotto: (1 >> (setP ^ 5)) + (1 >> (setL ^ 5)),
    TaliaKingdomOfBanditry: (1 >> (setP ^ 6)) + (1 >> (setL ^ 6)),
    SprightlyVonwacq: (1 >> (setP ^ 7)) + (1 >> (setL ^ 7)),
    RutilantArena: (1 >> (setP ^ 8)) + (1 >> (setL ^ 8)),
    BrokenKeel: (1 >> (setP ^ 9)) + (1 >> (setL ^ 9)),
    FirmamentFrontlineGlamoth: (1 >> (setP ^ 10)) + (1 >> (setL ^ 10)),
    PenaconyLandOfTheDreams: (1 >> (setP ^ 11)) + (1 >> (setL ^ 11)),
    SigoniaTheUnclaimedDesolation: (1 >> (setP ^ 12)) + (1 >> (setL ^ 12)),
    IzumoGenseiAndTakamaDivineRealm: (1 >> (setP ^ 13)) + (1 >> (setL ^ 13)),
  }
  return c.sets
}

export function calculateElementalStats(c, request, params) {
  const base = params.character.base
  const trace = params.character.traces
  const lc = params.character.lightCone
  const sets = c.sets

  // NOTE: c.ELEMENTAL_DMG represents the character's type, while x.ELEMENTAL_DMG represents ALL types.
  // This is mostly because there isnt a need to split out damage types while we're calculating display stats.
  c.ELEMENTAL_DMG = 0
  switch (params.ELEMENTAL_DMG_TYPE) {
    case Stats.Physical_DMG:
      c.ELEMENTAL_DMG = sumPercentStat(Stats.Physical_DMG, base, lc, trace, c, 0.10 * p2(sets.ChampionOfStreetwiseBoxing))
      break
    case Stats.Fire_DMG:
      c.ELEMENTAL_DMG = sumPercentStat(Stats.Fire_DMG, base, lc, trace, c, 0.10 * p2(sets.FiresmithOfLavaForging) + 0.10 * params.enabledFiresmithOfLavaForging * p4(sets.FiresmithOfLavaForging))
      break
    case Stats.Ice_DMG:
      c.ELEMENTAL_DMG = sumPercentStat(Stats.Ice_DMG, base, lc, trace, c, 0.10 * p2(sets.HunterOfGlacialForest))
      break
    case Stats.Lightning_DMG:
      c.ELEMENTAL_DMG = sumPercentStat(Stats.Lightning_DMG, base, lc, trace, c, 0.10 * p2(sets.BandOfSizzlingThunder))
      break
    case Stats.Wind_DMG:
      c.ELEMENTAL_DMG = sumPercentStat(Stats.Wind_DMG, base, lc, trace, c, 0.10 * p2(sets.EagleOfTwilightLine))
      break
    case Stats.Quantum_DMG:
      c.ELEMENTAL_DMG = sumPercentStat(Stats.Quantum_DMG, base, lc, trace, c, 0.10 * p2(sets.GeniusOfBrilliantStars))
      break
    case Stats.Imaginary_DMG:
      c.ELEMENTAL_DMG = sumPercentStat(Stats.Imaginary_DMG, base, lc, trace, c, 0.10 * p2(sets.WastelanderOfBanditryDesert))
      break
  }
}

export function calculateBaseStats(c, request, params) {
  const base = params.character.base
  const lc = params.character.lightCone
  const trace = params.character.traces

  const sets = c.sets
  c[Stats.SPD] = sumFlatStat(Stats.SPD, Stats.SPD_P, request.baseSpd, lc, trace, c,
    0.06 * p2(sets.MessengerTraversingHackerspace)
    + 0.06 * p4(sets.MusketeerOfWildWheat))

  c[Stats.HP] = sumFlatStat(Stats.HP, Stats.HP_P, request.baseHp, lc, trace, c,
    0.12 * p2(sets.FleetOfTheAgeless)
    + 0.12 * p2(sets.LongevousDisciple))

  c[Stats.ATK] = sumFlatStat(Stats.ATK, Stats.ATK_P, request.baseAtk, lc, trace, c,
    0.12 * p2(sets.SpaceSealingStation)
    + 0.12 * p2(sets.FirmamentFrontlineGlamoth)
    + 0.12 * p2(sets.MusketeerOfWildWheat)
    + 0.12 * p2(sets.PrisonerInDeepConfinement)
    + 0.12 * p2(sets.IzumoGenseiAndTakamaDivineRealm))

  c[Stats.DEF] = sumFlatStat(Stats.DEF, Stats.DEF_P, request.baseDef, lc, trace, c,
    0.15 * p2(sets.BelobogOfTheArchitects)
    + 0.15 * p2(sets.KnightOfPurityPalace))

  c[Stats.CR] = sumPercentStat(Stats.CR, base, lc, trace, c,
    0.08 * p2(sets.InertSalsotto)
    + 0.08 * p2(sets.RutilantArena)
    + 0.04 * p4(sets.PioneerDiverOfDeadWaters)
    + 0.04 * p2(sets.SigoniaTheUnclaimedDesolation))

  c[Stats.CD] = sumPercentStat(Stats.CD, base, lc, trace, c,
    0.16 * p2(sets.CelestialDifferentiator))

  c[Stats.EHR] = sumPercentStat(Stats.EHR, base, lc, trace, c,
    0.10 * p2(sets.PanCosmicCommercialEnterprise))

  c[Stats.RES] = sumPercentStat(Stats.RES, base, lc, trace, c,
    0.10 * p2(sets.BrokenKeel))

  c[Stats.BE] = sumPercentStat(Stats.BE, base, lc, trace, c,
    0.16 * p2(sets.TaliaKingdomOfBanditry)
    + 0.16 * p2(sets.ThiefOfShootingMeteor)
    + 0.16 * p4(sets.ThiefOfShootingMeteor)
    + 0.16 * p2(sets.WatchmakerMasterOfDreamMachinations))

  c[Stats.ERR] = sumPercentStat(Stats.ERR, base, lc, trace, c,
    0.05 * p2(sets.SprightlyVonwacq)
    + 0.05 * p2(sets.PenaconyLandOfTheDreams))

  c[Stats.OHB] = sumPercentStat(Stats.OHB, base, lc, trace, c,
    0.10 * p2(sets.PasserbyOfWanderingCloud))
}

export function calculateComputedStats(c, request, params) {
  const sets = c.sets
  const x = c.x

  // Add base to computed
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

  // Combat buffs
  x[Stats.ATK] += request.buffAtk
  x[Stats.ATK] += request.buffAtkP * request.baseAtk
  x[Stats.CD] += request.buffCd
  x[Stats.CR] += request.buffCr
  x[Stats.SPD] += request.buffSpdP * request.baseSpd + request.buffSpd
  x[Stats.BE] += request.buffBe
  x.ELEMENTAL_DMG += request.buffDmgBoost

  // Set effects
  x[Stats.SPD_P]
    += 0.12 * params.enabledMessengerTraversingHackerspace * p4(sets.MessengerTraversingHackerspace)
  x[Stats.SPD] += x[Stats.SPD_P] * request.baseSpd

  x[Stats.ATK_P]
    += 0.05 * params.valueChampionOfStreetwiseBoxing * p4(sets.ChampionOfStreetwiseBoxing)
    + 0.20 * params.enabledBandOfSizzlingThunder * p4(sets.BandOfSizzlingThunder)
    + 0.06 * params.valueTheAshblazingGrandDuke * p4(sets.TheAshblazingGrandDuke)
    + 0.12 * (x[Stats.SPD] >= 120 ? 1 : 0) * p2(sets.SpaceSealingStation)
    + 0.08 * (x[Stats.SPD] >= 120 ? 1 : 0) * p2(sets.FleetOfTheAgeless)
    + Math.min(0.25, 0.25 * x[Stats.EHR]) * p2(sets.PanCosmicCommercialEnterprise)
  x[Stats.ATK] += x[Stats.ATK_P] * request.baseAtk

  x[Stats.DEF_P]
    += 0.15 * (x[Stats.EHR] >= 0.50 ? 1 : 0) * p2(sets.BelobogOfTheArchitects)
  x[Stats.DEF] += x[Stats.DEF_P] * request.baseDef

  x[Stats.HP] += x[Stats.HP_P] * request.baseHp

  x[Stats.CD]
    += 0.25 * params.enabledHunterOfGlacialForest * p4(sets.HunterOfGlacialForest)
    + 0.10 * (params.valueWastelanderOfBanditryDesert == 2 ? 1 : 0) * p4(sets.WastelanderOfBanditryDesert)
    + 0.10 * (x[Stats.RES] >= 0.30 ? 1 : 0) * p2(sets.BrokenKeel)
    + pioneerSetIndexToCd[params.valuePioneerDiverOfDeadWaters] * p4(sets.PioneerDiverOfDeadWaters)
    + 0.04 * (params.valueSigoniaTheUnclaimedDesolation) * p2(sets.SigoniaTheUnclaimedDesolation)

  x[Stats.CR]
    += 0.10 * (params.valueWastelanderOfBanditryDesert > 0 ? 1 : 0) * p4(sets.WastelanderOfBanditryDesert)
    + 0.08 * params.valueLongevousDisciple * p4(sets.LongevousDisciple)
    + 0.60 * params.enabledCelestialDifferentiator * (x[Stats.CD] >= 1.20 ? 1 : 0) * p2(sets.CelestialDifferentiator)
    + 0.04 * (params.valuePioneerDiverOfDeadWaters > 2 ? 1 : 0) * p4(sets.PioneerDiverOfDeadWaters)
    + 0.12 * (params.enabledIzumoGenseiAndTakamaDivineRealm) * p2(sets.IzumoGenseiAndTakamaDivineRealm)

  x[Stats.BE]
    += 0.20 * (x[Stats.SPD] >= 145 ? 1 : 0) * p2(sets.TaliaKingdomOfBanditry)
    + 0.30 * params.enabledWatchmakerMasterOfDreamMachinations * p4(sets.WatchmakerMasterOfDreamMachinations)

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
    += p4(c.sets.GeniusOfBrilliantStars) ? (params.enabledGeniusOfBrilliantStars ? 0.20 : 0.10) : 0

  x.DEF_SHRED
    += 0.06 * params.valuePrisonerInDeepConfinement * p4(c.sets.PrisonerInDeepConfinement)

  x.ELEMENTAL_DMG
    += 0.12 * (x[Stats.SPD] >= 135 ? 1 : 0) * p2(sets.FirmamentFrontlineGlamoth)
    + 0.06 * (x[Stats.SPD] >= 160 ? 1 : 0) * p2(sets.FirmamentFrontlineGlamoth)
    + 0.12 * p2(sets.PioneerDiverOfDeadWaters) * (params.valuePioneerDiverOfDeadWaters > -1 ? 1 : 0)

  return x
}

export function calculateRelicStats(c, head, hands, body, feet, planarSphere, linkRope) {
  for (const relic of [head, hands, body, feet, planarSphere, linkRope]) {
    if (!relic.part) continue

    for (const condensedStat of relic.condensedStats) {
      c[condensedStat[0]] += condensedStat[1]
    }
  }

  c.x.WEIGHT
    = head.weightScore
    + hands.weightScore
    + body.weightScore
    + feet.weightScore
    + planarSphere.weightScore
    + linkRope.weightScore
}

function sumPercentStat(stat, base, lc, trace, relicSum, setEffects) {
  return base[stat] + lc[stat] + relicSum[stat] + trace[stat] + setEffects
}

function sumFlatStat(stat, statP, baseValue, lc, trace, relicSum, setEffects) {
  return (baseValue) * (1 + setEffects + relicSum[statP] + trace[statP] + lc[statP]) + relicSum[stat] + trace[stat]
}

const pioneerSetIndexToCd = {
  [-1]: 0,
  0: 0,
  1: 0.08,
  2: 0.12,
  3: 0.16,
  4: 0.24,
}

export const baseCharacterStats = {
  [Stats.HP_P]: 0,
  [Stats.ATK_P]: 0,
  [Stats.DEF_P]: 0,
  [Stats.HP]: 0.000001,
  [Stats.ATK]: 0.000001,
  [Stats.DEF]: 0.000001,
  [Stats.SPD]: 0.000001,
  [Stats.SPD_P]: 0,
  [Stats.CR]: 0.000001,
  [Stats.CD]: 0.000001,
  [Stats.EHR]: 0.000001,
  [Stats.RES]: 0.000001,
  [Stats.BE]: 0.000001,
  [Stats.ERR]: 0.000001,
  [Stats.OHB]: 0.000001,
  [Stats.Physical_DMG]: 0.000001,
  [Stats.Fire_DMG]: 0.000001,
  [Stats.Ice_DMG]: 0.000001,
  [Stats.Lightning_DMG]: 0.000001,
  [Stats.Wind_DMG]: 0.000001,
  [Stats.Quantum_DMG]: 0.000001,
  [Stats.Imaginary_DMG]: 0.000001,
}
