import {
  AbilityType,
  BREAK_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  teammateMatchesId,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversion,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability } from 'lib/optimization/calculateBuffs'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { THE_DAHLIA } from 'lib/simulations/tests/testMetadataConstants'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Firefly')
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
  } = Source.character('1310')

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.00, 2.20)

  const skillScaling = skill(e, 2.00, 2.20)
  const skillEnhancedAtkScaling = skill(e, 2.00, 2.20)

  const ultSpdBuff = ult(e, 60, 66)
  const ultWeaknessBrokenBreakVulnerability = ult(e, 0.20, 0.22)
  const talentResBuff = talent(e, 0.30, 0.34)
  const talentDmgReductionBuff = talent(e, 0.40, 0.44)

  const defaults = {
    enhancedStateActive: true,
    enhancedStateSpdBuff: true,
    superBreakDmg: true,
    atkToBeConversion: true,
    talentDmgReductionBuff: true,
    e1DefShred: true,
    e4ResBuff: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedStateActive: {
      id: 'enhancedStateActive',
      formItem: 'switch',
      text: t('Content.enhancedStateActive.text'),
      content: t('Content.enhancedStateActive.content'),
    },
    enhancedStateSpdBuff: {
      id: 'enhancedStateSpdBuff',
      formItem: 'switch',
      text: t('Content.enhancedStateSpdBuff.text'),
      content: t('Content.enhancedStateSpdBuff.content', { ultSpdBuff }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content'),
    },
    atkToBeConversion: {
      id: 'atkToBeConversion',
      formItem: 'switch',
      text: t('Content.atkToBeConversion.text'),
      content: t('Content.atkToBeConversion.content'),
    },
    talentDmgReductionBuff: {
      id: 'talentDmgReductionBuff',
      formItem: 'switch',
      text: t('Content.talentDmgReductionBuff.text'),
      content: t('Content.talentDmgReductionBuff.content', {
        talentResBuff: TsUtils.precisionRound(100 * talentResBuff),
        talentDmgReductionBuff: TsUtils.precisionRound(100 * talentDmgReductionBuff),
      }),
    },
    e1DefShred: {
      id: 'e1DefShred',
      formItem: 'switch',
      text: t('Content.e1DefShred.text'),
      content: t('Content.e1DefShred.content'),
      disabled: e < 1,
    },
    e4ResBuff: {
      id: 'e4ResBuff',
      formItem: 'switch',
      text: t('Content.e4ResBuff.text'),
      content: t('Content.e4ResBuff.content'),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('Content.e6Buffs.text'),
      content: t('Content.e6Buffs.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TRACE)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.RES.buff((r.enhancedStateActive) ? talentResBuff : 0, SOURCE_TALENT)
      x.SPD.buff((r.enhancedStateActive && r.enhancedStateSpdBuff) ? ultSpdBuff : 0, SOURCE_ULT)
      x.BREAK_EFFICIENCY_BOOST.buff((r.enhancedStateActive) ? 0.50 : 0, SOURCE_ULT)
      x.DMG_RED_MULTI.multiply((r.enhancedStateActive && r.talentDmgReductionBuff) ? (1 - talentDmgReductionBuff) : 1, SOURCE_TALENT)

      buffAbilityVulnerability(
        x,
        BREAK_DMG_TYPE,
        (r.enhancedStateActive && x.a[Key.ENEMY_WEAKNESS_BROKEN]) ? ultWeaknessBrokenBreakVulnerability : 0,
        SOURCE_ULT,
      )

      // Should be skill def pen but skill doesnt apply to super break
      x.DEF_PEN.buff((e >= 1 && r.e1DefShred && r.enhancedStateActive) ? 0.15 : 0, SOURCE_E1)
      x.RES.buff((e >= 4 && r.e4ResBuff && r.enhancedStateActive) ? 0.50 : 0, SOURCE_E4)
      x.FIRE_RES_PEN.buff((e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.20 : 0, SOURCE_E6)
      x.BREAK_EFFICIENCY_BOOST.buff((e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.50 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff((r.enhancedStateActive) ? basicEnhancedScaling : basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff((r.enhancedStateActive) ? 15 : 10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff((r.enhancedStateActive) ? 30 : 20, SOURCE_SKILL)

      if (teammateMatchesId(context, THE_DAHLIA)) {
        x.SKILL_FIXED_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      }

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUPER_BREAK_MODIFIER.buff((r.superBreakDmg && r.enhancedStateActive && x.a[Key.BE] >= 2.00) ? 0.35 : 0, SOURCE_TRACE)
      x.SUPER_BREAK_MODIFIER.buff((r.superBreakDmg && r.enhancedStateActive && x.a[Key.BE] >= 3.60) ? 0.15 : 0, SOURCE_TRACE)

      x.SKILL_ATK_SCALING.buff(
        (r.enhancedStateActive)
          ? (0.2 * Math.min(3.60, x.a[Key.BE]) + skillEnhancedAtkScaling)
          : skillScaling,
        SOURCE_SKILL,
      )
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      return `
if (x.BE >= 2.00 && ${wgslTrue(r.superBreakDmg && r.enhancedStateActive)}) { x.SUPER_BREAK_MODIFIER += 0.35; }
if (x.BE >= 3.60 && ${wgslTrue(r.superBreakDmg && r.enhancedStateActive)}) { x.SUPER_BREAK_MODIFIER += 0.15; }

if (${wgslTrue(r.enhancedStateActive)}) {
  x.SKILL_ATK_SCALING += 0.2 * min(3.60, x.BE) + ${skillEnhancedAtkScaling};
} else {
  x.SKILL_ATK_SCALING += ${skillScaling};
}
      `
    },
    dynamicConditionals: [
      {
        id: 'FireflyConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.BE],
        condition: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.atkToBeConversion && x.a[Key.ATK] > 1800
        },
        effect: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(
            Stats.ATK,
            Stats.BE,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            (convertibleValue) => 0.008 * Math.floor((convertibleValue - 1800) / 10),
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.BE,
            this,
            action,
            context,
            `0.008 * floor((convertibleValue - 1800) / 10)`,
            `${wgslTrue(r.atkToBeConversion)} && x.ATK > 1800`,
          )
        },
      },
    ],
  }
}
