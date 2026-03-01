import { Parts, Stats } from 'lib/constants/constants'
import { SortOption } from 'lib/optimization/sortOptions'
import { CharacterId, Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { ScoringMetadata } from 'types/metadata'
import {
  AbilityEidolon,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const AshveilEntities = createEnum('Ashveil')
export const AshveilAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Ashveil')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  // const {
  //   SOURCE_BASIC,
  //   SOURCE_SKILL,
  //   SOURCE_ULT,
  //   SOURCE_TALENT,
  //   SOURCE_TECHNIQUE,
  //   SOURCE_TRACE,
  //   SOURCE_MEMO,
  //   SOURCE_E1,
  //   SOURCE_E2,
  //   SOURCE_E4,
  //   SOURCE_E6,
  // } = Source.character(ASHVEIL)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 0, 0)

  const defaults = {}

  const teammateDefaults = {}

  const content: ContentDefinition<typeof defaults> = {}

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {}

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(AshveilEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AshveilEntities.Ashveil]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(AshveilAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [AshveilAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AshveilAbilities.SKILL]: {
          hits: [],
        },
        [AshveilAbilities.ULT]: {
          hits: [],
        },
        [AshveilAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return ''
    },
  }
}


const scoring: ScoringMetadata = {
  stats: { [Stats.ATK]: 0, [Stats.ATK_P]: 0, [Stats.DEF]: 0, [Stats.DEF_P]: 0, [Stats.HP]: 0, [Stats.HP_P]: 0, [Stats.SPD]: 0, [Stats.CR]: 0, [Stats.CD]: 0, [Stats.EHR]: 0, [Stats.RES]: 0, [Stats.BE]: 0 },
  parts: { [Parts.Body]: [], [Parts.Feet]: [], [Parts.PlanarSphere]: [], [Parts.LinkRope]: [] },
  sets: {},
  presets: [],
  sortOption: SortOption.BASIC,
  hiddenColumns: [],
}

const display = {
  showcaseColor: '#999999',
}

export const Ashveil: CharacterConfig = {
  id: '1504' as CharacterId,
  info: {},
  conditionals,
  scoring,
  display,
}
