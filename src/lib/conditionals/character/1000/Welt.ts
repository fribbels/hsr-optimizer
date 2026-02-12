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
import { ElementTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const WeltEntities = createEnum('Welt')
export const WeltAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Welt')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1004')

  const skillExtraHitsMax = (e >= 6) ? 3 : 2

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.72, 0.792)
  const ultScaling = ult(e, 1.50, 1.62)
  const talentScaling = talent(e, 0.60, 0.66)

  const content: ContentDefinition<typeof defaults> = {
    enemyDmgTakenDebuff: {
      id: 'enemyDmgTakenDebuff',
      formItem: 'switch',
      text: t('Content.enemyDmgTakenDebuff.text'),
      content: t('Content.enemyDmgTakenDebuff.content'),
    },
    enemySlowed: {
      id: 'enemySlowed',
      formItem: 'switch',
      text: t('Content.enemySlowed.text'),
      content: t('Content.enemySlowed.content', { talentScaling: TsUtils.precisionRound(100 * talentScaling) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
      min: 0,
      max: skillExtraHitsMax,
    },
    e1EnhancedState: {
      id: 'e1EnhancedState',
      formItem: 'switch',
      text: t('Content.e1EnhancedState.text'),
      content: t('Content.e1EnhancedState.content'),
      disabled: (e < 1),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    enemyDmgTakenDebuff: content.enemyDmgTakenDebuff,
  }

  const defaults = {
    enemySlowed: true,
    enemyDmgTakenDebuff: true,
    skillExtraHits: skillExtraHitsMax,
    e1EnhancedState: true,
  }

  const teammateDefaults = {
    enemyDmgTakenDebuff: true,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(WeltEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [WeltEntities.Welt]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(WeltAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate additional damage scaling for talent + E1
      const basicAdditionalScaling = r.enemySlowed
        ? talentScaling + (e >= 1 && r.e1EnhancedState ? 0.50 * basicScaling : 0)
        : 0
      const skillAdditionalScaling = r.enemySlowed
        ? talentScaling + (e >= 1 && r.e1EnhancedState ? 0.80 * skillScaling : 0)
        : 0
      const ultAdditionalScaling = r.enemySlowed ? talentScaling : 0

      // Skill total scaling includes base hit + extra bounces
      const skillTotalScaling = skillScaling * (1 + r.skillExtraHits)
      const skillToughness = 10 + 10 * r.skillExtraHits

      return {
        [WeltAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            ...(basicAdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(basicAdditionalScaling)
                  .build(),
              ]
              : []
            ),
          ],
        },
        [WeltAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(skillTotalScaling)
              .toughnessDmg(skillToughness)
              .build(),
            ...(skillAdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(skillAdditionalScaling)
                  .build(),
              ]
              : []
            ),
          ],
        },
        [WeltAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
            ...(ultAdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(ultAdditionalScaling)
                  .build(),
              ]
              : []
            ),
          ],
        },
        [WeltAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // Trace: +20% Elemental DMG when enemy weakness broken
      const isWeaknessBroken = x.getActionValue(StatKey.ENEMY_WEAKNESS_BROKEN, WeltEntities.Welt)
      x.buff(StatKey.DMG_BOOST, isWeaknessBroken ? 0.20 : 0, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.enemyDmgTakenDebuff) ? 0.12 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
