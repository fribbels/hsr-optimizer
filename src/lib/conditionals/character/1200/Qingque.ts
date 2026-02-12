import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
} from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
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
import { DamageTag, ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const QingqueEntities = createEnum('Qingque')
export const QingqueAbilities = createEnum('BASIC', 'ULT', 'FUA', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Qingque')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1201')

  const skillStackDmg = skill(e, 0.38, 0.408)
  const talentAtkBuff = talent(e, 0.72, 0.792)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.40, 2.64)
  const ultScaling = ult(e, 2.00, 2.16)

  const hitMultiByTargetsBlast: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
  }

  const hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>
    return r.basicEnhanced
      ? hitMultiByTargetsBlast[context.enemyCount]
      : hitMultiSingle
  }

  const defaults = {
    basicEnhanced: true,
    basicEnhancedSpdBuff: false,
    skillDmgIncreaseStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicEnhanced: {
      id: 'basicEnhanced',
      formItem: 'switch',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content', { talentAtkBuff: TsUtils.precisionRound(100 * talentAtkBuff) }),
    },
    basicEnhancedSpdBuff: {
      id: 'basicEnhancedSpdBuff',
      formItem: 'switch',
      text: t('Content.basicEnhancedSpdBuff.text'),
      content: t('Content.basicEnhancedSpdBuff.content'),
    },
    skillDmgIncreaseStacks: {
      id: 'skillDmgIncreaseStacks',
      formItem: 'slider',
      text: t('Content.skillDmgIncreaseStacks.text'),
      content: t('Content.skillDmgIncreaseStacks.content', { skillStackDmg: TsUtils.precisionRound(100 * skillStackDmg) }),
      min: 0,
      max: 4,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(QingqueEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [QingqueEntities.Qingque]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(QingqueAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const basicAtkScaling = (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      const basicToughness = (r.basicEnhanced) ? 20 : 10

      return {
        [QingqueAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(basicAtkScaling)
              .toughnessDmg(basicToughness)
              .build(),
          ],
        },
        [QingqueAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [QingqueAbilities.FUA]: {
          hits: [
            ...(
              (e >= 4)
                ? [
                    HitDefinitionBuilder.standardFua()
                      .damageElement(ElementTag.Quantum)
                      .atkScaling(basicAtkScaling)
                      .toughnessDmg((r.basicEnhanced) ? 20 : 10)
                      .build(),
                  ]
                : []
            ),
          ],
        },
        [QingqueAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.buff(StatKey.ATK_P, (r.basicEnhanced) ? talentAtkBuff : 0, x.source(SOURCE_TALENT))
      x.buff(StatKey.SPD_P, (r.basicEnhancedSpdBuff) ? 0.10 : 0, x.source(SOURCE_TRACE))

      // Boost
      x.buff(StatKey.DMG_BOOST, r.skillDmgIncreaseStacks * skillStackDmg, x.source(SOURCE_SKILL))
      x.buff(StatKey.DMG_BOOST, (e >= 1) ? 0.10 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E1))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, getHitMulti(action, context))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(getHitMulti(action, context), action)
    },
  }
}
