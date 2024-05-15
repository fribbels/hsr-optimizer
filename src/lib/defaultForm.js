import { CombatBuffs, Constants, DEFAULT_STAT_DISPLAY, Sets } from './constants.ts'
import DB from 'lib/db'
import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'
import { Utils } from './utils.js'

export function getDefaultForm(initialCharacter) {
  // TODO: Clean this up
  const scoringMetadata = DB.getMetadata().characters[initialCharacter?.id]?.scoringMetadata
  const parts = scoringMetadata?.parts || {}
  const weights = scoringMetadata?.stats || {
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
  }

  const combatBuffs = {}
  Object.values(CombatBuffs).map(x => combatBuffs[x.key] = 0)

  const defaultForm = Utils.clone({
    characterId: initialCharacter?.id,
    mainBody: parts[Constants.Parts.Body] || [],
    mainFeet: parts[Constants.Parts.Feet] || [],
    mainPlanarSphere: parts[Constants.Parts.PlanarSphere] || [],
    mainLinkRope: parts[Constants.Parts.LinkRope] || [],
    relicSets: [],
    ornamentSets: [],
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
    enemyElementalWeak: true,
    enemyWeaknessBroken: false,
    mainHead: [],
    mainHands: [],
    statDisplay: DEFAULT_STAT_DISPLAY,
    statSim: defaultStatSim,
    weights: weights,
    setConditionals: defaultSetConditionals,
    teammate0: defaultTeammate(),
    teammate1: defaultTeammate(),
    teammate2: defaultTeammate(),
    resultSort: scoringMetadata?.sortOption.key,
    resultLimit: 100000,
    combatBuffs: combatBuffs,
    combo: {
      BASIC: 0,
      SKILL: 0,
      ULT: 0,
      FUA: 0,
      DOT: 0,
      BREAK: 0,
    }
  })

  defaultForm.topPercent = 100

  // Disable elemental conditions by default if the character is not of the same element
  const element = DB.getMetadata().characters[initialCharacter?.id]?.element
  if (element) {
    defaultForm.setConditionals[Sets.GeniusOfBrilliantStars][1] = element == 'Quantum'
    defaultForm.setConditionals[Sets.ForgeOfTheKalpagniLantern][1] = element == 'Fire'
  }

  // TODO: very gross, dedupe
  if (scoringMetadata?.presets) {
    const presets = scoringMetadata.presets || []
    for (const applyPreset of presets) {
      applyPreset(defaultForm)
    }
  }

  return defaultForm
}

export function defaultTeammate() {
  return {
    characterId: null,
    characterEidolon: 0,
    lightConeSuperimposition: 1,
  }
}

export const defaultStatSim = {
  simType: StatSimTypes.Disabled,
  simulations: []
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
  [Constants.Sets.IronCavalryAgainstScourge]: [undefined, true],
  [Constants.Sets.TheWindSoaringValorous]: [undefined, 0],

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
  [Constants.Sets.DuranDynastyOfRunningWolves]: [undefined, 5],
  [Constants.Sets.ForgeOfTheKalpagniLantern]: [undefined, false],
}
