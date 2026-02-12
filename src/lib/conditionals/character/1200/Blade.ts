import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
} from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkContainer, gpuBoostAshblazingAtkContainer } from 'lib/conditionals/conditionalFinalizers'
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

export const BladeEntities = createEnum('Blade')
export const BladeAbilities = createEnum('BASIC', 'ULT', 'FUA', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Blade')
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
  } = Source.character('1205')

  const enhancedStateDmgBoost = skill(e, 0.40, 0.456)
  const hpPercentLostTotalMax = 0.90

  const basicScaling = basic(e, 1.0, 1.1)
  const basicEnhancedAtkScaling = skill(e, 0.40, 0.44)
  const basicEnhancedHpScaling = skill(e, 1.00, 1.10)
  const ultAtkScaling = ult(e, 0.40, 0.432)
  const ultHpScaling = ult(e, 1.00, 1.08)
  const ultLostHpScaling = ult(e, 1.00, 1.08)
  const fuaAtkScaling = talent(e, 0.44, 0.484)
  const fuaHpScaling = talent(e, 1.10, 1.21)

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.33 + 2 * 0.33 + 3 * 0.34),
    3: ASHBLAZING_ATK_STACK * (2 * 0.33 + 5 * 0.33 + 8 * 0.34),
    5: ASHBLAZING_ATK_STACK * (3 * 0.33 + 8 * 0.33 + 8 * 0.34),
  }

  const defaults = {
    enhancedStateActive: true,
    hpPercentLostTotal: hpPercentLostTotalMax,
    e4MaxHpIncreaseStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedStateActive: {
      id: 'enhancedStateActive',
      formItem: 'switch',
      text: t('Content.enhancedStateActive.text'),
      content: t('Content.enhancedStateActive.content', { enhancedStateDmgBoost: TsUtils.precisionRound(100 * enhancedStateDmgBoost) }),
    },
    hpPercentLostTotal: {
      id: 'hpPercentLostTotal',
      formItem: 'slider',
      text: t('Content.hpPercentLostTotal.text'),
      content: t('Content.hpPercentLostTotal.content', { hpPercentLostTotalMax: TsUtils.precisionRound(100 * hpPercentLostTotalMax) }),
      min: 0,
      max: hpPercentLostTotalMax,
      percent: true,
    },
    e4MaxHpIncreaseStacks: {
      id: 'e4MaxHpIncreaseStacks',
      formItem: 'slider',
      text: t('Content.e4MaxHpIncreaseStacks.text'),
      content: t('Content.e4MaxHpIncreaseStacks.content'),
      min: 0,
      max: 2,
      disabled: e < 4,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(BladeEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [BladeEntities.Blade]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(BladeAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate scaling values based on conditionals
      const basicAtkScaling = r.enhancedStateActive ? basicEnhancedAtkScaling : basicScaling
      const basicHpScaling = r.enhancedStateActive ? basicEnhancedHpScaling : 0

      const ultTotalHpScaling = ultHpScaling
        + ultLostHpScaling * r.hpPercentLostTotal
        + ((e >= 1 && context.enemyCount == 1) ? 1.50 * r.hpPercentLostTotal : 0)

      const fuaTotalHpScaling = fuaHpScaling + ((e >= 6) ? 0.50 : 0)

      return {
        [BladeAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .atkScaling(basicAtkScaling)
              .hpScaling(basicHpScaling)
              .toughnessDmg(r.enhancedStateActive ? 20 : 10)
              .build(),
          ],
        },
        [BladeAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Wind)
              .atkScaling(ultAtkScaling)
              .hpScaling(ultTotalHpScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [BladeAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Wind)
              .atkScaling(fuaAtkScaling)
              .hpScaling(fuaTotalHpScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [BladeAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.buff(StatKey.CR, (e >= 2 && r.enhancedStateActive) ? 0.15 : 0, x.source(SOURCE_E2))
      x.buff(StatKey.HP_P, (e >= 4) ? r.e4MaxHpIncreaseStacks * 0.20 : 0, x.source(SOURCE_E4))

      // Boost
      x.buff(StatKey.DMG_BOOST, r.enhancedStateActive ? enhancedStateDmgBoost : 0, x.source(SOURCE_SKILL))
      x.buff(StatKey.DMG_BOOST, 0.20, x.damageType(DamageTag.FUA).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, hitMultiByTargets[context.enemyCount])
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(hitMultiByTargets[context.enemyCount], action)
    },
  }
}
