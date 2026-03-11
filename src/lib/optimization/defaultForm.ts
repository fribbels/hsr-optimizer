import {
  applyScoringMetadataPresets,
  applySetConditionalPresets,
} from 'lib/conditionals/evaluation/applyPresets'
import {
  CombatBuffs,
  Constants,
  DEFAULT_MEMO_DISPLAY,
  DEFAULT_STAT_DISPLAY,
  Sets,
} from 'lib/constants/constants'
import { ComboType } from 'lib/optimization/rotation/comboStateTransform'
import { SortOption } from 'lib/optimization/sortOptions'
import { setConfigRegistry } from 'lib/sets/setConfigRegistry'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'
import {
  Form,
  Teammate,
} from 'types/form'

// FIXME HIGH

export function getDefaultWeights(characterId?: CharacterId): Form['weights'] {
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

export function getDefaultForm(initialCharacter: { id: CharacterId }) {
  // TODO: Clean this up
  const scoringMetadata = DB.getMetadata().characters[initialCharacter?.id]?.scoringMetadata
  const parts = scoringMetadata?.parts || {}
  const weights = scoringMetadata?.stats || getDefaultWeights()

  const combatBuffs = {} as Record<typeof CombatBuffs[keyof typeof CombatBuffs]['key'], number>
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
    resultSort: scoringMetadata?.simulation ? SortOption.COMBO.key : scoringMetadata?.sortOption.key,
    resultsLimit: 1024,
    combatBuffs: combatBuffs,
    comboType: ComboType.SIMPLE,
    combo: {
      BASIC: 0,
      SKILL: 0,
      ULT: 0,
      FUA: 0,
      DOT: 0,
      BREAK: 0,
    },
    comboStateJson: '{}',
    comboPreprocessor: true,
    deprioritizeBuffs: false,
    ...defaultEnemyOptions(),
  })

  applySetConditionalPresets(defaultForm as Form)
  applyScoringMetadataPresets(defaultForm as Form)

  if (scoringMetadata?.simulation?.comboTurnAbilities) {
    defaultForm.comboTurnAbilities = scoringMetadata.simulation.comboTurnAbilities
    defaultForm.comboDot = scoringMetadata.simulation.comboDot
  }

  return defaultForm as Form
}

export function defaultTeammate() {
  const teammate: Partial<Teammate> = {
    characterId: undefined,
    characterEidolon: 0,
    lightCone: undefined,
    lightConeSuperimposition: 1,
    teamOrnamentSet: undefined,
    teamRelicSet: undefined,
  }
  return teammate
}

export function defaultEnemyOptions() {
  return {
    enemyLevel: 95,
    enemyCount: 1,
    enemyResistance: 0.2,
    enemyEffectResistance: 0.3,
    enemyMaxToughness: 360,
    enemyElementalWeak: true,
    enemyWeaknessBroken: false,
  }
}

function buildDefaultSetConditionals(): Record<Sets, [undefined, boolean | number]> {
  const result = {} as Record<Sets, [undefined, boolean | number]>
  for (const [id, config] of setConfigRegistry) {
    result[Sets[id]] = [undefined, config.display.defaultValue]
  }
  return result
}

export const defaultSetConditionals = buildDefaultSetConditionals()
