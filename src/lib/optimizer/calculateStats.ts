import { Stats } from 'lib/constants'
import { p2, p4 } from 'lib/optimizer/optimizerUtils'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { BASIC_TYPE, BasicStatsObject, ComputedStatsObject, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { BelobogOfTheArchitectsConditional, BrokenKeelConditional, CelestialDifferentiatorConditional, FirmamentFrontlineGlamoth135Conditional, FirmamentFrontlineGlamoth160Conditional, FleetOfTheAgelessConditional, InertSalsottoConditional, IronCavalryAgainstTheScourge150Conditional, IronCavalryAgainstTheScourge250Conditional, PanCosmicCommercialEnterpriseConditional, RutilantArenaConditional, SpaceSealingStationConditional, TaliaKingdomOfBanditryConditional } from 'lib/gpu/conditionals/setConditionals'
import { evaluateConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export function calculateSetCounts(c: BasicStatsObject, setH: number, setG: number, setB: number, setF: number, setP: number, setL: number) {
  c.x.sets = {
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
    IronCavalryAgainstTheScourge: (1 >> (setH ^ 18)) + (1 >> (setG ^ 18)) + (1 >> (setB ^ 18)) + (1 >> (setF ^ 18)),
    TheWindSoaringValorous: (1 >> (setH ^ 19)) + (1 >> (setG ^ 19)) + (1 >> (setB ^ 19)) + (1 >> (setF ^ 19)),
    SacerdosRelivedOrdeal: (1 >> (setH ^ 20)) + (1 >> (setG ^ 20)) + (1 >> (setB ^ 20)) + (1 >> (setF ^ 20)),
    ScholarLostInErudition: (1 >> (setH ^ 21)) + (1 >> (setG ^ 21)) + (1 >> (setB ^ 21)) + (1 >> (setF ^ 21)),

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
    DuranDynastyOfRunningWolves: (1 >> (setP ^ 14)) + (1 >> (setL ^ 14)),
    ForgeOfTheKalpagniLantern: (1 >> (setP ^ 15)) + (1 >> (setL ^ 15)),
    LushakaTheSunkenSeas: (1 >> (setP ^ 16)) + (1 >> (setL ^ 16)),
    TheWondrousBananAmusementPark: (1 >> (setP ^ 17)) + (1 >> (setL ^ 17)),
  }
  return c.x.sets
}

export function calculateElementalStats(c: BasicStatsObject, context: OptimizerContext) {
  const base = context.characterStatsBreakdown.base
  const lc = context.characterStatsBreakdown.lightCone
  const trace = context.characterStatsBreakdown.traces
  const sets = c.x.sets

  // NOTE: c.ELEMENTAL_DMG represents the character's type, while x.ELEMENTAL_DMG represents ALL types.
  // This is mostly because there isnt a need to split out damage types while we're calculating display stats.
  c.ELEMENTAL_DMG = 0
  switch (context.elementalDamageType) {
    case Stats.Physical_DMG:
      c.ELEMENTAL_DMG = sumPercentStat(Stats.Physical_DMG, base, lc, trace, c, 0.10 * p2(sets.ChampionOfStreetwiseBoxing))
      break
    case Stats.Fire_DMG:
      c.ELEMENTAL_DMG = sumPercentStat(Stats.Fire_DMG, base, lc, trace, c, 0.10 * p2(sets.FiresmithOfLavaForging))
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

export function calculateBaseStats(c: BasicStatsObject, context: OptimizerContext) {
  const base = context.characterStatsBreakdown.base
  const lc = context.characterStatsBreakdown.lightCone
  const trace = context.characterStatsBreakdown.traces

  const sets = c.x.sets
  c[Stats.SPD] = sumFlatStat(Stats.SPD, Stats.SPD_P, context.baseSPD, lc, trace, c,
    0.06 * p2(sets.MessengerTraversingHackerspace)
    + 0.06 * p2(sets.ForgeOfTheKalpagniLantern)
    + 0.06 * p4(sets.MusketeerOfWildWheat)
    + 0.06 * p2(sets.SacerdosRelivedOrdeal),
  )

  c[Stats.HP] = sumFlatStat(Stats.HP, Stats.HP_P, context.baseHP, lc, trace, c,
    0.12 * p2(sets.FleetOfTheAgeless)
    + 0.12 * p2(sets.LongevousDisciple),
  )

  c[Stats.ATK] = sumFlatStat(Stats.ATK, Stats.ATK_P, context.baseATK, lc, trace, c,
    0.12 * p2(sets.SpaceSealingStation)
    + 0.12 * p2(sets.FirmamentFrontlineGlamoth)
    + 0.12 * p2(sets.MusketeerOfWildWheat)
    + 0.12 * p2(sets.PrisonerInDeepConfinement)
    + 0.12 * p2(sets.IzumoGenseiAndTakamaDivineRealm)
    + 0.12 * p2(sets.TheWindSoaringValorous),
  )

  c[Stats.DEF] = sumFlatStat(Stats.DEF, Stats.DEF_P, context.baseDEF, lc, trace, c,
    0.15 * p2(sets.BelobogOfTheArchitects)
    + 0.15 * p2(sets.KnightOfPurityPalace),
  )

  c[Stats.CR] = sumPercentStat(Stats.CR, base, lc, trace, c,
    0.08 * p2(sets.InertSalsotto)
    + 0.08 * p2(sets.RutilantArena)
    + 0.04 * p4(sets.PioneerDiverOfDeadWaters)
    + 0.04 * p2(sets.SigoniaTheUnclaimedDesolation)
    + 0.06 * p4(sets.TheWindSoaringValorous)
    + 0.08 * p2(sets.ScholarLostInErudition),
  )

  c[Stats.CD] = sumPercentStat(Stats.CD, base, lc, trace, c,
    0.16 * p2(sets.CelestialDifferentiator)
    + 0.16 * p2(sets.TheWondrousBananAmusementPark),
  )

  c[Stats.EHR] = sumPercentStat(Stats.EHR, base, lc, trace, c,
    0.10 * p2(sets.PanCosmicCommercialEnterprise),
  )

  c[Stats.RES] = sumPercentStat(Stats.RES, base, lc, trace, c,
    0.10 * p2(sets.BrokenKeel),
  )

  c[Stats.BE] = sumPercentStat(Stats.BE, base, lc, trace, c,
    0.16 * p2(sets.TaliaKingdomOfBanditry)
    + 0.16 * p2(sets.ThiefOfShootingMeteor)
    + 0.16 * p4(sets.ThiefOfShootingMeteor)
    + 0.16 * p2(sets.WatchmakerMasterOfDreamMachinations)
    + 0.16 * p2(sets.IronCavalryAgainstTheScourge),
  )

  c[Stats.ERR] = sumPercentStat(Stats.ERR, base, lc, trace, c,
    0.05 * p2(sets.SprightlyVonwacq)
    + 0.05 * p2(sets.PenaconyLandOfTheDreams)
    + 0.05 * p2(sets.LushakaTheSunkenSeas),
  )

  c[Stats.OHB] = sumPercentStat(Stats.OHB, base, lc, trace, c,
    0.10 * p2(sets.PasserbyOfWanderingCloud),
  )
}

export function calculateComputedStats(c: BasicStatsObject, x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
  const setConditionals = action.setConditionals
  // if (!params.characterConditionals) {
  //   params.characterConditionals = CharacterConditionals.get(context)
  // }
  // if (!params.lightConeConditionals) {
  //   params.lightConeConditionals = LightConeConditionals.get(context)
  // }

  const sets = x.sets

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
  x[context.elementalDamageType] += c.ELEMENTAL_DMG

  // Combat buffs
  x[Stats.ATK] += context.combatBuffs.ATK + context.combatBuffs.ATK_P * context.baseATK
  x[Stats.DEF] += context.combatBuffs.DEF + context.combatBuffs.DEF_P * context.baseDEF
  x[Stats.HP] += context.combatBuffs.HP + context.combatBuffs.HP_P * context.baseHP
  x[Stats.CD] += context.combatBuffs.CD
  x[Stats.CR] += context.combatBuffs.CR
  x[Stats.SPD] += context.combatBuffs.SPD_P * context.baseSPD + context.combatBuffs.SPD
  x[Stats.BE] += context.combatBuffs.BE
  x.ELEMENTAL_DMG += context.combatBuffs.DMG_BOOST
  x.EFFECT_RES_PEN += context.combatBuffs.EFFECT_RES_PEN
  x.VULNERABILITY += context.combatBuffs.VULNERABILITY
  x.BREAK_EFFICIENCY_BOOST += context.combatBuffs.BREAK_EFFICIENCY

  // SPD

  if (p4(sets.MessengerTraversingHackerspace) && setConditionals.enabledMessengerTraversingHackerspace) {
    x[Stats.SPD_P] += 0.12
  }
  x[Stats.SPD] += x[Stats.SPD_P] * context.baseSPD

  // ATK

  if (p4(sets.ChampionOfStreetwiseBoxing)) {
    x[Stats.ATK_P] += 0.05 * setConditionals.valueChampionOfStreetwiseBoxing
  }
  if (p4(sets.BandOfSizzlingThunder) && setConditionals.enabledBandOfSizzlingThunder) {
    x[Stats.ATK_P] += 0.20
  }
  if (p4(sets.TheAshblazingGrandDuke)) {
    x[Stats.ATK_P] += 0.06 * setConditionals.valueTheAshblazingGrandDuke
  }
  x[Stats.ATK] += x[Stats.ATK_P] * context.baseATK

  // DEF

  x[Stats.DEF] += x[Stats.DEF_P] * context.baseDEF

  // HP

  x[Stats.HP] += x[Stats.HP_P] * context.baseHP

  // CD

  if (p4(sets.HunterOfGlacialForest) && setConditionals.enabledHunterOfGlacialForest) {
    x[Stats.CD] += 0.25
  }
  if (p4(sets.WastelanderOfBanditryDesert)) {
    x[Stats.CD] += 0.10 * (setConditionals.valueWastelanderOfBanditryDesert == 2 ? 1 : 0)
  }
  if (p4(sets.PioneerDiverOfDeadWaters)) {
    x[Stats.CD] += pioneerSetIndexToCd[setConditionals.valuePioneerDiverOfDeadWaters]
  }
  if (p2(sets.SigoniaTheUnclaimedDesolation)) {
    x[Stats.CD] += 0.04 * (setConditionals.valueSigoniaTheUnclaimedDesolation)
  }
  if (p2(sets.DuranDynastyOfRunningWolves) && setConditionals.valueDuranDynastyOfRunningWolves >= 5) {
    x[Stats.CD] += 0.25
  }
  if (p2(sets.TheWondrousBananAmusementPark) && setConditionals.enabledTheWondrousBananAmusementPark) {
    x[Stats.CD] += 0.32
  }
  if (p4(sets.SacerdosRelivedOrdeal)) {
    x[Stats.CD] += 0.18 * setConditionals.valueSacerdosRelivedOrdeal
  }

  // CR

  if (p4(sets.WastelanderOfBanditryDesert) && setConditionals.valueWastelanderOfBanditryDesert > 0) {
    x[Stats.CR] += 0.10
  }
  if (p4(sets.LongevousDisciple)) {
    x[Stats.CR] += 0.08 * setConditionals.valueLongevousDisciple
  }
  if (p4(sets.PioneerDiverOfDeadWaters) && setConditionals.valuePioneerDiverOfDeadWaters > 2) {
    x[Stats.CR] += 0.04
  }
  if (p2(sets.IzumoGenseiAndTakamaDivineRealm) && setConditionals.enabledIzumoGenseiAndTakamaDivineRealm) {
    x[Stats.CR] += 0.12
  }

  // BE

  if (p4(sets.WatchmakerMasterOfDreamMachinations) && setConditionals.enabledWatchmakerMasterOfDreamMachinations) {
    x[Stats.BE] += 0.30
  }
  if (p2(sets.ForgeOfTheKalpagniLantern) && setConditionals.enabledForgeOfTheKalpagniLantern) {
    x[Stats.BE] += 0.40
  }

  // Buffs

  // Basic boost
  p4(sets.MusketeerOfWildWheat) && buffAbilityDmg(x, BASIC_TYPE, 0.10)

  // Skill boost
  p4(sets.FiresmithOfLavaForging) && buffAbilityDmg(x, SKILL_TYPE, 0.12)

  // Fua boost
  p2(sets.TheAshblazingGrandDuke) && buffAbilityDmg(x, FUA_TYPE, 0.20)
  p2(sets.DuranDynastyOfRunningWolves) && buffAbilityDmg(x, FUA_TYPE, 0.05 * setConditionals.valueDuranDynastyOfRunningWolves)

  // Ult boost
  p4(sets.TheWindSoaringValorous) && buffAbilityDmg(x, ULT_TYPE, 0.36, setConditionals.enabledTheWindSoaringValorous)
  p4(sets.ScholarLostInErudition) && buffAbilityDmg(x, ULT_TYPE | SKILL_TYPE, 0.20)

  if (p4(sets.GeniusOfBrilliantStars)) {
    x.DEF_PEN += setConditionals.enabledGeniusOfBrilliantStars ? 0.20 : 0.10
  }

  if (p4(sets.PrisonerInDeepConfinement)) {
    x.DEF_PEN += 0.06 * setConditionals.valuePrisonerInDeepConfinement
  }

  if (p2(sets.PioneerDiverOfDeadWaters) && setConditionals.valuePioneerDiverOfDeadWaters >= 0) {
    x.ELEMENTAL_DMG += 0.12
  }

  // Elemental DMG

  if (p2(sets.FiresmithOfLavaForging) && setConditionals.enabledFiresmithOfLavaForging) {
    x[Stats.Fire_DMG] += 0.12
  }

  if (p4(sets.ScholarLostInErudition) && setConditionals.enabledScholarLostInErudition) {
    buffAbilityDmg(x, SKILL_TYPE, 0.25)
  }

  // Dynamic - still need implementing

  p2(sets.SpaceSealingStation) && evaluateConditional(SpaceSealingStationConditional, x, action, context)
  p2(sets.RutilantArena) && evaluateConditional(RutilantArenaConditional, x, action, context)
  p2(sets.InertSalsotto) && evaluateConditional(InertSalsottoConditional, x, action, context)
  p2(sets.FleetOfTheAgeless) && evaluateConditional(FleetOfTheAgelessConditional, x, action, context)
  p2(sets.BelobogOfTheArchitects) && evaluateConditional(BelobogOfTheArchitectsConditional, x, action, context)
  p4(sets.IronCavalryAgainstTheScourge) && evaluateConditional(IronCavalryAgainstTheScourge150Conditional, x, action, context)
  p4(sets.IronCavalryAgainstTheScourge) && evaluateConditional(IronCavalryAgainstTheScourge250Conditional, x, action, context)
  p2(sets.PanCosmicCommercialEnterprise) && evaluateConditional(PanCosmicCommercialEnterpriseConditional, x, action, context)
  p2(sets.BrokenKeel) && evaluateConditional(BrokenKeelConditional, x, action, context)
  p2(sets.CelestialDifferentiator) && evaluateConditional(CelestialDifferentiatorConditional, x, action, context)
  p2(sets.TaliaKingdomOfBanditry) && evaluateConditional(TaliaKingdomOfBanditryConditional, x, action, context)
  p2(sets.FirmamentFrontlineGlamoth) && evaluateConditional(FirmamentFrontlineGlamoth135Conditional, x, action, context)
  p2(sets.FirmamentFrontlineGlamoth) && evaluateConditional(FirmamentFrontlineGlamoth160Conditional, x, action, context)

  for (const conditional of context.characterConditionalController.dynamicConditionals || []) {
    evaluateConditional(conditional, x, action, context)
  }
  for (const conditional of context.lightConeConditionalController.dynamicConditionals || []) {
    evaluateConditional(conditional, x, action, context)
  }
  for (const conditional of action.teammateDynamicConditionals || []) {
    evaluateConditional(conditional, x, action, context)
  }

  return x
}

export function calculateRelicStats(c: BasicStatsObject, head, hands, body, feet, planarSphere, linkRope) {
  for (const relic of [head, hands, body, feet, planarSphere, linkRope]) {
    if (!relic.part) continue

    for (const condensedStat of relic.condensedStats) {
      c[condensedStat[0]] += condensedStat[1]
    }
  }

  c.WEIGHT
    = head.weightScore
    + hands.weightScore
    + body.weightScore
    + feet.weightScore
    + planarSphere.weightScore
    + linkRope.weightScore
}

function sumPercentStat(stat, base, lc, trace, relicSum, setEffects): number {
  return base[stat] + lc[stat] + relicSum[stat] + trace[stat] + setEffects
}

function sumFlatStat(stat, statP, baseValue, lc, trace, relicSum, setEffects): number {
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

// @ts-ignore
export const baseCharacterStats: BasicStatsObject = {
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
