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
import { ComboType } from 'lib/optimization/rotation/comboType'
import { SortOption } from 'lib/optimization/sortOptions'
import { setConfigRegistry } from 'lib/sets/setConfigRegistry'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import { clone } from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import {
  type Form,
  type Teammate,
} from 'types/form'

// FIXME HIGH

function getDefaultWeights(characterId?: CharacterId): Form['weights'] {
  if (characterId) {
    const scoringMetadata = clone(getScoringMetadata(characterId))
    scoringMetadata.stats.minWeightedRolls = 0
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
    minWeightedRolls: 0,
  }
}

export function getDefaultForm(initialCharacter: { id: CharacterId }) {
  // TODO: Clean this up
  const scoringMetadata = getGameMetadata().characters[initialCharacter?.id]?.scoringMetadata
  const parts = scoringMetadata?.parts || {}
  const weights = scoringMetadata?.stats || getDefaultWeights()

  const combatBuffs = {} as Record<typeof CombatBuffs[keyof typeof CombatBuffs]['key'], number>
  Object.values(CombatBuffs).forEach((x) => {
    combatBuffs[x.key] = 0
  })

  const defaultForm: Partial<Form> = clone({
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
    comboDot: 0,
    deprioritizeBuffs: false,
    ...defaultEnemyOptions(),
  })

  applySetConditionalPresets(defaultForm as Form)
  applyScoringMetadataPresets(defaultForm as Form)

  if (scoringMetadata?.simulation?.comboTurnAbilities) {
    defaultForm.comboTurnAbilities = [...scoringMetadata.simulation.comboTurnAbilities]
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

function defaultEnemyOptions() {
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
