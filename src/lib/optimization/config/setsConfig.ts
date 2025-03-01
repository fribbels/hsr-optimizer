import { BASIC_DMG_TYPE, FUA_DMG_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { Sets, SetsOrnaments, SetsRelics, Stats } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { OptimizerContext, SetConditional } from 'types/optimizer'

export type SetsDefinition = {
  key: keyof typeof Sets
  index: number
  // Basic
  p2c?: (c: BasicStatsArray, context: OptimizerContext) => void
  p4c?: (c: BasicStatsArray, context: OptimizerContext) => void
  // Combat
  p2x?: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => void
  p4x?: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => void
  // Terminal
  p2t?: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => void
  p4t?: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => void
}

export const OrnamentSetsConfig: Record<keyof typeof SetsOrnaments, SetsDefinition> = {
  SpaceSealingStation: {
    key: 'SpaceSealingStation',
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ATK_P.buff(0.12, Source.SpaceSealingStation)
    },
  },
  FleetOfTheAgeless: {
    key: 'FleetOfTheAgeless',
    index: 1,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.HP_P.buff(0.12, Source.FleetOfTheAgeless)
    },
  },
  PanCosmicCommercialEnterprise: {
    key: 'PanCosmicCommercialEnterprise',
    index: 2,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.EHR.buff(0.10, Source.PanCosmicCommercialEnterprise)
    },
  },
  BelobogOfTheArchitects: {
    key: 'BelobogOfTheArchitects',
    index: 3,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.DEF_P.buff(0.15, Source.BelobogOfTheArchitects)
    },
  },
  CelestialDifferentiator: {
    key: 'CelestialDifferentiator',
    index: 4,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CD.buff(0.16, Source.CelestialDifferentiator)
    },
    p2x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledCelestialDifferentiator && x.c.a[Key.CD] >= 1.20) {
        x.CR.buff(0.60, Source.CelestialDifferentiator)
      }
    },
  },
  InertSalsotto: {
    key: 'InertSalsotto',
    index: 5,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CR.buff(0.08, Source.InertSalsotto)
    },
  },
  TaliaKingdomOfBanditry: {
    key: 'TaliaKingdomOfBanditry',
    index: 6,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.BE.buff(0.16, Source.TaliaKingdomOfBanditry)
    },
  },
  SprightlyVonwacq: {
    key: 'SprightlyVonwacq',
    index: 7,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ERR.buff(0.05, Source.SprightlyVonwacq)
    },
  },
  RutilantArena: {
    key: 'RutilantArena',
    index: 8,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CR.buff(0.08, Source.RutilantArena)
    },
  },
  BrokenKeel: {
    key: 'BrokenKeel',
    index: 9,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.RES.buff(0.10, Source.BrokenKeel)
    },
  },
  FirmamentFrontlineGlamoth: {
    key: 'FirmamentFrontlineGlamoth',
    index: 10,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ATK_P.buff(0.12, Source.FirmamentFrontlineGlamoth)
    },
  },
  PenaconyLandOfTheDreams: {
    key: 'PenaconyLandOfTheDreams',
    index: 11,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ERR.buff(0.05, Source.PenaconyLandOfTheDreams)
    },
  },
  SigoniaTheUnclaimedDesolation: {
    key: 'SigoniaTheUnclaimedDesolation',
    index: 12,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CR.buff(0.04, Source.SigoniaTheUnclaimedDesolation)
    },
    p2x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      x.CD.buff(0.04 * (setConditionals.valueSigoniaTheUnclaimedDesolation), Source.SigoniaTheUnclaimedDesolation)
    },
  },
  IzumoGenseiAndTakamaDivineRealm: {
    key: 'IzumoGenseiAndTakamaDivineRealm',
    index: 13,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ATK_P.buff(0.12, Source.IzumoGenseiAndTakamaDivineRealm)
    },
    p2x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledIzumoGenseiAndTakamaDivineRealm) {
        x.CR.buff(0.12, Source.IzumoGenseiAndTakamaDivineRealm)
      }
    },
  },
  DuranDynastyOfRunningWolves: {
    key: 'DuranDynastyOfRunningWolves',
    index: 14,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
    p2x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      buffAbilityDmg(x, FUA_DMG_TYPE, 0.05 * setConditionals.valueDuranDynastyOfRunningWolves, Source.DuranDynastyOfRunningWolves)
      if (setConditionals.valueDuranDynastyOfRunningWolves >= 5) {
        x.CD.buff(0.25, Source.DuranDynastyOfRunningWolves)
      }
    },
  },
  ForgeOfTheKalpagniLantern: {
    key: 'ForgeOfTheKalpagniLantern',
    index: 15,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.SPD_P.buff(0.06, Source.ForgeOfTheKalpagniLantern)
    },
    p2x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledForgeOfTheKalpagniLantern) {
        x.BE.buff(0.40, Source.ForgeOfTheKalpagniLantern)
      }
    },
  },
  LushakaTheSunkenSeas: {
    key: 'LushakaTheSunkenSeas',
    index: 16,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ERR.buff(0.05, Source.LushakaTheSunkenSeas)
    },
  },
  TheWondrousBananAmusementPark: {
    key: 'TheWondrousBananAmusementPark',
    index: 17,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CD.buff(0.16, Source.TheWondrousBananAmusementPark)
    },
    p2x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledTheWondrousBananAmusementPark) {
        x.CD.buff(0.32, Source.TheWondrousBananAmusementPark)
      }
    },
  },
  BoneCollectionsSereneDemesne: {
    key: 'BoneCollectionsSereneDemesne',
    index: 18,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.HP_P.buff(0.12, Source.BoneCollectionsSereneDemesne)
    },
  },
  GiantTreeOfRaptBrooding: {
    key: 'GiantTreeOfRaptBrooding',
    index: 19,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.SPD_P.buff(0.06, Source.GiantTreeOfRaptBrooding)
    },
  },
}

export const RelicSetsConfig: Record<keyof typeof SetsRelics, SetsDefinition> = {
  PasserbyOfWanderingCloud: {
    key: 'PasserbyOfWanderingCloud',
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.OHB.buff(0.10, Source.PasserbyOfWanderingCloud)
    },
  },
  MusketeerOfWildWheat: {
    key: 'MusketeerOfWildWheat',
    index: 1,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ATK_P.buff(0.12, Source.MusketeerOfWildWheat)
    },
    p4c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.SPD_P.buff(0.06, Source.MusketeerOfWildWheat)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      buffAbilityDmg(x, BASIC_DMG_TYPE, 0.10, Source.MusketeerOfWildWheat)
    },
  },
  KnightOfPurityPalace: {
    key: 'KnightOfPurityPalace',
    index: 2,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.DEF_P.buff(0.15, Source.KnightOfPurityPalace)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      x.SHIELD_BOOST.buff(0.20, Source.KnightOfPurityPalace)
    },
  },
  HunterOfGlacialForest: {
    key: 'HunterOfGlacialForest',
    index: 3,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      context.elementalDamageType == Stats.Ice_DMG && c.ICE_DMG_BOOST.buff(0.10, Source.HunterOfGlacialForest)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledHunterOfGlacialForest) {
        x.CD.buff(0.25, Source.HunterOfGlacialForest)
      }
    },
  },
  ChampionOfStreetwiseBoxing: {
    key: 'ChampionOfStreetwiseBoxing',
    index: 4,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      context.elementalDamageType == Stats.Physical_DMG && c.PHYSICAL_DMG_BOOST.buff(0.10, Source.ChampionOfStreetwiseBoxing)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      x.ATK_P.buff(0.05 * setConditionals.valueChampionOfStreetwiseBoxing, Source.ChampionOfStreetwiseBoxing)
    },
  },
  GuardOfWutheringSnow: {
    key: 'GuardOfWutheringSnow',
    index: 5,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
    p2x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      x.DMG_RED_MULTI.multiply((1 - 0.08), Source.GuardOfWutheringSnow)
    },
  },
  FiresmithOfLavaForging: {
    key: 'FiresmithOfLavaForging',
    index: 6,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      context.elementalDamageType == Stats.Fire_DMG && c.FIRE_DMG_BOOST.buff(0.10, Source.FiresmithOfLavaForging)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      buffAbilityDmg(x, SKILL_DMG_TYPE, 0.12, Source.FiresmithOfLavaForging)
      if (setConditionals.enabledFiresmithOfLavaForging) {
        x.FIRE_DMG_BOOST.buff(0.12, Source.FiresmithOfLavaForging)
      }
    },
  },
  GeniusOfBrilliantStars: {
    key: 'GeniusOfBrilliantStars',
    index: 7,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      context.elementalDamageType == Stats.Quantum_DMG && c.QUANTUM_DMG_BOOST.buff(0.10, Source.GeniusOfBrilliantStars)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      x.DEF_PEN.buff(setConditionals.enabledGeniusOfBrilliantStars ? 0.20 : 0.10, Source.GeniusOfBrilliantStars)
    },
  },
  BandOfSizzlingThunder: {
    key: 'BandOfSizzlingThunder',
    index: 8,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      context.elementalDamageType == Stats.Lightning_DMG && c.LIGHTNING_DMG_BOOST.buff(0.10, Source.BandOfSizzlingThunder)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledBandOfSizzlingThunder) {
        x.ATK_P.buff(0.20, Source.BandOfSizzlingThunder)
      }
    },
  },
  EagleOfTwilightLine: {
    key: 'EagleOfTwilightLine',
    index: 9,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      context.elementalDamageType == Stats.Wind_DMG && c.WIND_DMG_BOOST.buff(0.10, Source.EagleOfTwilightLine)
    },
  },
  ThiefOfShootingMeteor: {
    key: 'ThiefOfShootingMeteor',
    index: 10,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.BE.buff(0.16, Source.ThiefOfShootingMeteor)
    },
    p4c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.BE.buff(0.16, Source.ThiefOfShootingMeteor)
    },
  },
  WastelanderOfBanditryDesert: {
    key: 'WastelanderOfBanditryDesert',
    index: 11,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      context.elementalDamageType == Stats.Imaginary_DMG && c.IMAGINARY_DMG_BOOST.buff(0.10, Source.WastelanderOfBanditryDesert)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      x.CD.buff(0.10 * (setConditionals.valueWastelanderOfBanditryDesert == 2 ? 1 : 0), Source.WastelanderOfBanditryDesert)
      if (setConditionals.valueWastelanderOfBanditryDesert > 0) {
        x.CR.buff(0.10, Source.WastelanderOfBanditryDesert)
      }
    },
  },
  LongevousDisciple: {
    key: 'LongevousDisciple',
    index: 12,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.HP_P.buff(0.12, Source.LongevousDisciple)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      x.CR.buff(0.08 * setConditionals.valueLongevousDisciple, Source.LongevousDisciple)
    },
  },
  MessengerTraversingHackerspace: {
    key: 'MessengerTraversingHackerspace',
    index: 13,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.SPD_P.buff(0.06, Source.MessengerTraversingHackerspace)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledMessengerTraversingHackerspace) {
        x.SPD_P.buffTeam(0.12, Source.MessengerTraversingHackerspace)
      }
    },
  },
  TheAshblazingGrandDuke: {
    key: 'TheAshblazingGrandDuke',
    index: 14,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
    p2x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      buffAbilityDmg(x, FUA_DMG_TYPE, 0.20, Source.TheAshblazingGrandDuke)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      x.ATK_P.buff(0.06 * setConditionals.valueTheAshblazingGrandDuke, Source.TheAshblazingGrandDuke)
    },
  },
  PrisonerInDeepConfinement: {
    key: 'PrisonerInDeepConfinement',
    index: 15,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ATK_P.buff(0.12, Source.PrisonerInDeepConfinement)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      x.DEF_PEN.buff(0.06 * setConditionals.valuePrisonerInDeepConfinement, Source.PrisonerInDeepConfinement)
    },
  },
  PioneerDiverOfDeadWaters: {
    key: 'PioneerDiverOfDeadWaters',
    index: 16,
    p2x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.valuePioneerDiverOfDeadWaters >= 0) {
        x.ELEMENTAL_DMG.buff(0.12, Source.PioneerDiverOfDeadWaters)
      }
    },
    p4c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CR.buff(0.04, Source.PioneerDiverOfDeadWaters)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      x.CD.buff(pioneerSetIndexToCd[setConditionals.valuePioneerDiverOfDeadWaters], Source.PioneerDiverOfDeadWaters)
      if (setConditionals.valuePioneerDiverOfDeadWaters > 2) {
        x.CR.buff(0.04, Source.PioneerDiverOfDeadWaters)
      }
    },
  },
  WatchmakerMasterOfDreamMachinations: {
    key: 'WatchmakerMasterOfDreamMachinations',
    index: 17,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.BE.buff(0.16, Source.WatchmakerMasterOfDreamMachinations)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledWatchmakerMasterOfDreamMachinations) {
        x.BE.buffTeam(0.30, Source.WatchmakerMasterOfDreamMachinations)
      }
    },
  },
  IronCavalryAgainstTheScourge: {
    key: 'IronCavalryAgainstTheScourge',
    index: 18,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.BE.buff(0.16, Source.IronCavalryAgainstTheScourge)
    },
  },
  TheWindSoaringValorous: {
    key: 'TheWindSoaringValorous',
    index: 19,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ATK_P.buff(0.12, Source.TheWindSoaringValorous)
    },
    p4c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CR.buff(0.06, Source.TheWindSoaringValorous)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledTheWindSoaringValorous) {
        buffAbilityDmg(x, ULT_DMG_TYPE, 0.36, Source.TheWindSoaringValorous)
      }
    },
  },
  SacerdosRelivedOrdeal: {
    key: 'SacerdosRelivedOrdeal',
    index: 20,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.SPD_P.buff(0.06, Source.SacerdosRelivedOrdeal)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      x.CD.buff(0.18 * setConditionals.valueSacerdosRelivedOrdeal, Source.SacerdosRelivedOrdeal)
    },
  },
  ScholarLostInErudition: {
    key: 'ScholarLostInErudition',
    index: 21,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CR.buff(0.08, Source.ScholarLostInErudition)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      buffAbilityDmg(x, ULT_DMG_TYPE | SKILL_DMG_TYPE, 0.20, Source.ScholarLostInErudition)
      if (setConditionals.enabledScholarLostInErudition) {
        buffAbilityDmg(x, SKILL_DMG_TYPE, 0.25, Source.ScholarLostInErudition)
      }
    },
  },
  HeroOfTriumphantSong: {
    key: 'HeroOfTriumphantSong',
    index: 22,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ATK_P.buff(0.12, Source.HeroOfTriumphantSong)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledHeroOfTriumphantSong) {
        x.SPD_P.buff(0.06, Source.HeroOfTriumphantSong)
        x.CD.buffDual(0.30, Source.HeroOfTriumphantSong)
      }
    },
  },
  PoetOfMourningCollapse: {
    key: 'PoetOfMourningCollapse',
    index: 23,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      context.elementalDamageType == Stats.Quantum_DMG && c.QUANTUM_DMG_BOOST.buff(0.10, Source.PoetOfMourningCollapse)
    },
    p4c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.SPD_P.buff(-0.08, Source.PoetOfMourningCollapse)
    },
    p4x: (x: ComputedStatsArray, context: OptimizerContext, setConditionals: SetConditional) => {
      x.CR.buffBaseDual((x.c.a[Key.SPD] < 110 ? 0.20 : 0) + (x.c.a[Key.SPD] < 95 ? 0.12 : 0), Source.PoetOfMourningCollapse)
    },
  },
}

export const SetsConfig = { ...RelicSetsConfig, ...OrnamentSetsConfig }

const pioneerSetIndexToCd: Record<number, number> = {
  [-1]: 0,
  0: 0,
  1: 0.08,
  2: 0.12,
  3: 0.16,
  4: 0.24,
}
