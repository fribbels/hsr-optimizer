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
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const ArlanEntities = createEnum('Arlan')
export const ArlanAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Arlan')
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
  } = Source.character('1008')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)
  const ultScaling = ult(e, 3.20, 3.456)

  const talentMissingHpDmgBoostMax = talent(e, 0.72, 0.792)

  const defaults = {
    selfCurrentHpPercent: 1.00,
  }

  const content: ContentDefinition<typeof defaults> = {
    selfCurrentHpPercent: {
      id: 'selfCurrentHpPercent',
      formItem: 'slider',
      text: t('Content.selfCurrentHpPercent.text'),
      content: t('Content.selfCurrentHpPercent.content', { talentMissingHpDmgBoostMax: TsUtils.precisionRound(100 * talentMissingHpDmgBoostMax) }),
      min: 0.01,
      max: 1.0,
      percent: true,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => [],
    defaults: () => defaults,
    teammateDefaults: () => ({}),

    entityDeclaration: () => Object.values(ArlanEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [ArlanEntities.Arlan]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(ArlanAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [ArlanAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [ArlanAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [ArlanAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [ArlanAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, Math.min(talentMissingHpDmgBoostMax, 1 - r.selfCurrentHpPercent), x.source(SOURCE_TALENT))
      x.buff(StatKey.DMG_BOOST, (e >= 1 && r.selfCurrentHpPercent <= 0.50) ? 0.10 : 0, x.damageType(DamageTag.SKILL).source(SOURCE_E1))
      x.buff(StatKey.DMG_BOOST, (e >= 6 && r.selfCurrentHpPercent <= 0.50) ? 0.20 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
  }
}
