import { Stats } from 'lib/constants'
import { ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityCd, buffAbilityCr } from 'lib/optimizer/calculateBuffs'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Robin')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_ULT_3_BASIC_TALENT_5

  const skillDmgBuffValue = skill(e, 0.50, 0.55)
  const talentCdBuffValue = talent(e, 0.20, 0.23)
  const ultAtkBuffScalingValue = ult(e, 0.228, 0.2432)
  const ultAtkBuffFlatValue = ult(e, 200, 230)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 1.20, 1.296)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'concertoActive',
      name: 'concertoActive',
      text: t('Content.concertoActive.text'),
      title: t('Content.concertoActive.title'),
      content: t('Content.concertoActive.content', { ultAtkBuffScalingValue: TsUtils.precisionRound(100 * ultAtkBuffScalingValue), ultAtkBuffFlatValue: ultAtkBuffFlatValue, ultScaling: TsUtils.precisionRound(100 * ultScaling) }),
    },
    {
      formItem: 'switch',
      id: 'skillDmgBuff',
      name: 'skillDmgBuff',
      text: t('Content.skillDmgBuff.text'),
      title: t('Content.skillDmgBuff.title'),
      content: t('Content.skillDmgBuff.content', { skillDmgBuffValue: TsUtils.precisionRound(100 * skillDmgBuffValue) }),
    },
    {
      formItem: 'switch',
      id: 'talentCdBuff',
      name: 'talentCdBuff',
      text: t('Content.talentCdBuff.text'),
      title: t('Content.talentCdBuff.title'),
      content: t('Content.talentCdBuff.content', { talentCdBuffValue: TsUtils.precisionRound(100 * talentCdBuffValue) }),
    },
    {
      formItem: 'switch',
      id: 'e1UltResPen',
      name: 'e1UltResPen',
      text: t('Content.e1UltResPen.text'),
      title: t('Content.e1UltResPen.title'),
      content: t('Content.e1UltResPen.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e4TeamResBuff',
      name: 'e4TeamResBuff',
      text: t('Content.e4TeamResBuff.text'),
      title: t('Content.e4TeamResBuff.title'),
      content: t('Content.e4TeamResBuff.content'),
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6UltCDBoost',
      name: 'e6UltCDBoost',
      text: t('Content.e6UltCDBoost.text'),
      title: t('Content.e6UltCDBoost.title'),
      content: t('Content.e6UltCDBoost.content'),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'concertoActive'),
    findContentId(content, 'skillDmgBuff'),
    {
      formItem: 'slider',
      id: 'teammateATKValue',
      name: 'teammateATKValue',
      text: t('TeammateContent.teammateATKValue.text'),
      title: t('TeammateContent.teammateATKValue.title'),
      content: t('TeammateContent.teammateATKValue.content', { ultAtkBuffFlatValue: TsUtils.precisionRound(100 * ultAtkBuffFlatValue), ultAtkBuffScalingValue: ultAtkBuffScalingValue }),
      min: 0,
      max: 7000,
    },
    findContentId(content, 'talentCdBuff'),
    {
      formItem: 'switch',
      id: 'traceFuaCdBoost',
      name: 'traceFuaCdBoost',
      text: t('TeammateContent.traceFuaCdBoost.text'),
      title: t('TeammateContent.traceFuaCdBoost.title'),
      content: t('TeammateContent.traceFuaCdBoost.content'),
    },
    findContentId(content, 'e1UltResPen'),
    {
      formItem: 'switch',
      id: 'e2UltSpdBuff',
      name: 'e2UltSpdBuff',
      text: t('TeammateContent.e2UltSpdBuff.text'),
      title: t('TeammateContent.e2UltSpdBuff.title'),
      content: t('TeammateContent.e2UltSpdBuff.content'),
      disabled: e < 2,
    },
  ]

  const defaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    e1UltResPen: true,
    e4TeamResBuff: false,
    e6UltCDBoost: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({
      concertoActive: true,
      skillDmgBuff: true,
      talentCdBuff: true,
      teammateATKValue: 5000,
      traceFuaCdBoost: true,
      e1UltResPen: true,
      e2UltSpdBuff: false,
      e4TeamResBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x.BASIC_SCALING += basicScaling
      x.ULT_SCALING += (r.concertoActive) ? ultScaling : 0
      x.ULT_BOOSTS_MULTI = 0 // Her ult doesn't apply dmg boosts since its additional dmg

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.CD] += (m.talentCdBuff) ? talentCdBuffValue : 0
      x[Stats.RES] += (e >= 4 && m.concertoActive && m.e4TeamResBuff) ? 0.50 : 0

      x.ELEMENTAL_DMG += (m.skillDmgBuff) ? skillDmgBuffValue : 0
      x.RES_PEN += (e >= 1 && m.concertoActive && m.e1UltResPen) ? 0.24 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals

      x[Stats.ATK] += (t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0
      x.RATIO_BASED_ATK_BUFF += (t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue : 0

      x[Stats.SPD_P] += (e >= 2 && t.concertoActive && t.e2UltSpdBuff) ? 0.16 : 0
      buffAbilityCd(x, FUA_TYPE, 0.25, (t.traceFuaCdBoost && t.concertoActive))
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x[Stats.ATK] += (r.concertoActive) ? x[Stats.ATK] * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0

      buffAbilityCr(x, ULT_TYPE, 1.00)
      x.ULT_CD_OVERRIDE = (e >= 6 && r.concertoActive && r.e6UltCDBoost) ? 6.00 : 1.50

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals
      return `
if (${wgslTrue(r.concertoActive)}) {
  buffDynamicATK(x.ATK * ${ultAtkBuffScalingValue} + ${ultAtkBuffFlatValue}, p_x, p_state);
}

buffAbilityCr(p_x, ULT_TYPE, 1.00, 1);

if (${wgslTrue(e >= 6 && r.concertoActive && r.e6UltCDBoost)}) {
  x.ULT_CD_OVERRIDE = 6.00;
} else {
  x.ULT_CD_OVERRIDE = 1.50;
}

x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;
      `
    },
  }
}
