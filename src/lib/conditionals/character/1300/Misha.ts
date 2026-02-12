import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import {
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const MishaEntities = createEnum('Misha')
export const MishaAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Misha')
  const { basic, skill, ult } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1312')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  let ultStackScaling = ult(e, 0.60, 0.65)
  ultStackScaling += e >= 4 ? 0.06 : 0

  const defaults = {
    ultHitsOnTarget: 10,
    enemyFrozen: true,
    e2DefReduction: true,
    e6UltDmgBoost: true,
  }

  const teammateDefaults = {
    e2DefReduction: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultHitsOnTarget: {
      id: 'ultHitsOnTarget',
      formItem: 'slider',
      text: t('Content.ultHitsOnTarget.text'),
      content: t('Content.ultHitsOnTarget.content', { ultStackScaling: TsUtils.precisionRound(100 * ultStackScaling) }),
      min: 1,
      max: 10,
    },
    enemyFrozen: {
      id: 'enemyFrozen',
      formItem: 'switch',
      text: t('Content.enemyFrozen.text'),
      content: t('Content.enemyFrozen.content'),
    },
    e2DefReduction: {
      id: 'e2DefReduction',
      formItem: 'switch',
      text: t('Content.e2DefReduction.text'),
      content: t('Content.e2DefReduction.content'),
      disabled: e < 2,
    },
    e6UltDmgBoost: {
      id: 'e6UltDmgBoost',
      formItem: 'switch',
      text: t('Content.e6UltDmgBoost.text'),
      content: t('Content.e6UltDmgBoost.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e2DefReduction: content.e2DefReduction,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    // Entity declarations
    entityDeclaration: () => Object.values(MishaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [MishaEntities.Misha]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    // Action declarations
    actionDeclaration: () => Object.values(MishaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate ult scaling from hit count
      const ultScaling = ultStackScaling * r.ultHitsOnTarget
      const ultToughness = 10 + 5 * (r.ultHitsOnTarget - 1)

      return {
        [MishaAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [MishaAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Ice)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [MishaAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Ice)
              .atkScaling(ultScaling)
              .toughnessDmg(ultToughness)
              .build(),
          ],
        },
        [MishaAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Trace: CD buff when enemy is frozen
      x.buff(StatKey.CD, (r.enemyFrozen) ? 0.30 : 0, x.source(SOURCE_TRACE))

      // E6: Ice DMG boost
      x.buff(AKey.ICE_DMG_BOOST, (e >= 6 && r.e6UltDmgBoost) ? 0.30 : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // E2: Team DEF reduction
      x.buff(StatKey.DEF_PEN, (e >= 2 && m.e2DefReduction) ? 0.16 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
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
