import { CombatBuffs, Constants, DEFAULT_MEMO_DISPLAY, DEFAULT_STAT_DISPLAY, Sets } from 'lib/constants/constants'
import DB from 'lib/state/db'
import { applyScoringMetadataPresets, applySetConditionalPresets } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { TsUtils } from 'lib/utils/TsUtils'
import { Form, Teammate } from 'types/form'

// FIXME HIGH

export function getDefaultWeights(characterId?: string) {
  if (characterId) {
    const scoringMetadata = TsUtils.clone(DB.getScoringMetadata(characterId))
    scoringMetadata.stats.headHands = 0
    scoringMetadata.stats.bodyFeet = 0
    scoringMetadata.stats.sphereRope = 0
    return scoringMetadata.stats
  }

  return {
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
    headHands: 0,
    bodyFeet: 0,
    sphereRope: 0,
  }
}

export function getDefaultForm(initialCharacter: { id: string }) {
  // TODO: Clean this up
  const scoringMetadata = DB.getMetadata().characters[initialCharacter?.id]?.scoringMetadata
  const parts = scoringMetadata?.parts || {}
  const weights = scoringMetadata?.stats || getDefaultWeights()

  const combatBuffs = {}
  Object.values(CombatBuffs).map((x) => combatBuffs[x.key] = 0)

  const defaultForm: Partial<Form> = TsUtils.clone({
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
    mainStatUpscaleLevel: 15,
    rankFilter: true,
    includeEquippedRelics: true,
    keepCurrentRelics: false,
    enhance: 9,
    grade: 5,
    mainHead: [],
    mainHands: [],
    statDisplay: DEFAULT_STAT_DISPLAY,
    memoDisplay: DEFAULT_MEMO_DISPLAY,
    weights: weights,
    setConditionals: defaultSetConditionals,
    teammate0: defaultTeammate() as Teammate,
    teammate1: defaultTeammate() as Teammate,
    teammate2: defaultTeammate() as Teammate,
    resultSort: scoringMetadata?.sortOption.key,
    resultsLimit: 1024,
    combatBuffs: combatBuffs,
    combo: {
      BASIC: 0,
      SKILL: 0,
      ULT: 0,
      FUA: 0,
      DOT: 0,
      BREAK: 0,
    },
    comboStateJson: '{}',
    ...defaultEnemyOptions(),
  })

  applySetConditionalPresets(defaultForm as Form)
  applyScoringMetadataPresets(defaultForm as Form)

  if (scoringMetadata?.simulation?.comboAbilities) {
    defaultForm.comboAbilities = scoringMetadata.simulation.comboAbilities
    defaultForm.comboDot = scoringMetadata.simulation.comboDot
    defaultForm.comboBreak = scoringMetadata.simulation.comboBreak
  }

  return defaultForm as Form
}

export function defaultTeammate() {
  const teammate: Partial<Teammate> = {
    characterId: undefined,
    characterEidolon: 0,
    lightCone: undefined,
    lightConeSuperimposition: 1,
  }
  return teammate
}

export function defaultEnemyOptions() {
  return {
    enemyLevel: 95,
    enemyCount: 1,
    enemyResistance: 0.2,
    enemyEffectResistance: 0.2,
    enemyMaxToughness: 360,
    enemyElementalWeak: true,
    enemyWeaknessBroken: false,
  }
}

export const defaultSetConditionals = {
  [Sets.PasserbyOfWanderingCloud]: [undefined, true],
  [Sets.MusketeerOfWildWheat]: [undefined, true],
  [Sets.KnightOfPurityPalace]: [undefined, true],
  [Sets.HunterOfGlacialForest]: [undefined, true],
  [Sets.ChampionOfStreetwiseBoxing]: [undefined, 5],
  [Sets.GuardOfWutheringSnow]: [undefined, true],
  [Sets.FiresmithOfLavaForging]: [undefined, true],
  [Sets.GeniusOfBrilliantStars]: [undefined, true],
  [Sets.BandOfSizzlingThunder]: [undefined, true],
  [Sets.EagleOfTwilightLine]: [undefined, true],
  [Sets.ThiefOfShootingMeteor]: [undefined, true],
  [Sets.WastelanderOfBanditryDesert]: [undefined, 1],
  [Sets.LongevousDisciple]: [undefined, 2],
  [Sets.MessengerTraversingHackerspace]: [undefined, false],
  [Sets.TheAshblazingGrandDuke]: [undefined, 0],
  [Sets.PrisonerInDeepConfinement]: [undefined, 0],
  [Sets.PioneerDiverOfDeadWaters]: [undefined, 2],
  [Sets.WatchmakerMasterOfDreamMachinations]: [undefined, false],
  [Sets.IronCavalryAgainstTheScourge]: [undefined, true],
  [Sets.TheWindSoaringValorous]: [undefined, false],
  [Sets.SacerdosRelivedOrdeal]: [undefined, 0],
  [Sets.ScholarLostInErudition]: [undefined, true],
  [Sets.HeroOfTriumphantSong]: [undefined, false],
  [Sets.PoetOfMourningCollapse]: [undefined, true],

  [Sets.SpaceSealingStation]: [undefined, true],
  [Sets.FleetOfTheAgeless]: [undefined, true],
  [Sets.PanCosmicCommercialEnterprise]: [undefined, true],
  [Sets.BelobogOfTheArchitects]: [undefined, true],
  [Sets.CelestialDifferentiator]: [undefined, false],
  [Sets.InertSalsotto]: [undefined, true],
  [Sets.TaliaKingdomOfBanditry]: [undefined, true],
  [Sets.SprightlyVonwacq]: [undefined, true],
  [Sets.RutilantArena]: [undefined, true],
  [Sets.BrokenKeel]: [undefined, true],
  [Sets.FirmamentFrontlineGlamoth]: [undefined, true],
  [Sets.PenaconyLandOfTheDreams]: [undefined, true],
  [Sets.SigoniaTheUnclaimedDesolation]: [undefined, 4],
  [Sets.IzumoGenseiAndTakamaDivineRealm]: [undefined, true],
  [Sets.DuranDynastyOfRunningWolves]: [undefined, 5],
  [Sets.ForgeOfTheKalpagniLantern]: [undefined, false],
  [Sets.LushakaTheSunkenSeas]: [undefined, false],
  [Sets.TheWondrousBananAmusementPark]: [undefined, false],
  [Sets.BoneCollectionsSereneDemesne]: [undefined, true],
  [Sets.GiantTreeOfRaptBrooding]: [undefined, true],
}
