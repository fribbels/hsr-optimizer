import { Stats } from 'lib/constants'
import { ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityCd, buffAbilityCr } from 'lib/optimizer/calculateBuffs'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon): CharacterConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Characters.Robin')
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
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content', { ultAtkBuffScalingValue: TsUtils.precisionRound(100 * ultAtkBuffScalingValue), ultAtkBuffFlatValue: ultAtkBuffFlatValue, ultScaling: TsUtils.precisionRound(100 * ultScaling) }),
    },
    {
      formItem: 'switch',
      id: 'skillDmgBuff',
      name: 'skillDmgBuff',
      text: t('Content.1.text'),
      title: t('Content.1.title'),
      content: t('Content.1.content', { skillDmgBuffValue: TsUtils.precisionRound(100 * skillDmgBuffValue) }),
    },
    {
      formItem: 'switch',
      id: 'talentCdBuff',
      name: 'talentCdBuff',
      text: t('Content.2.text'),
      title: t('Content.2.title'),
      content: t('Content.2.content', { talentCdBuffValue: TsUtils.precisionRound(100 * talentCdBuffValue) }),
    },
    {
      formItem: 'switch',
      id: 'e1UltResPen',
      name: 'e1UltResPen',
      text: t('Content.3.text'),
      title: t('Content.3.title'),
      content: t('Content.3.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e4TeamResBuff',
      name: 'e4TeamResBuff',
      text: t('Content.4.text'),
      title: t('Content.4.title'),
      content: t('Content.4.content'),
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6UltCDBoost',
      name: 'e6UltCDBoost',
      text: t('Content.5.text'),
      title: t('Content.5.title'),
      content: t('Content.5.content'),
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
      text: t('TeammateContent.0.text'),
      title: t('TeammateContent.0.title'),
      content: t('TeammateContent.0.content', { ultAtkBuffFlatValue: TsUtils.precisionRound(100 * ultAtkBuffFlatValue), ultAtkBuffScalingValue: ultAtkBuffScalingValue }),
      min: 0,
      max: 7000,
    },
    findContentId(content, 'talentCdBuff'),
    {
      formItem: 'switch',
      id: 'traceFuaCdBoost',
      name: 'traceFuaCdBoost',
      text: t('TeammateContent.1.text'),
      title: t('TeammateContent.1.title'),
      content: t('TeammateContent.1.content'),
    },
    findContentId(content, 'e1UltResPen'),
    {
      formItem: 'switch',
      id: 'e2UltSpdBuff',
      name: 'e2UltSpdBuff',
      text: t('TeammateContent.2.text'),
      title: t('TeammateContent.2.title'),
      content: t('TeammateContent.2.content'),
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
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x.BASIC_SCALING += basicScaling
      x.ULT_SCALING += (r.concertoActive) ? ultScaling : 0
      x.ULT_BOOSTS_MULTI = 0 // Her ult doesn't apply dmg boosts since its additional dmg

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.CD] += (m.talentCdBuff) ? talentCdBuffValue : 0
      x[Stats.RES] += (e >= 4 && m.concertoActive && m.e4TeamResBuff) ? 0.50 : 0

      x.ELEMENTAL_DMG += (m.skillDmgBuff) ? skillDmgBuffValue : 0
      x.RES_PEN += (e >= 1 && m.concertoActive && m.e1UltResPen) ? 0.24 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.ATK] += (t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0
      x.RATIO_BASED_ATK_BUFF += (t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue : 0

      x[Stats.SPD_P] += (e >= 2 && t.concertoActive && t.e2UltSpdBuff) ? 0.16 : 0
      buffAbilityCd(x, FUA_TYPE, 0.25, (t.traceFuaCdBoost && t.concertoActive))
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x[Stats.ATK] += (r.concertoActive) ? x[Stats.ATK] * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0

      buffAbilityCr(x, ULT_TYPE, 1.00)
      x.ULT_CD_OVERRIDE = (e >= 6 && r.concertoActive && r.e6UltCDBoost) ? 6.00 : 1.50

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
    gpuFinalizeCalculations: (request: Form, params: OptimizerParams) => {
      const r = request.characterConditionals
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
