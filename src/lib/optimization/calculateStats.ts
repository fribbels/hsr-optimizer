import { BASIC_DMG_TYPE, BasicStatsObject, FUA_DMG_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { Stats, StatsValues } from 'lib/constants/constants'
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
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { buffElementalDamageType, ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { p2, p4 } from 'lib/optimization/optimizerUtils'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'
import { Relic } from 'types/relic'

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
    HeroOfTriumphantSong: (1 >> (setH ^ 22)) + (1 >> (setG ^ 22)) + (1 >> (setB ^ 22)) + (1 >> (setF ^ 22)),
    PoetOfMourningCollapse: (1 >> (setH ^ 23)) + (1 >> (setG ^ 23)) + (1 >> (setB ^ 23)) + (1 >> (setF ^ 23)),

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
  // This is mostly because there isn't a need to split out damage types while we're calculating display stats.
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
      c.ELEMENTAL_DMG = sumPercentStat(Stats.Quantum_DMG, base, lc, trace, c, 0.10 * p2(sets.GeniusOfBrilliantStars) + 0.10 * p2(sets.PoetOfMourningCollapse))
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
    + 0.06 * p2(sets.SacerdosRelivedOrdeal)
    - 0.08 * p4(sets.PoetOfMourningCollapse),
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
    + 0.12 * p2(sets.TheWindSoaringValorous)
    + 0.12 * p2(sets.HeroOfTriumphantSong),
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

export function calculateComputedStats(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
  const setConditionals = action.setConditionals
  const a = x.a
  const c = x.c
  const sets = c.sets
  const buffs = context.combatBuffs

  // Add base to computed
  a[Key.ATK] += c[Stats.ATK] + buffs.ATK + buffs.ATK_P * context.baseATK
  a[Key.DEF] += c[Stats.DEF] + buffs.DEF + buffs.DEF_P * context.baseDEF
  a[Key.HP] += c[Stats.HP] + buffs.HP + buffs.HP_P * context.baseHP
  a[Key.SPD] += c[Stats.SPD] + buffs.SPD + buffs.SPD_P * context.baseSPD
  a[Key.CD] += c[Stats.CD] + buffs.CD
  a[Key.CR] += c[Stats.CR] + buffs.CR
  a[Key.BE] += c[Stats.BE] + buffs.BE
  a[Key.EHR] += c[Stats.EHR]
  a[Key.RES] += c[Stats.RES]
  a[Key.ERR] += c[Stats.ERR]
  a[Key.OHB] += c[Stats.OHB]

  if (x.m) {
    const xmc = x.m.c
    const xma = x.m.a
    xmc.ATK = x.a[Key.MEMO_ATK_SCALING] * c.ATK + x.a[Key.MEMO_ATK_FLAT]
    xmc.DEF = x.a[Key.MEMO_DEF_SCALING] * c.DEF + x.a[Key.MEMO_DEF_FLAT]
    xmc.HP = x.a[Key.MEMO_HP_SCALING] * c.HP + x.a[Key.MEMO_HP_FLAT]
    xmc.SPD = x.a[Key.MEMO_SPD_SCALING] * c.SPD + x.a[Key.MEMO_SPD_FLAT]

    xma[Key.ATK] += xmc[Stats.ATK]
    xma[Key.DEF] += xmc[Stats.DEF]
    xma[Key.HP] += xmc[Stats.HP]
    xma[Key.SPD] += xmc[Stats.SPD]

    xma[Key.CD] += c[Stats.CD]
    xma[Key.CR] += c[Stats.CR]
    xma[Key.BE] += c[Stats.BE]
    xma[Key.EHR] += c[Stats.EHR]
    xma[Key.RES] += c[Stats.RES]
    xma[Key.ERR] += c[Stats.ERR]
    xma[Key.OHB] += c[Stats.OHB]
  }

  a[Key.ELEMENTAL_DMG] += buffs.DMG_BOOST
  a[Key.EFFECT_RES_PEN] += buffs.EFFECT_RES_PEN
  a[Key.VULNERABILITY] += buffs.VULNERABILITY
  a[Key.BREAK_EFFICIENCY_BOOST] += buffs.BREAK_EFFICIENCY

  buffElementalDamageType(x, context.elementalDamageType, c.ELEMENTAL_DMG)
  if (x.m) {
    buffElementalDamageType(x.m, context.elementalDamageType, c.ELEMENTAL_DMG)
  }

  // SPD

  if (p4(sets.MessengerTraversingHackerspace) && setConditionals.enabledMessengerTraversingHackerspace) {
    x.SPD_P.buffTeam(0.12, Source.MessengerTraversingHackerspace)
  }

  if (p4(sets.HeroOfTriumphantSong) && setConditionals.enabledHeroOfTriumphantSong) {
    x.SPD_P.buffTeam(0.06, Source.HeroOfTriumphantSong)
    x.CD.buffDual(0.30, Source.HeroOfTriumphantSong)
  }

  // ATK

  if (p4(sets.ChampionOfStreetwiseBoxing)) {
    x.ATK_P.buff(0.05 * setConditionals.valueChampionOfStreetwiseBoxing, Source.ChampionOfStreetwiseBoxing)
  }
  if (p4(sets.BandOfSizzlingThunder) && setConditionals.enabledBandOfSizzlingThunder) {
    x.ATK_P.buff(0.20, Source.BandOfSizzlingThunder)
  }
  if (p4(sets.TheAshblazingGrandDuke)) {
    x.ATK_P.buff(0.06 * setConditionals.valueTheAshblazingGrandDuke, Source.TheAshblazingGrandDuke)
  }

  // DEF

  // HP

  // CD

  if (p4(sets.HunterOfGlacialForest) && setConditionals.enabledHunterOfGlacialForest) {
    x.CD.buff(0.25, Source.HunterOfGlacialForest)
  }
  if (p4(sets.WastelanderOfBanditryDesert)) {
    x.CD.buff(0.10 * (setConditionals.valueWastelanderOfBanditryDesert == 2 ? 1 : 0), Source.WastelanderOfBanditryDesert)
  }
  if (p4(sets.PioneerDiverOfDeadWaters)) {
    x.CD.buff(pioneerSetIndexToCd[setConditionals.valuePioneerDiverOfDeadWaters], Source.PioneerDiverOfDeadWaters)
  }
  if (p2(sets.SigoniaTheUnclaimedDesolation)) {
    x.CD.buff(0.04 * (setConditionals.valueSigoniaTheUnclaimedDesolation), Source.SigoniaTheUnclaimedDesolation)
  }
  if (p2(sets.DuranDynastyOfRunningWolves) && setConditionals.valueDuranDynastyOfRunningWolves >= 5) {
    x.CD.buff(0.25, Source.DuranDynastyOfRunningWolves)
  }
  if (p2(sets.TheWondrousBananAmusementPark) && setConditionals.enabledTheWondrousBananAmusementPark) {
    x.CD.buff(0.32, Source.TheWondrousBananAmusementPark)
  }
  if (p4(sets.SacerdosRelivedOrdeal)) {
    x.CD.buff(0.18 * setConditionals.valueSacerdosRelivedOrdeal, Source.SacerdosRelivedOrdeal)
  }

  // CR

  if (p4(sets.WastelanderOfBanditryDesert) && setConditionals.valueWastelanderOfBanditryDesert > 0) {
    x.CR.buff(0.10, Source.WastelanderOfBanditryDesert)
  }
  if (p4(sets.LongevousDisciple)) {
    x.CR.buff(0.08 * setConditionals.valueLongevousDisciple, Source.LongevousDisciple)
  }
  if (p4(sets.PioneerDiverOfDeadWaters) && setConditionals.valuePioneerDiverOfDeadWaters > 2) {
    x.CR.buff(0.04, Source.PioneerDiverOfDeadWaters)
  }
  if (p2(sets.IzumoGenseiAndTakamaDivineRealm) && setConditionals.enabledIzumoGenseiAndTakamaDivineRealm) {
    x.CR.buff(0.12, Source.IzumoGenseiAndTakamaDivineRealm)
  }
  if (p4(sets.PoetOfMourningCollapse)) {
    x.CR.buffDual((c[Stats.SPD] < 110 ? 0.20 : 0) + (c[Stats.SPD] < 95 ? 0.12 : 0), Source.PoetOfMourningCollapse)
  }

  // BE

  if (p4(sets.WatchmakerMasterOfDreamMachinations) && setConditionals.enabledWatchmakerMasterOfDreamMachinations) {
    x.BE.buffTeam(0.30, Source.WatchmakerMasterOfDreamMachinations)
  }
  if (p2(sets.ForgeOfTheKalpagniLantern) && setConditionals.enabledForgeOfTheKalpagniLantern) {
    x.BE.buff(0.40, Source.ForgeOfTheKalpagniLantern)
  }

  // Buffs

  // Basic boost
  if (p4(sets.MusketeerOfWildWheat)) {
    buffAbilityDmg(x, BASIC_DMG_TYPE, 0.10, Source.MusketeerOfWildWheat)
  }

  // Skill boost
  if (p4(sets.FiresmithOfLavaForging)) {
    buffAbilityDmg(x, SKILL_DMG_TYPE, 0.12, Source.FiresmithOfLavaForging)
  }

  // Fua boost
  if (p2(sets.TheAshblazingGrandDuke)) {
    buffAbilityDmg(x, FUA_DMG_TYPE, 0.20, Source.TheAshblazingGrandDuke)
  }
  if (p2(sets.DuranDynastyOfRunningWolves)) {
    buffAbilityDmg(x, FUA_DMG_TYPE, 0.05 * setConditionals.valueDuranDynastyOfRunningWolves, Source.DuranDynastyOfRunningWolves)
  }

  // Ult boost
  if (p4(sets.TheWindSoaringValorous) && setConditionals.enabledTheWindSoaringValorous) {
    buffAbilityDmg(x, ULT_DMG_TYPE, 0.36, Source.TheWindSoaringValorous)
  }
  if (p4(sets.ScholarLostInErudition)) {
    buffAbilityDmg(x, ULT_DMG_TYPE | SKILL_DMG_TYPE, 0.20, Source.ScholarLostInErudition)
  }

  if (p4(sets.GeniusOfBrilliantStars)) {
    x.DEF_PEN.buff(setConditionals.enabledGeniusOfBrilliantStars ? 0.20 : 0.10, Source.GeniusOfBrilliantStars)
  }

  if (p4(sets.PrisonerInDeepConfinement)) {
    x.DEF_PEN.buff(0.06 * setConditionals.valuePrisonerInDeepConfinement, Source.PrisonerInDeepConfinement)
  }

  if (p2(sets.PioneerDiverOfDeadWaters) && setConditionals.valuePioneerDiverOfDeadWaters >= 0) {
    x.ELEMENTAL_DMG.buff(0.12, Source.PioneerDiverOfDeadWaters)
  }

  // Elemental DMG

  if (p2(sets.FiresmithOfLavaForging) && setConditionals.enabledFiresmithOfLavaForging) {
    x.FIRE_DMG_BOOST.buff(0.12, Source.FiresmithOfLavaForging)
  }

  if (p4(sets.ScholarLostInErudition) && setConditionals.enabledScholarLostInErudition) {
    buffAbilityDmg(x, SKILL_DMG_TYPE, 0.25, Source.ScholarLostInErudition)
  }

  a[Key.SPD] += a[Key.SPD_P] * context.baseSPD
  a[Key.ATK] += a[Key.ATK_P] * context.baseATK
  a[Key.DEF] += a[Key.DEF_P] * context.baseDEF
  a[Key.HP] += a[Key.HP_P] * context.baseHP

  if (x.m) {
    const xma = x.m.a
    xma[Key.SPD] += xma[Key.SPD_P] * (context.baseSPD * x.a[Key.MEMO_SPD_SCALING])
    xma[Key.ATK] += xma[Key.ATK_P] * (context.baseATK * x.a[Key.MEMO_ATK_SCALING])
    xma[Key.DEF] += xma[Key.DEF_P] * (context.baseDEF * x.a[Key.MEMO_DEF_SCALING])
    xma[Key.HP] += xma[Key.HP_P] * (context.baseHP * x.a[Key.MEMO_HP_SCALING])
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
  if (head?.condensedStats) {
    for (const condensedStat of head.condensedStats) {
      c[condensedStat[0] as StatsValues] += condensedStat[1]
    }
  }
  if (hands?.condensedStats) {
    for (const condensedStat of hands.condensedStats) {
      c[condensedStat[0] as StatsValues] += condensedStat[1]
    }
  }
  if (body?.condensedStats) {
    for (const condensedStat of body.condensedStats) {
      c[condensedStat[0] as StatsValues] += condensedStat[1]
    }
  }
  if (feet?.condensedStats) {
    for (const condensedStat of feet.condensedStats) {
      c[condensedStat[0] as StatsValues] += condensedStat[1]
    }
  }
  if (planarSphere?.condensedStats) {
    for (const condensedStat of planarSphere.condensedStats) {
      c[condensedStat[0] as StatsValues] += condensedStat[1]
    }
  }
  if (linkRope?.condensedStats) {
    for (const condensedStat of linkRope.condensedStats) {
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
