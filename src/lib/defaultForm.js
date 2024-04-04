import { Constants, DEFAULT_STAT_DISPLAY } from './constants.ts'
import DB from 'lib/db'

export function getDefaultForm(initialCharacter) {
  const metadata = DB.getMetadata().characters[initialCharacter]

  return {
    characterId: initialCharacter?.id,
    mainBody: [
    ],
    mainFeet: [
    ],
    mainPlanarSphere: [
    ],
    mainLinkRope: [
    ],
    relicSets: [
    ],
    ornamentSets: [
    ],
    characterLevel: 80,
    characterEidolon: 0,
    lightConeLevel: 80,
    lightConeSuperimposition: 1,
    predictMaxedMainStat: true,
    rankFilter: true,
    includeEquippedRelics: true,
    keepCurrentRelics: false,
    enhance: 9,
    grade: 5,
    enemyLevel: 95,
    enemyCount: 1,
    enemyResistance: 0.2,
    enemyMaxToughness: 360,
    mainHead: [],
    mainHands: [],
    statDisplay: DEFAULT_STAT_DISPLAY,
    weights: {
      [Constants.Stats.HP_P]: 1,
      [Constants.Stats.ATK_P]: 1,
      [Constants.Stats.DEF_P]: 1,
      [Constants.Stats.SPD_P]: 1,
      [Constants.Stats.HP]: 1,
      [Constants.Stats.ATK]: 1,
      [Constants.Stats.DEF]: 1,
      [Constants.Stats.SPD]: 1,
      [Constants.Stats.CD]: 1,
      [Constants.Stats.CR]: 1,
      [Constants.Stats.EHR]: 1,
      [Constants.Stats.RES]: 1,
      [Constants.Stats.BE]: 1,
      topPercent: 100,
    },
    setConditionals: defaultSetConditionals,
    teammate0: defaultTeammate(),
    teammate1: defaultTeammate(),
    teammate2: defaultTeammate(),
    resultSort: metadata?.scoringMetadata.sortOption.key,
    resultLimit: 100000,
  }
}

export function defaultTeammate() {
  return {
    characterId: null,
    characterEidolon: 0,
    lightConeSuperimposition: 1,
  }
}

export const defaultSetConditionals = {
  [Constants.Sets.PasserbyOfWanderingCloud]: [undefined, true],
  [Constants.Sets.MusketeerOfWildWheat]: [undefined, true],
  [Constants.Sets.KnightOfPurityPalace]: [undefined, true],
  [Constants.Sets.HunterOfGlacialForest]: [undefined, true],
  [Constants.Sets.ChampionOfStreetwiseBoxing]: [undefined, 5],
  [Constants.Sets.GuardOfWutheringSnow]: [undefined, true],
  [Constants.Sets.FiresmithOfLavaForging]: [undefined, true],
  [Constants.Sets.GeniusOfBrilliantStars]: [undefined, true],
  [Constants.Sets.BandOfSizzlingThunder]: [undefined, true],
  [Constants.Sets.EagleOfTwilightLine]: [undefined, true],
  [Constants.Sets.ThiefOfShootingMeteor]: [undefined, true],
  [Constants.Sets.WastelanderOfBanditryDesert]: [undefined, 1],
  [Constants.Sets.LongevousDisciple]: [undefined, 2],
  [Constants.Sets.MessengerTraversingHackerspace]: [undefined, false],
  [Constants.Sets.TheAshblazingGrandDuke]: [undefined, 0],
  [Constants.Sets.PrisonerInDeepConfinement]: [undefined, 0],
  [Constants.Sets.PioneerDiverOfDeadWaters]: [undefined, 2],
  [Constants.Sets.WatchmakerMasterOfDreamMachinations]: [undefined, false],
  [Constants.Sets.SpaceSealingStation]: [undefined, true],
  [Constants.Sets.FleetOfTheAgeless]: [undefined, true],
  [Constants.Sets.PanCosmicCommercialEnterprise]: [undefined, true],
  [Constants.Sets.BelobogOfTheArchitects]: [undefined, true],
  [Constants.Sets.CelestialDifferentiator]: [undefined, false],
  [Constants.Sets.InertSalsotto]: [undefined, true],
  [Constants.Sets.TaliaKingdomOfBanditry]: [undefined, true],
  [Constants.Sets.SprightlyVonwacq]: [undefined, true],
  [Constants.Sets.RutilantArena]: [undefined, true],
  [Constants.Sets.BrokenKeel]: [undefined, true],
  [Constants.Sets.FirmamentFrontlineGlamoth]: [undefined, true],
  [Constants.Sets.PenaconyLandOfTheDreams]: [undefined, true],
  [Constants.Sets.SigoniaTheUnclaimedDesolation]: [undefined, 4],
  [Constants.Sets.IzumoGenseiAndTakamaDivineRealm]: [undefined, true],
}
