import { BREAK_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { FireflyConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon): CharacterConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Characters.Firefly')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.00, 2.20)

  const skillScaling = skill(e, 2.00, 2.20)
  const skillEnhancedAtkScaling = skill(e, 2.00, 2.20)

  const ultSpdBuff = ult(e, 60, 66)
  const ultWeaknessBrokenBreakVulnerability = ult(e, 0.20, 0.22)
  const talentResBuff = talent(e, 0.30, 0.34)
  const talentDmgReductionBuff = talent(e, 0.40, 0.44)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'enhancedStateActive',
      name: 'enhancedStateActive',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content'),
    },
    {
      formItem: 'switch',
      id: 'enhancedStateSpdBuff',
      name: 'enhancedStateSpdBuff',
      text: t('Content.1.text'),
      title: t('Content.1.title'),
      content: t('Content.1.content', { ultSpdBuff }),
    },
    {
      formItem: 'switch',
      id: 'superBreakDmg',
      name: 'superBreakDmg',
      text: t('Content.2.text'),
      title: t('Content.2.title'),
      content: t('Content.2.content'),
    },
    {
      formItem: 'switch',
      id: 'atkToBeConversion',
      name: 'atkToBeConversion',
      text: t('Content.3.text'),
      title: t('Content.3.title'),
      content: t('Content.3.content'),
    },
    {
      formItem: 'switch',
      id: 'talentDmgReductionBuff',
      name: 'talentDmgReductionBuff',
      text: t('Content.4.text'),
      title: t('Content.4.title'),
      content: t('Content.4.content', { talentResBuff: TsUtils.precisionRound(100 * talentResBuff), talentDmgReductionBuff: TsUtils.precisionRound(100 * talentDmgReductionBuff) }),
    },
    {
      formItem: 'switch',
      id: 'e1DefShred',
      name: 'e1DefShred',
      text: t('Content.5.text'),
      title: t('Content.5.title'),
      content: t('Content.5.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e4ResBuff',
      name: 'e4ResBuff',
      text: t('Content.6.text'),
      title: t('Content.6.title'),
      content: t('Content.6.content'),
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6Buffs',
      name: 'e6Buffs',
      text: t('Content.7.text'),
      title: t('Content.7.title'),
      content: t('Content.7.content'),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = []

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

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({}),
    initializeConfigurations: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }
    },
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x[Stats.RES] += (r.enhancedStateActive) ? talentResBuff : 0
      x[Stats.SPD] += (r.enhancedStateActive && r.enhancedStateSpdBuff) ? ultSpdBuff : 0
      x.BREAK_EFFICIENCY_BOOST += (r.enhancedStateActive) ? 0.50 : 0
      x.DMG_RED_MULTI *= (r.enhancedStateActive && r.talentDmgReductionBuff) ? (1 - talentDmgReductionBuff) : 1

      // Should be skill def pen but skill doesnt apply to super break
      x.DEF_PEN += (e >= 1 && r.e1DefShred && r.enhancedStateActive) ? 0.15 : 0
      x[Stats.RES] += (e >= 4 && r.e4ResBuff && r.enhancedStateActive) ? 0.50 : 0
      x.FIRE_RES_PEN += (e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.20 : 0
      x.BREAK_EFFICIENCY_BOOST += (e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.50 : 0

      x.BASIC_SCALING += (r.enhancedStateActive) ? basicEnhancedScaling : basicScaling

      x.BASIC_TOUGHNESS_DMG += (r.enhancedStateActive) ? 45 : 30
      x.SKILL_TOUGHNESS_DMG += (r.enhancedStateActive) ? 90 : 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      buffAbilityVulnerability(x, BREAK_TYPE, ultWeaknessBrokenBreakVulnerability, (r.enhancedStateActive && x.ENEMY_WEAKNESS_BROKEN))

      x.SUPER_BREAK_MODIFIER += (r.superBreakDmg && r.enhancedStateActive && x[Stats.BE] >= 2.00) ? 0.35 : 0
      x.SUPER_BREAK_MODIFIER += (r.superBreakDmg && r.enhancedStateActive && x[Stats.BE] >= 3.60) ? 0.15 : 0

      x.SKILL_SCALING += (r.enhancedStateActive) ? (0.2 * Math.min(3.60, x[Stats.BE]) + skillEnhancedAtkScaling) : skillScaling

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
    },
    gpuFinalizeCalculations: (request: Form, params: OptimizerParams) => {
      const r = request.characterConditionals
      // TODO:
      // if (r.atkToBeConversion) {
      //   evaluateConditional(FireflyConversionConditional, x, request, params)
      // }
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
