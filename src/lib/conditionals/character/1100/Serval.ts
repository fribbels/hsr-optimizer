import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const ServalEntities = createEnum('Serval')
export const ServalAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'DOT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Serval')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_E6,
  } = Source.character('1103')

  const talentExtraDmgScaling = talent(e, 0.72, 0.792)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.40, 1.54)
  const ultScaling = ult(e, 1.80, 1.944)
  const dotScaling = skill(e, 1.04, 1.144)

  const defaults = {
    targetShocked: true,
    enemyDefeatedBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetShocked: {
      id: 'targetShocked',
      formItem: 'switch',
      text: t('Content.targetShocked.text'),
      content: t('Content.targetShocked.content', { talentExtraDmgScaling: TsUtils.precisionRound(100 * talentExtraDmgScaling) }),
    },
    enemyDefeatedBuff: {
      id: 'enemyDefeatedBuff',
      formItem: 'switch',
      text: t('Content.enemyDefeatedBuff.text'),
      content: t('Content.enemyDefeatedBuff.content'),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(ServalEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [ServalEntities.Serval]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(ServalAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [ServalAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            ...(r.targetShocked
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Lightning)
                  .atkScaling(talentExtraDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [ServalAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
            ...(r.targetShocked
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Lightning)
                  .atkScaling(talentExtraDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [ServalAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
            ...(r.targetShocked
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Lightning)
                  .atkScaling(talentExtraDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [ServalAbilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .damageElement(ElementTag.Lightning)
              .atkScaling(dotScaling)
              .dotBaseChance(1.0)
              .build(),
          ],
        },
        [ServalAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (r.enemyDefeatedBuff) ? 0.20 : 0, x.source(SOURCE_TRACE))
      x.buff(StatKey.DMG_BOOST, (e >= 6 && r.targetShocked) ? 0.30 : 0, x.source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
