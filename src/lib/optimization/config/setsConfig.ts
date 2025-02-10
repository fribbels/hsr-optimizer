import { SetsOrnaments, SetsRelics } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { OptimizerContext } from 'types/optimizer'

type SetsConfiguration = {
  index: number
  p2c?: (c: BasicStatsArray, context: OptimizerContext) => void
  p4c?: (c: BasicStatsArray, context: OptimizerContext) => void
  p2x?: (c: BasicStatsArray, context: OptimizerContext) => void
  p4x?: (c: BasicStatsArray, context: OptimizerContext) => void
}

export const OrnamentSetsConfig: Record<keyof typeof SetsOrnaments, SetsConfiguration> = {
  SpaceSealingStation: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.ATK.buff(0.12 * context.baseATK, Source.SpaceSealingStation),
  },
  FleetOfTheAgeless: {
    index: 1,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.HP.buff(0.12 * context.baseHP, Source.FleetOfTheAgeless),
  },
  PanCosmicCommercialEnterprise: {
    index: 2,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.EHR.buff(0.10, Source.PanCosmicCommercialEnterprise),
  },
  BelobogOfTheArchitects: {
    index: 3,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.DEF.buff(0.15 * context.baseDEF, Source.BelobogOfTheArchitects),
  },
  CelestialDifferentiator: {
    index: 4,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.CD.buff(0.16, Source.CelestialDifferentiator),
  },
  InertSalsotto: {
    index: 5,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.CR.buff(0.08, Source.InertSalsotto),
  },
  TaliaKingdomOfBanditry: {
    index: 6,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.BE.buff(0.16, Source.TaliaKingdomOfBanditry),
  },
  SprightlyVonwacq: {
    index: 7,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.ERR.buff(0.05, Source.SprightlyVonwacq),
  },
  RutilantArena: {
    index: 8,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.CR.buff(0.08, Source.RutilantArena),
  },
  BrokenKeel: {
    index: 9,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.RES.buff(0.10, Source.BrokenKeel),
  },
  FirmamentFrontlineGlamoth: {
    index: 10,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.ATK.buff(0.12 * context.baseATK, Source.FirmamentFrontlineGlamoth),
  },
  PenaconyLandOfTheDreams: {
    index: 11,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.ERR.buff(0.05, Source.PenaconyLandOfTheDreams),
  },
  SigoniaTheUnclaimedDesolation: {
    index: 12,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.CR.buff(0.04, Source.SigoniaTheUnclaimedDesolation),
  },
  IzumoGenseiAndTakamaDivineRealm: {
    index: 13,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.ATK.buff(0.12 * context.baseATK, Source.IzumoGenseiAndTakamaDivineRealm),
  },
  DuranDynastyOfRunningWolves: {
    index: 14,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
  },
  ForgeOfTheKalpagniLantern: {
    index: 15,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.SPD.buff(0.06 * context.baseSPD, Source.ForgeOfTheKalpagniLantern),
  },
  LushakaTheSunkenSeas: {
    index: 16,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.ERR.buff(0.05, Source.LushakaTheSunkenSeas),
  },
  TheWondrousBananAmusementPark: {
    index: 17,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.CD.buff(0.16, Source.TheWondrousBananAmusementPark),
  },
  BoneCollectionsSereneDemesne: {
    index: 18,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.HP.buff(0.12 * context.baseHP, Source.BoneCollectionsSereneDemesne),
  },
  GiantTreeOfRaptBrooding: {
    index: 19,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.SPD.buff(0.06 * context.baseSPD, Source.GiantTreeOfRaptBrooding),
  },
}

export const RelicSetsConfig: Record<keyof typeof SetsRelics, SetsConfiguration> = {
  PasserbyOfWanderingCloud: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.OHB.buff(0.10, Source.PasserbyOfWanderingCloud),
  },
  MusketeerOfWildWheat: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.ATK.buff(0.12 * context.baseATK, Source.MusketeerOfWildWheat),
    p4c: (c: BasicStatsArray, context: OptimizerContext) => c.SPD.buff(0.06 * context.baseSPD, Source.MusketeerOfWildWheat),
  },
  KnightOfPurityPalace: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.DEF.buff(0.15 * context.baseDEF, Source.KnightOfPurityPalace),
  },
  HunterOfGlacialForest: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
  },
  ChampionOfStreetwiseBoxing: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
  },
  GuardOfWutheringSnow: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
  },
  FiresmithOfLavaForging: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
  },
  GeniusOfBrilliantStars: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
  },
  BandOfSizzlingThunder: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
  },
  EagleOfTwilightLine: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
  },
  ThiefOfShootingMeteor: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.BE.buff(0.16, Source.ThiefOfShootingMeteor),
    p4c: (c: BasicStatsArray, context: OptimizerContext) => c.BE.buff(0.16, Source.ThiefOfShootingMeteor),
  },
  WastelanderOfBanditryDesert: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
  },
  LongevousDisciple: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.HP.buff(0.12 * context.baseHP, Source.LongevousDisciple),
  },
  MessengerTraversingHackerspace: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.SPD.buff(0.06 * context.baseSPD, Source.MessengerTraversingHackerspace),
  },
  TheAshblazingGrandDuke: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => {},
  },
  PrisonerInDeepConfinement: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.ATK.buff(0.12 * context.baseATK, Source.PrisonerInDeepConfinement),
  },
  PioneerDiverOfDeadWaters: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.CR.buff(0.04, Source.PioneerDiverOfDeadWaters),
  },
  WatchmakerMasterOfDreamMachinations: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.BE.buff(0.16, Source.WatchmakerMasterOfDreamMachinations),
  },
  IronCavalryAgainstTheScourge: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.BE.buff(0.16, Source.IronCavalryAgainstTheScourge),
  },
  TheWindSoaringValorous: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.ATK.buff(0.12 * context.baseATK, Source.TheWindSoaringValorous),
    p4c: (c: BasicStatsArray, context: OptimizerContext) => c.CR.buff(0.06, Source.TheWindSoaringValorous),
  },
  SacerdosRelivedOrdeal: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.SPD.buff(0.06 * context.baseSPD, Source.SacerdosRelivedOrdeal),
  },
  ScholarLostInErudition: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.CR.buff(0.08, Source.ScholarLostInErudition),
  },
  HeroOfTriumphantSong: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.ATK.buff(0.12 * context.baseATK, Source.HeroOfTriumphantSong),
  },
  PoetOfMourningCollapse: {
    index: 0,
    p2c: (c: BasicStatsArray, context: OptimizerContext) => c.SPD.buff(-0.08 * context.baseSPD, Source.PoetOfMourningCollapse),
  },
}

