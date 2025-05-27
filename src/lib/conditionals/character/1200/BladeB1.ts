import i18next from 'i18next'
import { AbilityType, FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { BLADE_B1 } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

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
  } = Source.character(BLADE_B1)

  const enhancedStateDmgBoost = skill(e, 0.40, 0.456)
  const hpPercentLostTotalMax = 0.90

  const basicScaling = basic(e, 0.50, 0.55)
  const basicEnhancedHpScaling = skill(e, 1.30, 1.43)

  const ultHpScaling = ult(e, 1.50, 1.62)
  const ultLostHpScaling = ult(e, 1.00, 1.08)

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
    e1BasicUltMultiBoost: {
      id: 'e1BasicUltMultiBoost',
      formItem: 'slider',
      text: 'E1 Ult Basic boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: hpPercentLostTotalMax,
      percent: true,
      disabled: e < 1,
    },
    e2CrBuff: {
      id: 'e2CrBuff',
      formItem: 'slider',
      text: 'E2 CR buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: hpPercentLostTotalMax,
      percent: true,
      disabled: e < 2,
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
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((e >= 2 && r.enhancedStateActive && r.e2CrBuff) ? 0.15 : 0, SOURCE_E2)
      x.HP_P.buff((e >= 4) ? r.e4MaxHpIncreaseStacks * 0.20 : 0, SOURCE_E4)

      // Scaling
      if (r.enhancedStateActive) {
        x.BASIC_HP_SCALING.buff(basicEnhancedHpScaling, SOURCE_BASIC)
        x.BASIC_HP_SCALING.buff((e >= 1 && r.e1BasicUltMultiBoost) ? 1.50 * r.hpPercentLostTotal : 0, SOURCE_E1)
      } else {
        x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_BASIC)
      }

      x.ULT_HP_SCALING.buff(ultHpScaling, SOURCE_ULT)
      x.ULT_HP_SCALING.buff(ultLostHpScaling * r.hpPercentLostTotal, SOURCE_ULT)
      x.ULT_HP_SCALING.buff((e >= 1 && r.e1BasicUltMultiBoost) ? 1.50 * r.hpPercentLostTotal : 0, SOURCE_E1)

      x.FUA_HP_SCALING.buff(fuaHpScaling, SOURCE_TALENT)
      x.FUA_HP_SCALING.buff((e >= 6) ? 0.50 : 0, SOURCE_E6)

      // Boost
      x.ELEMENTAL_DMG.buff(r.enhancedStateActive ? enhancedStateDmgBoost : 0, SOURCE_SKILL)
      buffAbilityDmg(x, FUA_DMG_TYPE, 0.20, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff((r.enhancedStateActive) ? 20 : 10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(10, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: () => '',
  }
}
