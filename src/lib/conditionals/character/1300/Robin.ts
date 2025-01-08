import { FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { buffAbilityCd, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Robin')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_ULT_3_BASIC_TALENT_5

  const skillDmgBuffValue = skill(e, 0.50, 0.55)
  const talentCdBuffValue = talent(e, 0.20, 0.23)
  const ultAtkBuffScalingValue = ult(e, 0.228, 0.2432)
  const ultAtkBuffFlatValue = ult(e, 200, 230)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 1.20, 1.296)

  const defaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    e1UltResPen: true,
    e4TeamResBuff: false,
    e6UltCDBoost: true,
  }

  const teammateDefaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    teammateATKValue: 5000,
    traceFuaCdBoost: true,
    e1UltResPen: true,
    e2UltSpdBuff: false,
    e4TeamResBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    concertoActive: {
      id: 'concertoActive',
      formItem: 'switch',
      text: t('Content.concertoActive.text'),
      content: t('Content.concertoActive.content', {
        ultAtkBuffScalingValue: TsUtils.precisionRound(100 * ultAtkBuffScalingValue),
        ultAtkBuffFlatValue: ultAtkBuffFlatValue,
        ultScaling: TsUtils.precisionRound(100 * ultScaling),
      }),
    },
    skillDmgBuff: {
      id: 'skillDmgBuff',
      formItem: 'switch',
      text: t('Content.skillDmgBuff.text'),
      content: t('Content.skillDmgBuff.content', { skillDmgBuffValue: TsUtils.precisionRound(100 * skillDmgBuffValue) }),
    },
    talentCdBuff: {
      id: 'talentCdBuff',
      formItem: 'switch',
      text: t('Content.talentCdBuff.text'),
      content: t('Content.talentCdBuff.content', { talentCdBuffValue: TsUtils.precisionRound(100 * talentCdBuffValue) }),
    },
    e1UltResPen: {
      id: 'e1UltResPen',
      formItem: 'switch',
      text: t('Content.e1UltResPen.text'),
      content: t('Content.e1UltResPen.content'),
      disabled: e < 1,
    },
    e4TeamResBuff: {
      id: 'e4TeamResBuff',
      formItem: 'switch',
      text: t('Content.e4TeamResBuff.text'),
      content: t('Content.e4TeamResBuff.content'),
      disabled: e < 4,
    },
    e6UltCDBoost: {
      id: 'e6UltCDBoost',
      formItem: 'switch',
      text: t('Content.e6UltCDBoost.text'),
      content: t('Content.e6UltCDBoost.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    concertoActive: content.concertoActive,
    skillDmgBuff: content.skillDmgBuff,
    teammateATKValue: {
      id: 'teammateATKValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateATKValue.text'),
      content: t('TeammateContent.teammateATKValue.content', {
        ultAtkBuffFlatValue: TsUtils.precisionRound(ultAtkBuffFlatValue),
        ultAtkBuffScalingValue: TsUtils.precisionRound(100 * ultAtkBuffScalingValue),
      }),
      min: 0,
      max: 7000,
    },
    talentCdBuff: content.talentCdBuff,
    traceFuaCdBoost: {
      id: 'traceFuaCdBoost',
      formItem: 'switch',
      text: t('TeammateContent.traceFuaCdBoost.text'),
      content: t('TeammateContent.traceFuaCdBoost.content'),
    },
    e1UltResPen: content.e1UltResPen,
    e2UltSpdBuff: {
      id: 'e2UltSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.e2UltSpdBuff.text'),
      content: t('TeammateContent.e2UltSpdBuff.content'),
      disabled: e < 2,
    },
    e4TeamResBuff: content.e4TeamResBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((r.concertoActive) ? ultScaling : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CD.buffTeam((m.talentCdBuff) ? talentCdBuffValue : 0, Source.NONE)
      x.RES.buffTeam((e >= 4 && m.concertoActive && m.e4TeamResBuff) ? 0.50 : 0, Source.NONE)

      x.ELEMENTAL_DMG.buffTeam((m.skillDmgBuff) ? skillDmgBuffValue : 0, Source.NONE)
      x.RES_PEN.buffTeam((e >= 1 && m.concertoActive && m.e1UltResPen) ? 0.24 : 0, Source.NONE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK.buffTeam((t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0, Source.NONE)
      x.RATIO_BASED_ATK_BUFF.buffTeam((t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue : 0, Source.NONE)

      x.SPD_P.buffTeam((e >= 2 && t.concertoActive && t.e2UltSpdBuff) ? 0.16 : 0, Source.NONE)

      buffAbilityCd(x, FUA_DMG_TYPE, t.traceFuaCdBoost && t.concertoActive ? 0.25 : 0, Source.NONE, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ATK.buff((r.concertoActive) ? x.a[Key.ATK] * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0, Source.NONE)

      x.ULT_ADDITIONAL_DMG_CR_OVERRIDE.buff(1.00, Source.NONE)
      x.ULT_ADDITIONAL_DMG_CD_OVERRIDE.buff((e >= 6 && r.concertoActive && r.e6UltCDBoost) ? 6.00 : 1.50, Source.NONE)

      x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.ATK], Source.NONE)
      x.ULT_ADDITIONAL_DMG.buff(x.a[Key.ULT_ADDITIONAL_DMG_SCALING] * x.a[Key.ATK], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      return `
if (${wgslTrue(r.concertoActive)}) {
  buffDynamicATK(x.ATK * ${ultAtkBuffScalingValue} + ${ultAtkBuffFlatValue}, p_x, p_m, p_state);
}

if (${wgslTrue(r.concertoActive)}) {
  x.ULT_ADDITIONAL_DMG_CR_OVERRIDE = 1.00;
}

if (${wgslTrue(e >= 6 && r.concertoActive && r.e6UltCDBoost)}) {
  x.ULT_ADDITIONAL_DMG_CD_OVERRIDE = 6.00;
} else {
  x.ULT_ADDITIONAL_DMG_CD_OVERRIDE = 1.50;
}

x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.ULT_ADDITIONAL_DMG += x.ULT_ADDITIONAL_DMG_SCALING * x.ATK;
      `
    },
  }
}
