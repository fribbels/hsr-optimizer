import { BREAK_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { FireflyConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Firefly')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

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
    content: () => Object.values(content),
    defaults: () => defaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.set(1, Source.NONE)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      x.RES.buff((r.enhancedStateActive) ? talentResBuff : 0, Source.NONE)
      x.SPD.buff((r.enhancedStateActive && r.enhancedStateSpdBuff) ? ultSpdBuff : 0, Source.NONE)
      x.BREAK_EFFICIENCY_BOOST.buff((r.enhancedStateActive) ? 0.50 : 0, Source.NONE)
      x.DMG_RED_MULTI.multiply((r.enhancedStateActive && r.talentDmgReductionBuff) ? (1 - talentDmgReductionBuff) : 1, Source.NONE)

      // Should be skill def pen but skill doesnt apply to super break
      x.DEF_PEN.buff((e >= 1 && r.e1DefShred && r.enhancedStateActive) ? 0.15 : 0, Source.NONE)
      x.RES.buff((e >= 4 && r.e4ResBuff && r.enhancedStateActive) ? 0.50 : 0, Source.NONE)
      x.FIRE_RES_PEN.buff((e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.20 : 0, Source.NONE)
      x.BREAK_EFFICIENCY_BOOST.buff((e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.50 : 0, Source.NONE)

      x.BASIC_SCALING.buff((r.enhancedStateActive) ? basicEnhancedScaling : basicScaling, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff((r.enhancedStateActive) ? 45 : 30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff((r.enhancedStateActive) ? 90 : 60, Source.NONE)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      buffAbilityVulnerability(x, BREAK_TYPE, (r.enhancedStateActive && x.a[Key.ENEMY_WEAKNESS_BROKEN]) ? ultWeaknessBrokenBreakVulnerability : 0, Source.NONE)

      x.SUPER_BREAK_MODIFIER.buff((r.superBreakDmg && r.enhancedStateActive && x.a[Key.BE] >= 2.00) ? 0.35 : 0, Source.NONE)
      x.SUPER_BREAK_MODIFIER.buff((r.superBreakDmg && r.enhancedStateActive && x.a[Key.BE] >= 3.60) ? 0.15 : 0, Source.NONE)

      x.SKILL_SCALING.buff(
        (r.enhancedStateActive)
          ? (0.2 * Math.min(3.60, x.a[Key.BE]) + skillEnhancedAtkScaling)
          : skillScaling
        , Source.NONE)

      x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.ATK], Source.NONE)
      x.SKILL_DMG.buff(x.a[Key.SKILL_SCALING] * x.a[Key.ATK], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals
      return `
buffAbilityVulnerability(p_x, BREAK_TYPE, ${ultWeaknessBrokenBreakVulnerability}, select(0, 1, ${wgslTrue(r.enhancedStateActive)} && x.ENEMY_WEAKNESS_BROKEN >= 1));

if (x.BE >= 2.00 && ${wgslTrue(r.superBreakDmg && r.enhancedStateActive)}) {
  x.SUPER_BREAK_MODIFIER += 0.35;
}
if (x.BE >= 3.60 && ${wgslTrue(r.superBreakDmg && r.enhancedStateActive)}) {
  x.SUPER_BREAK_MODIFIER += 0.15;
}

if (${wgslTrue(r.enhancedStateActive)}) {
  x.SKILL_SCALING += 0.2 * min(3.60, x.BE) + ${skillEnhancedAtkScaling};
} else {
  x.SKILL_SCALING += ${skillScaling};
}

x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
      `
    },
    dynamicConditionals: [FireflyConversionConditional],
  }
}
