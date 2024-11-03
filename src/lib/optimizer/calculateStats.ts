import { BASIC_TYPE, BasicStatsObject, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Sets, Stats, StatsValues } from 'lib/constants'
import { evaluateConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  BelobogOfTheArchitectsConditional,
  BrokenKeelConditional,
  CelestialDifferentiatorConditional,
  FirmamentFrontlineGlamoth135Conditional,
  FirmamentFrontlineGlamoth160Conditional,
  FleetOfTheAgelessConditional,
  InertSalsottoConditional,
  IronCavalryAgainstTheScourge150Conditional,
  IronCavalryAgainstTheScourge250Conditional,
  PanCosmicCommercialEnterpriseConditional,
  RutilantArenaConditional,
  SpaceSealingStationConditional,
  TaliaKingdomOfBanditryConditional,
} from 'lib/gpu/conditionals/setConditionals'
import { _buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { buff, buffWithSourceEffect, ComputedStatsArrayInstance, Effect, Key, Source } from 'lib/optimizer/computedStatsArray'
import { p2, p4 } from 'lib/optimizer/optimizerUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'
import { Relic } from 'types/Relic'

export function calculateSetCounts(c: BasicStatsObject, setH: number, setG: number, setB: number, setF: number, setP: number, setL: number) {
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
  return c.sets
}

export function calculateElementalStats(c: BasicStatsObject, context: OptimizerContext) {
  const base = context.characterStatsBreakdown.base
  const lc = context.characterStatsBreakdown.lightCone
  const trace = context.characterStatsBreakdown.traces
  const sets = c.sets

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

  const sets = c.sets
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

const buffBasicStats = buffWithSourceEffect(Source.BASE_STATS, Effect.DEFAULT)
const buffCombatBuffs = buffWithSourceEffect(Source.COMBAT_BUFFS, Effect.DEFAULT)

export function calculateComputedStats(x: ComputedStatsArrayInstance, action: OptimizerAction, context: OptimizerContext) {
  const setConditionals = action.setConditionals
  const c = x.c
  const sets = c.sets

  x.HP.buff(x.$ATK_P + 0.20)

  // Add base to computed
  buffBasicStats(x, Key.ATK, c[Stats.ATK])
  buffBasicStats(x, Key.DEF, c[Stats.DEF])
  buffBasicStats(x, Key.HP, c[Stats.HP])
  buffBasicStats(x, Key.SPD, c[Stats.SPD])
  buffBasicStats(x, Key.CD, c[Stats.CD])
  buffBasicStats(x, Key.CR, c[Stats.CR])
  buffBasicStats(x, Key.EHR, c[Stats.EHR])
  buffBasicStats(x, Key.RES, c[Stats.RES])
  buffBasicStats(x, Key.BE, c[Stats.BE])
  buffBasicStats(x, Key.ERR, c[Stats.ERR])
  buffBasicStats(x, Key.OHB, c[Stats.OHB])
  // x[context.elementalDamageType] += c.ELEMENTAL_DMG

  // Combat buffs
  buffCombatBuffs(x, Key.ATK, context.combatBuffs.ATK + context.combatBuffs.ATK_P * context.baseATK)
  buffCombatBuffs(x, Key.DEF, context.combatBuffs.DEF + context.combatBuffs.DEF_P * context.baseDEF)
  buffCombatBuffs(x, Key.HP, context.combatBuffs.HP + context.combatBuffs.HP_P * context.baseHP)
  buffCombatBuffs(x, Key.CD, context.combatBuffs.CD)
  buffCombatBuffs(x, Key.CR, context.combatBuffs.CR)
  buffCombatBuffs(x, Key.SPD, context.combatBuffs.SPD_P * context.baseSPD + context.combatBuffs.SPD)
  buffCombatBuffs(x, Key.BE, context.combatBuffs.BE)
  buffCombatBuffs(x, Key.ELEMENTAL_DMG, context.combatBuffs.DMG_BOOST)
  buffCombatBuffs(x, Key.EFFECT_RES_PEN, context.combatBuffs.EFFECT_RES_PEN)
  buffCombatBuffs(x, Key.VULNERABILITY, context.combatBuffs.VULNERABILITY)
  buffCombatBuffs(x, Key.BREAK_EFFICIENCY_BOOST, context.combatBuffs.BREAK_EFFICIENCY)

  // SPD

  if (p4(sets.MessengerTraversingHackerspace) && setConditionals.enabledMessengerTraversingHackerspace) {
    buff(x, Key.SPD_P, 0.12, Sets.MessengerTraversingHackerspace, Effect.DEFAULT)
  }
  buff(x, Key.SPD, x.get(Key.SPD_P) * context.baseSPD)

  // ATK

  if (p4(sets.ChampionOfStreetwiseBoxing)) {
    buff(x, Key.ATK_P, 0.05 * setConditionals.valueChampionOfStreetwiseBoxing, Sets.ChampionOfStreetwiseBoxing, Effect.DEFAULT)
  }
  if (p4(sets.BandOfSizzlingThunder) && setConditionals.enabledBandOfSizzlingThunder) {
    buff(x, Key.ATK_P, 0.20, Sets.BandOfSizzlingThunder, Effect.DEFAULT)
  }
  if (p4(sets.TheAshblazingGrandDuke)) {
    buff(x, Key.ATK_P, 0.06 * setConditionals.valueTheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke, Effect.DEFAULT)
  }
  buff(x, Key.ATK, x.get(Key.ATK_P) * context.baseATK)

  // DEF

  buff(x, Key.DEF, x.get(Key.DEF_P) * context.baseDEF)

  // HP

  buff(x, Key.HP, x.get(Key.HP_P) * context.baseHP)

  // CD

  if (p4(sets.HunterOfGlacialForest) && setConditionals.enabledHunterOfGlacialForest) {
    buff(x, Key.CD, 0.25, Sets.HunterOfGlacialForest, Effect.DEFAULT)
  }
  if (p4(sets.WastelanderOfBanditryDesert)) {
    buff(x, Key.CD, 0.10 * (setConditionals.valueWastelanderOfBanditryDesert == 2 ? 1 : 0), Sets.WastelanderOfBanditryDesert, Effect.DEFAULT)
  }
  if (p4(sets.PioneerDiverOfDeadWaters)) {
    buff(x, Key.CD, pioneerSetIndexToCd[setConditionals.valuePioneerDiverOfDeadWaters], Sets.PioneerDiverOfDeadWaters, Effect.DEFAULT)
  }
  if (p2(sets.SigoniaTheUnclaimedDesolation)) {
    buff(x, Key.CD, 0.04 * (setConditionals.valueSigoniaTheUnclaimedDesolation), Sets.SigoniaTheUnclaimedDesolation, Effect.DEFAULT)
  }
  if (p2(sets.DuranDynastyOfRunningWolves) && setConditionals.valueDuranDynastyOfRunningWolves >= 5) {
    buff(x, Key.CD, 0.25, Sets.DuranDynastyOfRunningWolves, Effect.DEFAULT)
  }
  if (p2(sets.TheWondrousBananAmusementPark) && setConditionals.enabledTheWondrousBananAmusementPark) {
    buff(x, Key.CD, 0.32, Sets.TheWondrousBananAmusementPark, Effect.DEFAULT)
  }
  if (p4(sets.SacerdosRelivedOrdeal)) {
    buff(x, Key.CD, 0.18 * setConditionals.valueSacerdosRelivedOrdeal, Sets.SacerdosRelivedOrdeal, Effect.DEFAULT)
  }

  // CR

  if (p4(sets.WastelanderOfBanditryDesert) && setConditionals.valueWastelanderOfBanditryDesert > 0) {
    buff(x, Key.CR, 0.10, Sets.WastelanderOfBanditryDesert, Effect.DEFAULT)
  }
  if (p4(sets.LongevousDisciple)) {
    buff(x, Key.CR, 0.08 * setConditionals.valueLongevousDisciple, Sets.LongevousDisciple, Effect.DEFAULT)
  }
  if (p4(sets.PioneerDiverOfDeadWaters) && setConditionals.valuePioneerDiverOfDeadWaters > 2) {
    buff(x, Key.CR, 0.04, Sets.PioneerDiverOfDeadWaters, Effect.DEFAULT)
  }
  if (p2(sets.IzumoGenseiAndTakamaDivineRealm) && setConditionals.enabledIzumoGenseiAndTakamaDivineRealm) {
    buff(x, Key.CR, 0.12, Sets.IzumoGenseiAndTakamaDivineRealm, Effect.DEFAULT)
  }

  // BE

  if (p4(sets.WatchmakerMasterOfDreamMachinations) && setConditionals.enabledWatchmakerMasterOfDreamMachinations) {
    buff(x, Key.BE, 0.30, Sets.WatchmakerMasterOfDreamMachinations, Effect.DEFAULT)
  }
  if (p2(sets.ForgeOfTheKalpagniLantern) && setConditionals.enabledForgeOfTheKalpagniLantern) {
    buff(x, Key.BE, 0.40, Sets.ForgeOfTheKalpagniLantern, Effect.DEFAULT)
  }

  // Buffs

  // Basic boost
  if (p4(sets.MusketeerOfWildWheat)) {
    _buffAbilityDmg(x, BASIC_TYPE, 0.10, Sets.MusketeerOfWildWheat, Effect.DEFAULT)
  }

  // Skill boost
  if (p4(sets.FiresmithOfLavaForging)) {
    _buffAbilityDmg(x, SKILL_TYPE, 0.12, Sets.FiresmithOfLavaForging, Effect.DEFAULT)
  }

  if (p4(sets.ScholarLostInErudition) && setConditionals.enabledScholarLostInErudition) {
    _buffAbilityDmg(x, SKILL_TYPE, 0.25, Sets.ScholarLostInErudition, Effect.DEFAULT)
  }

  // Fua boost
  if (p2(sets.TheAshblazingGrandDuke)) {
    _buffAbilityDmg(x, FUA_TYPE, 0.20, Sets.TheAshblazingGrandDuke, Effect.DEFAULT)
  }
  if (p2(sets.DuranDynastyOfRunningWolves)) {
    _buffAbilityDmg(x, FUA_TYPE, 0.05 * setConditionals.valueDuranDynastyOfRunningWolves, Sets.DuranDynastyOfRunningWolves, Effect.DEFAULT)
  }

  // Ult boost
  if (p4(sets.TheWindSoaringValorous) && setConditionals.enabledTheWindSoaringValorous) {
    _buffAbilityDmg(x, ULT_TYPE, 0.36, Sets.TheWindSoaringValorous, Effect.DEFAULT)
  }
  if (p4(sets.ScholarLostInErudition)) {
    _buffAbilityDmg(x, ULT_TYPE | SKILL_TYPE, 0.20, Sets.ScholarLostInErudition, Effect.DEFAULT)
  }

  if (p4(sets.GeniusOfBrilliantStars)) {
    buff(x, Key.DEF_PEN, setConditionals.enabledGeniusOfBrilliantStars ? 0.20 : 0.10, Sets.GeniusOfBrilliantStars, Effect.DEFAULT)
  }

  if (p4(sets.PrisonerInDeepConfinement)) {
    buff(x, Key.DEF_PEN, 0.06 * setConditionals.valuePrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement, Effect.DEFAULT)
  }

  if (p2(sets.PioneerDiverOfDeadWaters) && setConditionals.valuePioneerDiverOfDeadWaters >= 0) {
    buff(x, Key.ELEMENTAL_DMG, 0.12, Sets.PioneerDiverOfDeadWaters, Effect.DEFAULT)
  }

  // Elemental DMG

  if (p2(sets.FiresmithOfLavaForging) && setConditionals.enabledFiresmithOfLavaForging) {
    buff(x, Key.FIRE_DMG_BOOST, 0.12, Sets.FiresmithOfLavaForging, Effect.DEFAULT)
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

  for (const conditional of context.characterConditionalController.dynamicConditionals ?? []) {
    evaluateConditional(conditional, x, action, context)
  }
  for (const conditional of context.lightConeConditionalController.dynamicConditionals ?? []) {
    evaluateConditional(conditional, x, action, context)
  }
  for (const conditional of action.teammateDynamicConditionals || []) {
    evaluateConditional(conditional, x, action, context)
  }

  return x
}

export function calculateRelicStats(c: BasicStatsObject, head: Relic, hands: Relic, body: Relic, feet: Relic, planarSphere: Relic, linkRope: Relic) {
  for (const relic of [head, hands, body, feet, planarSphere, linkRope]) {
    if (!relic.part) continue

    for (const condensedStat of relic.condensedStats!) {
      c[condensedStat[0] as StatsValues] += condensedStat[1]
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

function sumPercentStat(
  stat: StatsValues,
  base: Record<string, number>,
  lc: Record<string, number>,
  trace: Record<string, number>,
  relicSum: BasicStatsObject,
  setEffects: number): number {
  return base[stat] + lc[stat] + relicSum[stat] + trace[stat] + setEffects
}

function sumFlatStat(
  stat: StatsValues,
  statP: StatsValues,
  baseValue: number,
  lc: Record<string, number>,
  trace: Record<string, number>,
  relicSum: BasicStatsObject,
  setEffects: number,
): number {
  return (baseValue) * (1 + setEffects + relicSum[statP] + trace[statP] + lc[statP]) + relicSum[stat] + trace[stat]
}

const pioneerSetIndexToCd: Record<number, number> = {
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
