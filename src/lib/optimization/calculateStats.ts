import { BASIC_DMG_TYPE, BasicStatsObject, BREAK_DMG_TYPE, FUA_DMG_TYPE, SetsType, SKILL_DMG_TYPE, SUPER_BREAK_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { Stats, StatsValues } from 'lib/constants/constants'
import { evaluateConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  BelobogOfTheArchitectsConditional,
  BoneCollectionsSereneDemesneConditional,
  BrokenKeelConditional,
  FleetOfTheAgelessConditional,
  GiantTreeOfRaptBrooding135Conditional,
  GiantTreeOfRaptBrooding180Conditional,
  PanCosmicCommercialEnterpriseConditional,
  SpaceSealingStationConditional,
  TaliaKingdomOfBanditryConditional,
} from 'lib/gpu/conditionals/setConditionals'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { buffAbilityDefPen, buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { buffElementalDamageType, ComputedStatsArray, Key, Source, StatToKey } from 'lib/optimization/computedStatsArray'
import { p2, p4 } from 'lib/optimization/optimizerUtils'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'
import { Relic } from 'types/relic'

export function calculateSetCounts(setH: number, setG: number, setB: number, setF: number, setP: number, setL: number) {
  const sets: SetsType = {
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
    BoneCollectionsSereneDemesne: (1 >> (setP ^ 18)) + (1 >> (setL ^ 18)),
    GiantTreeOfRaptBrooding: (1 >> (setP ^ 19)) + (1 >> (setL ^ 19)),
  }
  return sets
}

export function calculateElementalStats(c: BasicStatsArray, context: OptimizerContext) {
  const sets = c.sets
  const base = context.characterStatsBreakdown.base
  const lc = context.characterStatsBreakdown.lightCone
  const trace = context.characterStatsBreakdown.traces

  // NOTE: c.ELEMENTAL_DMG represents the character's type, while x.ELEMENTAL_DMG represents ALL types.
  // This is mostly because there isn't a need to split out damage types while we're calculating display stats.
  c.ELEMENTAL_DMG.set(0, Source.NONE)
  switch (context.elementalDamageType) {
    case Stats.Physical_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Physical_DMG, base, lc, trace, c, 0.10 * p2(sets.ChampionOfStreetwiseBoxing)), Source.NONE)
      break
    case Stats.Fire_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Fire_DMG, base, lc, trace, c, 0.10 * p2(sets.FiresmithOfLavaForging)), Source.NONE)
      break
    case Stats.Ice_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Ice_DMG, base, lc, trace, c, 0.10 * p2(sets.HunterOfGlacialForest)), Source.NONE)
      break
    case Stats.Lightning_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Lightning_DMG, base, lc, trace, c, 0.10 * p2(sets.BandOfSizzlingThunder)), Source.NONE)
      break
    case Stats.Wind_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Wind_DMG, base, lc, trace, c, 0.10 * p2(sets.EagleOfTwilightLine)), Source.NONE)
      break
    case Stats.Quantum_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Quantum_DMG, base, lc, trace, c, 0.10 * p2(sets.GeniusOfBrilliantStars) + 0.10 * p2(sets.PoetOfMourningCollapse)), Source.NONE)
      break
    case Stats.Imaginary_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Imaginary_DMG, base, lc, trace, c, 0.10 * p2(sets.WastelanderOfBanditryDesert)), Source.NONE)
      break
  }
}

export function calculateBaseStats(c: BasicStatsArray, context: OptimizerContext) {
  const sets = c.sets
  const base = context.characterStatsBreakdown.base
  const lc = context.characterStatsBreakdown.lightCone
  const trace = context.characterStatsBreakdown.traces

  // const sets = c.sets
  c.SPD.set(sumFlatStat(Stats.SPD, Stats.SPD_P, context.baseSPD, lc, trace, c,
    0.06 * p2(sets.MessengerTraversingHackerspace)
    + 0.06 * p2(sets.ForgeOfTheKalpagniLantern)
    + 0.06 * p4(sets.MusketeerOfWildWheat)
    + 0.06 * p2(sets.SacerdosRelivedOrdeal)
    - 0.08 * p4(sets.PoetOfMourningCollapse)
    + 0.06 * p2(sets.GiantTreeOfRaptBrooding),
  ), Source.NONE)

  c.HP.set(sumFlatStat(Stats.HP, Stats.HP_P, context.baseHP, lc, trace, c,
    0.12 * p2(sets.FleetOfTheAgeless)
    + 0.12 * p2(sets.LongevousDisciple)
    + 0.12 * p2(sets.BoneCollectionsSereneDemesne),
  ), Source.NONE)

  c.ATK.set(sumFlatStat(Stats.ATK, Stats.ATK_P, context.baseATK, lc, trace, c,
    0.12 * p2(sets.SpaceSealingStation)
    + 0.12 * p2(sets.FirmamentFrontlineGlamoth)
    + 0.12 * p2(sets.MusketeerOfWildWheat)
    + 0.12 * p2(sets.PrisonerInDeepConfinement)
    + 0.12 * p2(sets.IzumoGenseiAndTakamaDivineRealm)
    + 0.12 * p2(sets.TheWindSoaringValorous)
    + 0.12 * p2(sets.HeroOfTriumphantSong),
  ), Source.NONE)

  c.DEF.set(sumFlatStat(Stats.DEF, Stats.DEF_P, context.baseDEF, lc, trace, c,
    0.15 * p2(sets.BelobogOfTheArchitects)
    + 0.15 * p2(sets.KnightOfPurityPalace),
  ), Source.NONE)

  c.CR.set(sumPercentStat(Stats.CR, base, lc, trace, c,
    0.08 * p2(sets.InertSalsotto)
    + 0.08 * p2(sets.RutilantArena)
    + 0.04 * p4(sets.PioneerDiverOfDeadWaters)
    + 0.04 * p2(sets.SigoniaTheUnclaimedDesolation)
    + 0.06 * p4(sets.TheWindSoaringValorous)
    + 0.08 * p2(sets.ScholarLostInErudition),
  ), Source.NONE)

  c.CD.set(sumPercentStat(Stats.CD, base, lc, trace, c,
    0.16 * p2(sets.CelestialDifferentiator)
    + 0.16 * p2(sets.TheWondrousBananAmusementPark),
  ), Source.NONE)

  c.EHR.set(sumPercentStat(Stats.EHR, base, lc, trace, c,
    0.10 * p2(sets.PanCosmicCommercialEnterprise),
  ), Source.NONE)

  c.RES.set(sumPercentStat(Stats.RES, base, lc, trace, c,
    0.10 * p2(sets.BrokenKeel),
  ), Source.NONE)

  c.BE.set(sumPercentStat(Stats.BE, base, lc, trace, c,
    0.16 * p2(sets.TaliaKingdomOfBanditry)
    + 0.16 * p2(sets.ThiefOfShootingMeteor)
    + 0.16 * p4(sets.ThiefOfShootingMeteor)
    + 0.16 * p2(sets.WatchmakerMasterOfDreamMachinations)
    + 0.16 * p2(sets.IronCavalryAgainstTheScourge),
  ), Source.NONE)

  c.ERR.set(sumPercentStat(Stats.ERR, base, lc, trace, c,
    0.05 * p2(sets.SprightlyVonwacq)
    + 0.05 * p2(sets.PenaconyLandOfTheDreams)
    + 0.05 * p2(sets.LushakaTheSunkenSeas),
  ), Source.NONE)

  c.OHB.set(sumPercentStat(Stats.OHB, base, lc, trace, c,
    0.10 * p2(sets.PasserbyOfWanderingCloud),
  ), Source.NONE)
}

export function calculateBasicEffects(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
  const lightConeConditionalController = context.lightConeConditionalController
  const characterConditionalController = context.characterConditionalController

  if (lightConeConditionalController.calculateBasicEffects) lightConeConditionalController.calculateBasicEffects(x, action, context)
  if (characterConditionalController.calculateBasicEffects) characterConditionalController.calculateBasicEffects(x, action, context)
}

export function calculateComputedStats(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
  const setConditionals = action.setConditionals
  const a = x.a
  const c = x.c
  const sets = c.sets
  const buffs = context.combatBuffs

  // Add base to computed
  a[Key.ATK] += c.a[Key.ATK] + buffs.ATK + buffs.ATK_P * context.baseATK
  a[Key.DEF] += c.a[Key.DEF] + buffs.DEF + buffs.DEF_P * context.baseDEF
  a[Key.HP] += c.a[Key.HP] + buffs.HP + buffs.HP_P * context.baseHP
  a[Key.SPD] += c.a[Key.SPD] + buffs.SPD + buffs.SPD_P * context.baseSPD
  a[Key.CD] += c.a[Key.CD] + buffs.CD
  a[Key.CR] += c.a[Key.CR] + buffs.CR
  a[Key.BE] += c.a[Key.BE] + buffs.BE
  a[Key.EHR] += c.a[Key.EHR]
  a[Key.RES] += c.a[Key.RES]
  a[Key.ERR] += c.a[Key.ERR]
  a[Key.OHB] += c.a[Key.OHB]

  if (x.m) {
    const xmc = x.m.c
    const xma = x.m.a
    xmc.ATK.set(x.a[Key.MEMO_ATK_SCALING] * c.a[Key.ATK] + x.a[Key.MEMO_ATK_FLAT], Source.NONE)
    xmc.DEF.set(x.a[Key.MEMO_DEF_SCALING] * c.a[Key.DEF] + x.a[Key.MEMO_DEF_FLAT], Source.NONE)
    xmc.HP.set(x.a[Key.MEMO_HP_SCALING] * c.a[Key.HP] + x.a[Key.MEMO_HP_FLAT], Source.NONE)
    xmc.SPD.set(x.a[Key.MEMO_SPD_SCALING] * c.a[Key.SPD] + x.a[Key.MEMO_SPD_FLAT], Source.NONE)

    xma[Key.ATK] = xmc.a[Key.ATK]
    xma[Key.DEF] = xmc.a[Key.DEF]
    xma[Key.HP] = xmc.a[Key.HP]
    xma[Key.SPD] = xmc.a[Key.SPD]

    xma[Key.CD] = c.a[Key.CD]
    xma[Key.CR] = c.a[Key.CR]
    xma[Key.BE] = c.a[Key.BE]
    xma[Key.EHR] = c.a[Key.EHR]
    xma[Key.RES] = c.a[Key.RES]
    xma[Key.ERR] = c.a[Key.ERR]
    xma[Key.OHB] = c.a[Key.OHB]
  }

  a[Key.ELEMENTAL_DMG] += buffs.DMG_BOOST
  a[Key.EFFECT_RES_PEN] += buffs.EFFECT_RES_PEN
  a[Key.VULNERABILITY] += buffs.VULNERABILITY
  a[Key.BREAK_EFFICIENCY_BOOST] += buffs.BREAK_EFFICIENCY

  buffElementalDamageType(x, context.elementalDamageType, c.a[Key.ELEMENTAL_DMG])
  if (x.m) {
    buffElementalDamageType(x.m, context.elementalDamageType, c.a[Key.ELEMENTAL_DMG])
  }

  // BASIC

  if (p2(sets.CelestialDifferentiator) && setConditionals.enabledCelestialDifferentiator && c.a[Key.CD] >= 1.20) {
    x.CR.buff(0.60, Source.CelestialDifferentiator)
  }

  // SPD

  if (p4(sets.MessengerTraversingHackerspace) && setConditionals.enabledMessengerTraversingHackerspace) {
    x.SPD_P.buffTeam(0.12, Source.MessengerTraversingHackerspace)
  }

  if (p4(sets.HeroOfTriumphantSong) && setConditionals.enabledHeroOfTriumphantSong) {
    x.SPD_P.buff(0.06, Source.HeroOfTriumphantSong)
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
    x.CR.buffBaseDual((c.a[Key.SPD] < 110 ? 0.20 : 0) + (c.a[Key.SPD] < 95 ? 0.12 : 0), Source.PoetOfMourningCollapse)
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

  // Dynamic set conditionals

  p2(sets.SpaceSealingStation) && evaluateConditional(SpaceSealingStationConditional, x, action, context)
  p2(sets.FleetOfTheAgeless) && evaluateConditional(FleetOfTheAgelessConditional, x, action, context)
  p2(sets.BelobogOfTheArchitects) && evaluateConditional(BelobogOfTheArchitectsConditional, x, action, context)
  p2(sets.PanCosmicCommercialEnterprise) && evaluateConditional(PanCosmicCommercialEnterpriseConditional, x, action, context)
  p2(sets.BrokenKeel) && evaluateConditional(BrokenKeelConditional, x, action, context)
  p2(sets.TaliaKingdomOfBanditry) && evaluateConditional(TaliaKingdomOfBanditryConditional, x, action, context)
  p2(sets.BoneCollectionsSereneDemesne) && evaluateConditional(BoneCollectionsSereneDemesneConditional, x, action, context)
  p2(sets.GiantTreeOfRaptBrooding) && evaluateConditional(GiantTreeOfRaptBrooding135Conditional, x, action, context)
  p2(sets.GiantTreeOfRaptBrooding) && evaluateConditional(GiantTreeOfRaptBrooding180Conditional, x, action, context)

  // Dynamic character / lc conditionals

  for (const conditional of context.characterConditionalController.dynamicConditionals ?? []) {
    evaluateConditional(conditional, x, action, context)
  }
  for (const conditional of context.lightConeConditionalController.dynamicConditionals ?? []) {
    evaluateConditional(conditional, x, action, context)
  }
  for (const conditional of action.teammateDynamicConditionals || []) {
    evaluateConditional(conditional, x, action, context)
  }

  // Terminal set conditionals

  if (p2(sets.FirmamentFrontlineGlamoth) && x.a[Key.SPD] >= 135) {
    x.ELEMENTAL_DMG.buff(x.a[Key.SPD] >= 160 ? 0.18 : 0.12, Source.FirmamentFrontlineGlamoth)
  }

  if (p2(sets.RutilantArena) && x.a[Key.CR] >= 0.70) {
    buffAbilityDmg(x, BASIC_DMG_TYPE | SKILL_DMG_TYPE, 0.20, Source.RutilantArena)
  }

  if (p2(sets.InertSalsotto) && x.a[Key.CR] >= 0.50) {
    buffAbilityDmg(x, ULT_DMG_TYPE | FUA_DMG_TYPE, 0.15, Source.InertSalsotto)
  }

  if (p4(sets.IronCavalryAgainstTheScourge) && x.a[Key.BE] >= 1.50) {
    buffAbilityDefPen(x, BREAK_DMG_TYPE, 0.10, Source.IronCavalryAgainstTheScourge)
    buffAbilityDefPen(x, SUPER_BREAK_DMG_TYPE, x.a[Key.BE] >= 2.50 ? 0.15 : 0, Source.IronCavalryAgainstTheScourge)
  }

  return x
}

export function calculateRelicStats(c: BasicStatsArray, head: Relic, hands: Relic, body: Relic, feet: Relic, planarSphere: Relic, linkRope: Relic, weights: boolean) {
  const a = c.a
  if (head?.condensedStats) {
    for (const condensedStat of head.condensedStats) {
      a[condensedStat[0]] += condensedStat[1]
    }
  }
  if (hands?.condensedStats) {
    for (const condensedStat of hands.condensedStats) {
      a[condensedStat[0]] += condensedStat[1]
    }
  }
  if (body?.condensedStats) {
    for (const condensedStat of body.condensedStats) {
      a[condensedStat[0]] += condensedStat[1]
    }
  }
  if (feet?.condensedStats) {
    for (const condensedStat of feet.condensedStats) {
      a[condensedStat[0]] += condensedStat[1]
    }
  }
  if (planarSphere?.condensedStats) {
    for (const condensedStat of planarSphere.condensedStats) {
      a[condensedStat[0]] += condensedStat[1]
    }
  }
  if (linkRope?.condensedStats) {
    for (const condensedStat of linkRope.condensedStats) {
      a[condensedStat[0]] += condensedStat[1]
    }
  }

  if (weights) {
    c.setWeight(
      head.weightScore
      + hands.weightScore
      + body.weightScore
      + feet.weightScore
      + planarSphere.weightScore
      + linkRope.weightScore,
    )
  }
}

function sumPercentStat(
  stat: StatsValues,
  base: Record<string, number>,
  lc: Record<string, number>,
  trace: Record<string, number>,
  relicSum: BasicStatsArray,
  setEffects: number): number {
  return base[stat] + lc[stat] + relicSum.a[StatToKey[stat]] + trace[stat] + setEffects
}

function sumFlatStat(
  stat: StatsValues,
  statP: StatsValues,
  baseValue: number,
  lc: Record<string, number>,
  trace: Record<string, number>,
  relicSum: BasicStatsArray,
  setEffects: number,
): number {
  return (baseValue) * (1 + setEffects + relicSum.a[StatToKey[statP]] + trace[statP] + lc[statP]) + relicSum.a[StatToKey[stat]] + trace[stat]
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
