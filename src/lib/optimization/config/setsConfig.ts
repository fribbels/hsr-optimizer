import {
  Sets,
  SetsOrnaments,
  SetsRelics,
  Stats,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { Key } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  OutputTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'

export type SetsDefinition = {
  key: keyof typeof Sets,
  index: number,
  // Basic
  p2c?: (c: BasicStatsArray, context: OptimizerContext) => void,
  p4c?: (c: BasicStatsArray, context: OptimizerContext) => void,
  // Combat
  p2x?: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => void,
  p4x?: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => void,
  // Terminal
  p2t?: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => void,
  p4t?: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => void,
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
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledCelestialDifferentiator && x.c.a[Key.CD] >= 1.20) {
        x.buff(StatKey.CR, 0.60, x.source(Source.CelestialDifferentiator))
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
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledPenaconyLandOfTheDreams) {
        x.buff(StatKey.DMG_BOOST, 0.10, x.targets(TargetTag.MemospritesOnly).source(Source.PenaconyLandOfTheDreams))
      }
    },
  },
  SigoniaTheUnclaimedDesolation: {
    key: 'SigoniaTheUnclaimedDesolation',
    index: 12,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CR.buff(0.04, Source.SigoniaTheUnclaimedDesolation)
    },
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.CD, 0.04 * setConditionals.valueSigoniaTheUnclaimedDesolation, x.source(Source.SigoniaTheUnclaimedDesolation))
    },
  },
  IzumoGenseiAndTakamaDivineRealm: {
    key: 'IzumoGenseiAndTakamaDivineRealm',
    index: 13,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ATK_P.buff(0.12, Source.IzumoGenseiAndTakamaDivineRealm)
    },
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledIzumoGenseiAndTakamaDivineRealm) {
        x.buff(StatKey.CR, 0.12, x.source(Source.IzumoGenseiAndTakamaDivineRealm))
      }
    },
  },
  DuranDynastyOfRunningWolves: {
    key: 'DuranDynastyOfRunningWolves',
    index: 14,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    },
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.DMG_BOOST, 0.05 * setConditionals.valueDuranDynastyOfRunningWolves, x.damageType(DamageTag.FUA).source(Source.DuranDynastyOfRunningWolves))
      if (setConditionals.valueDuranDynastyOfRunningWolves >= 5) {
        x.buff(StatKey.CD, 0.25, x.source(Source.DuranDynastyOfRunningWolves))
      }
    },
  },
  ForgeOfTheKalpagniLantern: {
    key: 'ForgeOfTheKalpagniLantern',
    index: 15,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.SPD_P.buff(0.06, Source.ForgeOfTheKalpagniLantern)
    },
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledForgeOfTheKalpagniLantern) {
        x.buff(StatKey.BE, 0.40, x.source(Source.ForgeOfTheKalpagniLantern))
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
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledTheWondrousBananAmusementPark) {
        x.buff(StatKey.CD, 0.32, x.source(Source.TheWondrousBananAmusementPark))
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
  ArcadiaOfWovenDreams: {
    key: 'ArcadiaOfWovenDreams',
    index: 20,
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(
        StatKey.DMG_BOOST,
        arcadiaSetIndexToDmg[setConditionals.valueArcadiaOfWovenDreams],
        x.targets(TargetTag.SelfAndMemosprite).source(Source.ArcadiaOfWovenDreams),
      )
    },
  },
  RevelryByTheSea: {
    key: 'RevelryByTheSea',
    index: 21,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ATK_P.buff(0.12, Source.RevelryByTheSea)
    },
  },
  AmphoreusTheEternalLand: {
    key: 'AmphoreusTheEternalLand',
    index: 22,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CR.buff(0.08, Source.AmphoreusTheEternalLand)
    },
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (x.getActionValueByIndex(StatKey.MEMOSPRITE, SELF_ENTITY_INDEX) > 0 && setConditionals.enabledAmphoreusTheEternalLand) {
        x.buff(StatKey.SPD_P, 0.08, x.targets(TargetTag.FullTeam).source(Source.AmphoreusTheEternalLand))
      }
    },
  },
  TengokuLivestream: {
    key: 'TengokuLivestream',
    index: 23,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CD.buff(0.16, Source.TengokuLivestream)
    },
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledTengokuLivestream) {
        x.buff(StatKey.CD, 0.32, x.source(Source.TengokuLivestream))
      }
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
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.DMG_BOOST, 0.10, x.damageType(DamageTag.BASIC).source(Source.MusketeerOfWildWheat))
    },
  },
  KnightOfPurityPalace: {
    key: 'KnightOfPurityPalace',
    index: 2,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.DEF_P.buff(0.15, Source.KnightOfPurityPalace)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.DMG_BOOST, 0.20, x.outputType(OutputTag.SHIELD).source(Source.KnightOfPurityPalace))
    },
  },
  HunterOfGlacialForest: {
    key: 'HunterOfGlacialForest',
    index: 3,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      if (context.elementalDamageType == Stats.Ice_DMG) {
        c.ICE_DMG_BOOST.buff(0.10, Source.HunterOfGlacialForest)
      }
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledHunterOfGlacialForest) {
        x.buff(StatKey.CD, 0.25, x.source(Source.HunterOfGlacialForest))
      }
    },
  },
  ChampionOfStreetwiseBoxing: {
    key: 'ChampionOfStreetwiseBoxing',
    index: 4,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      if (context.elementalDamageType == Stats.Physical_DMG) {
        c.PHYSICAL_DMG_BOOST.buff(0.10, Source.ChampionOfStreetwiseBoxing)
      }
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.ATK_P, 0.05 * setConditionals.valueChampionOfStreetwiseBoxing, x.source(Source.ChampionOfStreetwiseBoxing))
    },
  },
  GuardOfWutheringSnow: {
    key: 'GuardOfWutheringSnow',
    index: 5,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    },
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.multiplicativeComplement(StatKey.DMG_RED, 0.08, x.source(Source.GuardOfWutheringSnow))
    },
  },
  FiresmithOfLavaForging: {
    key: 'FiresmithOfLavaForging',
    index: 6,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      if (context.elementalDamageType == Stats.Fire_DMG) {
        c.FIRE_DMG_BOOST.buff(0.10, Source.FiresmithOfLavaForging)
      }
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.DMG_BOOST, 0.12, x.damageType(DamageTag.SKILL).source(Source.FiresmithOfLavaForging))
      if (setConditionals.enabledFiresmithOfLavaForging) {
        x.buff(StatKey.FIRE_DMG_BOOST, 0.12, x.source(Source.FiresmithOfLavaForging))
      }
    },
  },
  GeniusOfBrilliantStars: {
    key: 'GeniusOfBrilliantStars',
    index: 7,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      if (context.elementalDamageType == Stats.Quantum_DMG) {
        c.QUANTUM_DMG_BOOST.buff(0.10, Source.GeniusOfBrilliantStars)
      }
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.DEF_PEN, setConditionals.enabledGeniusOfBrilliantStars ? 0.20 : 0.10, x.source(Source.GeniusOfBrilliantStars))
    },
  },
  BandOfSizzlingThunder: {
    key: 'BandOfSizzlingThunder',
    index: 8,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      if (context.elementalDamageType == Stats.Lightning_DMG) {
        c.LIGHTNING_DMG_BOOST.buff(0.10, Source.BandOfSizzlingThunder)
      }
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledBandOfSizzlingThunder) {
        x.buff(StatKey.ATK_P, 0.20, x.source(Source.BandOfSizzlingThunder))
      }
    },
  },
  EagleOfTwilightLine: {
    key: 'EagleOfTwilightLine',
    index: 9,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      if (context.elementalDamageType == Stats.Wind_DMG) {
        c.WIND_DMG_BOOST.buff(0.10, Source.EagleOfTwilightLine)
      }
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
      if (context.elementalDamageType == Stats.Imaginary_DMG) {
        c.IMAGINARY_DMG_BOOST.buff(0.10, Source.WastelanderOfBanditryDesert)
      }
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.CD_BOOST, 0.20 * (setConditionals.valueWastelanderOfBanditryDesert == 2 ? 1 : 0), x.source(Source.WastelanderOfBanditryDesert))
      if (setConditionals.valueWastelanderOfBanditryDesert > 0) {
        x.buff(StatKey.CR_BOOST, 0.10, x.source(Source.WastelanderOfBanditryDesert))
      }
    },
  },
  LongevousDisciple: {
    key: 'LongevousDisciple',
    index: 12,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.HP_P.buff(0.12, Source.LongevousDisciple)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.CR, 0.08 * setConditionals.valueLongevousDisciple, x.source(Source.LongevousDisciple))
    },
  },
  MessengerTraversingHackerspace: {
    key: 'MessengerTraversingHackerspace',
    index: 13,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.SPD_P.buff(0.06, Source.MessengerTraversingHackerspace)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledMessengerTraversingHackerspace) {
        x.buff(StatKey.SPD_P, 0.12, x.targets(TargetTag.FullTeam).source(Source.MessengerTraversingHackerspace))
      }
    },
  },
  TheAshblazingGrandDuke: {
    key: 'TheAshblazingGrandDuke',
    index: 14,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    },
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.DMG_BOOST, 0.20, x.damageType(DamageTag.FUA).source(Source.TheAshblazingGrandDuke))
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.ATK_P, 0.06 * setConditionals.valueTheAshblazingGrandDuke, x.source(Source.TheAshblazingGrandDuke))
    },
  },
  PrisonerInDeepConfinement: {
    key: 'PrisonerInDeepConfinement',
    index: 15,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ATK_P.buff(0.12, Source.PrisonerInDeepConfinement)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.DEF_PEN, 0.06 * setConditionals.valuePrisonerInDeepConfinement, x.source(Source.PrisonerInDeepConfinement))
    },
  },
  PioneerDiverOfDeadWaters: {
    key: 'PioneerDiverOfDeadWaters',
    index: 16,
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.valuePioneerDiverOfDeadWaters >= 0) {
        x.buff(StatKey.DMG_BOOST, 0.12, x.source(Source.PioneerDiverOfDeadWaters))
      }
    },
    p4c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CR.buff(0.04, Source.PioneerDiverOfDeadWaters)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.CD_BOOST, pioneerSetIndexToCd[setConditionals.valuePioneerDiverOfDeadWaters], x.source(Source.PioneerDiverOfDeadWaters))
      if (setConditionals.valuePioneerDiverOfDeadWaters > 2) {
        x.buff(StatKey.CR, 0.04, x.source(Source.PioneerDiverOfDeadWaters))
      }
    },
  },
  WatchmakerMasterOfDreamMachinations: {
    key: 'WatchmakerMasterOfDreamMachinations',
    index: 17,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.BE.buff(0.16, Source.WatchmakerMasterOfDreamMachinations)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledWatchmakerMasterOfDreamMachinations) {
        x.buff(StatKey.BE, 0.30, x.targets(TargetTag.FullTeam).source(Source.WatchmakerMasterOfDreamMachinations))
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
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledTheWindSoaringValorous) {
        x.buff(StatKey.DMG_BOOST, 0.36, x.damageType(DamageTag.ULT).source(Source.TheWindSoaringValorous))
      }
    },
  },
  SacerdosRelivedOrdeal: {
    key: 'SacerdosRelivedOrdeal',
    index: 20,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.SPD_P.buff(0.06, Source.SacerdosRelivedOrdeal)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.CD, 0.18 * setConditionals.valueSacerdosRelivedOrdeal, x.source(Source.SacerdosRelivedOrdeal))
    },
  },
  ScholarLostInErudition: {
    key: 'ScholarLostInErudition',
    index: 21,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CR.buff(0.08, Source.ScholarLostInErudition)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.DMG_BOOST, 0.20, x.damageType(DamageTag.ULT | DamageTag.SKILL).source(Source.ScholarLostInErudition))
      if (setConditionals.enabledScholarLostInErudition) {
        x.buff(StatKey.DMG_BOOST, 0.25, x.damageType(DamageTag.SKILL).source(Source.ScholarLostInErudition))
      }
    },
  },
  HeroOfTriumphantSong: {
    key: 'HeroOfTriumphantSong',
    index: 22,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.ATK_P.buff(0.12, Source.HeroOfTriumphantSong)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledHeroOfTriumphantSong) {
        x.buff(StatKey.SPD_P, 0.06, x.source(Source.HeroOfTriumphantSong))
        x.buff(StatKey.CD, 0.30, x.targets(TargetTag.SelfAndMemosprite).source(Source.HeroOfTriumphantSong))
      }
    },
  },
  PoetOfMourningCollapse: {
    key: 'PoetOfMourningCollapse',
    index: 23,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      if (context.elementalDamageType == Stats.Quantum_DMG) {
        c.QUANTUM_DMG_BOOST.buff(0.10, Source.PoetOfMourningCollapse)
      }
    },
    p4c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.SPD_P.buff(-0.08, Source.PoetOfMourningCollapse)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      const spd = x.c.a[Key.SPD]
      x.buff(StatKey.CR, (spd < 110 ? 0.20 : 0) + (spd < 95 ? 0.12 : 0), x.targets(TargetTag.SelfAndMemosprite).source(Source.PoetOfMourningCollapse))
    },
  },
  WarriorGoddessOfSunAndThunder: {
    key: 'WarriorGoddessOfSunAndThunder',
    index: 24,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.SPD_P.buff(0.06, Source.WarriorGoddessOfSunAndThunder)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledWarriorGoddessOfSunAndThunder) {
        x.buff(StatKey.SPD_P, 0.06, x.source(Source.WarriorGoddessOfSunAndThunder))
        x.buff(StatKey.CD, 0.15, x.targets(TargetTag.FullTeam).source(Source.WarriorGoddessOfSunAndThunder))
      }
    },
  },
  WavestriderCaptain: {
    key: 'WavestriderCaptain',
    index: 25,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CD.buff(0.16, Source.WavestriderCaptain)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledWavestriderCaptain) {
        x.buff(StatKey.ATK_P, 0.48, x.source(Source.WavestriderCaptain))
      }
    },
  },
  WorldRemakingDeliverer: {
    key: 'WorldRemakingDeliverer',
    index: 26,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CR.buff(0.08, Source.WorldRemakingDeliverer)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      if (setConditionals.enabledWorldRemakingDeliverer) {
        x.buff(StatKey.HP_P, 0.24, x.targets(TargetTag.SelfAndMemosprite).source(Source.WorldRemakingDeliverer))
        x.buff(StatKey.DMG_BOOST, 0.15, x.targets(TargetTag.FullTeam).source(Source.WorldRemakingDeliverer))
      }
    },
  },
  SelfEnshroudedRecluse: {
    key: 'SelfEnshroudedRecluse',
    index: 27,
    p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.DMG_BOOST, 0.10, x.outputType(OutputTag.SHIELD).source(Source.SelfEnshroudedRecluse))
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
      x.buff(StatKey.DMG_BOOST, 0.12, x.outputType(OutputTag.SHIELD).source(Source.SelfEnshroudedRecluse))
      if (setConditionals.enabledSelfEnshroudedRecluse) {
        x.buff(StatKey.CD, 0.15, x.targets(TargetTag.FullTeam).source(Source.SelfEnshroudedRecluse))
      }
    },
  },
  EverGloriousMagicalGirl: {
    key: 'EverGloriousMagicalGirl',
    index: 28,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.CD.buff(0.16, Source.EverGloriousMagicalGirl)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    },
  },
  DivinerOfDistantReach: {
    key: 'DivinerOfDistantReach',
    index: 29,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {
      c.SPD_P.buff(0.06, Source.DivinerOfDistantReach)
    },
    p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    },
  },
}

export const SetsConfig = { ...RelicSetsConfig, ...OrnamentSetsConfig }

export type SetKeyType = keyof typeof SetsConfig

export const SetKeys: Record<SetKeyType, SetKeyType> = Object.fromEntries(
  Object.keys(SetsConfig).map((key) => [key, key]),
) as Record<SetKeyType, SetKeyType>

const pioneerSetIndexToCd: Record<number, number> = {
  [-1]: 0,
  0: 0,
  1: 0.08,
  2: 0.12,
  3: 0.16,
  4: 0.24,
}

const arcadiaSetIndexToDmg: Record<number, number> = {
  1: 0.36,
  2: 0.24,
  3: 0.12,
  4: 0.00,
  5: 0.09,
  6: 0.18,
  7: 0.27,
  8: 0.36,
}
