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
import { StatKey } from 'lib/optimization/engine/config/keys'
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

export const TrailblazerPreservationEntities = createEnum('TrailblazerPreservation')
export const TrailblazerPreservationAbilities = createEnum('BASIC', 'ULT', 'TALENT_SHIELD', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerPreservation')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('8004')

  const skillDamageReductionValue = skill(e, 0.50, 0.52)

  const basicAtkScaling = basic(e, 1.00, 1.10)
  const basicDefScaling = (e >= 1) ? 0.25 : 0
  const basicEnhancedAtkScaling = basic(e, 1.35, 1.463)
  const basicEnhancedDefScaling = (e >= 1) ? 0.50 : 0
  const ultAtkScaling = ult(e, 1.00, 1.10)
  const ultDefScaling = ult(e, 1.50, 1.65)

  const talentShieldScaling = talent(e, 0.06, 0.064)
  const talentShieldFlat = talent(e, 80, 89)

  const defaults = {
    enhancedBasic: true,
    skillActive: true,
    shieldActive: true,
    e6DefStacks: 3,
  }

  const teammateDefaults = {
    skillActive: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: t('Content.enhancedBasic.text'),
      content: t('Content.enhancedBasic.content', { basicEnhancedAtkScaling: TsUtils.precisionRound(100 * basicEnhancedAtkScaling) }),
    },
    skillActive: {
      id: 'skillActive',
      formItem: 'switch',
      text: t('Content.skillActive.text'),
      content: t('Content.skillActive.content', { skillDamageReductionValue: TsUtils.precisionRound(100 * skillDamageReductionValue) }),
    },
    shieldActive: {
      id: 'shieldActive',
      formItem: 'switch',
      text: t('Content.shieldActive.text'),
      content: t('Content.shieldActive.content'),
    },
    e6DefStacks: {
      id: 'e6DefStacks',
      formItem: 'slider',
      text: t('Content.e6DefStacks.text'),
      content: t('Content.e6DefStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillActive: content.skillActive,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(TrailblazerPreservationEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [TrailblazerPreservationEntities.TrailblazerPreservation]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(TrailblazerPreservationAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const basicAtk = r.enhancedBasic ? basicEnhancedAtkScaling : basicAtkScaling
      const basicDef = r.enhancedBasic ? basicEnhancedDefScaling : basicDefScaling
      const basicToughness = r.enhancedBasic ? 20 : 10

      return {
        [TrailblazerPreservationAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicAtk)
              .defScaling(basicDef)
              .toughnessDmg(basicToughness)
              .build(),
          ],
        },
        [TrailblazerPreservationAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling(ultAtkScaling)
              .defScaling(ultDefScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [TrailblazerPreservationAbilities.TALENT_SHIELD]: {
          hits: [
            HitDefinitionBuilder.shield()
              .defScaling(talentShieldScaling)
              .flatShield(talentShieldFlat)
              .build(),
          ],
        },
        [TrailblazerPreservationAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E6: DEF% stacks
      x.buff(StatKey.DEF_P, (e >= 6) ? r.e6DefStacks * 0.10 : 0, x.source(SOURCE_E6))

      // Trace: ATK% when shield active
      x.buff(StatKey.ATK_P, (r.shieldActive) ? 0.15 : 0, x.source(SOURCE_TRACE))

      // Skill: Damage reduction (self only)
      x.multiplicativeComplement(StatKey.DMG_RED, (r.skillActive) ? skillDamageReductionValue : 0, x.source(SOURCE_SKILL))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Trace: 15% damage reduction for all allies
      x.multiplicativeComplement(StatKey.DMG_RED, (m.skillActive) ? 0.15 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },


    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
