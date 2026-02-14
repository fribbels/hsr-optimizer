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
import { DamageTag, ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { BLADE_B1 } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const BladeB1Entities = createEnum('BladeB1')
export const BladeB1Abilities = createEnum('BASIC', 'ULT', 'FUA', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.BladeB1.Content')
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
  } = Source.character(BLADE_B1)

  const enhancedStateDmgBoost = skill(e, 0.40, 0.456)
  const hpPercentLostTotalMax = 0.90

  const basicScaling = basic(e, 0.50, 0.55)
  const basicEnhancedHpScaling = skill(e, 1.30, 1.43)

  const ultHpScaling = ult(e, 1.50, 1.62)
  const ultLostHpScaling = ult(e, 1.20, 1.296)

  const fuaHpScaling = talent(e, 1.30, 1.43)

  const defaults = {
    enhancedStateActive: true,
    hpPercentLostTotal: hpPercentLostTotalMax,
    e1BasicUltMultiBoost: true,
    e2CrBuff: true,
    e4MaxHpIncreaseStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedStateActive: {
      id: 'enhancedStateActive',
      formItem: 'switch',
      text: t('enhancedStateActive.text'),
      content: t('enhancedStateActive.content', { DmgBuff: TsUtils.precisionRound(100 * enhancedStateDmgBoost) }),
    },
    hpPercentLostTotal: {
      id: 'hpPercentLostTotal',
      formItem: 'slider',
      text: t('hpPercentLostTotal.text'),
      content: t('hpPercentLostTotal.content', {
        UltHpScaling: TsUtils.precisionRound(100 * ultHpScaling),
        HpTallyUltScaling: TsUtils.precisionRound(100 * ultLostHpScaling),
      }),
      min: 0,
      max: hpPercentLostTotalMax,
      percent: true,
    },
    e1BasicUltMultiBoost: {
      id: 'e1BasicUltMultiBoost',
      formItem: 'switch',
      text: t('e1BasicUltMultiBoost.text'),
      content: t('e1BasicUltMultiBoost.content'),
      disabled: e < 1,
    },
    e2CrBuff: {
      id: 'e2CrBuff',
      formItem: 'switch',
      text: t('e2CrBuff.text'),
      content: t('e2CrBuff.content'),
      disabled: e < 2,
    },
    e4MaxHpIncreaseStacks: {
      id: 'e4MaxHpIncreaseStacks',
      formItem: 'slider',
      text: t('e4MaxHpIncreaseStacks.text'),
      content: t('e4MaxHpIncreaseStacks.content'),
      min: 0,
      max: 2,
      disabled: e < 4,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(BladeB1Entities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [BladeB1Entities.BladeB1]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(BladeB1Abilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate HP scaling values based on conditionals
      const basicHpScaling = r.enhancedStateActive
        ? basicEnhancedHpScaling + ((e >= 1 && r.e1BasicUltMultiBoost) ? 1.50 * r.hpPercentLostTotal : 0)
        : basicScaling

      const ultTotalHpScaling = ultHpScaling
        + ultLostHpScaling * r.hpPercentLostTotal
        + ((e >= 1 && r.e1BasicUltMultiBoost) ? 1.50 * r.hpPercentLostTotal : 0)

      const fuaTotalHpScaling = fuaHpScaling + ((e >= 6) ? 0.50 : 0)

      return {
        [BladeB1Abilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .hpScaling(basicHpScaling)
              .toughnessDmg(r.enhancedStateActive ? 20 : 10)
              .build(),
          ],
        },
        [BladeB1Abilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Wind)
              .hpScaling(ultTotalHpScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [BladeB1Abilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Wind)
              .hpScaling(fuaTotalHpScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [BladeB1Abilities.BREAK]: {
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
      x.buff(StatKey.CR, (e >= 2 && r.enhancedStateActive && r.e2CrBuff) ? 0.15 : 0, x.source(SOURCE_E2))
      x.buff(StatKey.HP_P, (e >= 4) ? r.e4MaxHpIncreaseStacks * 0.20 : 0, x.source(SOURCE_E4))

      // Boost
      x.buff(StatKey.DMG_BOOST, r.enhancedStateActive ? enhancedStateDmgBoost : 0, x.source(SOURCE_SKILL))
      x.buff(StatKey.DMG_BOOST, 0.20, x.damageType(DamageTag.FUA).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
