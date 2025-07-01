import {
  AbilityType,
  FUA_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  gpuUltAdditionalDmgAtkFinalizer,
  ultAdditionalDmgAtkFinalizer,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
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
import {
  buffAbilityCd,
  Target,
} from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Robin')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_ULT_3_BASIC_TALENT_5
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
  } = Source.character('1309')

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
    e2UltSpdBuff: false,
    e4TeamResBuff: false,
    e6UltCDBoost: true,
  }

  const teammateDefaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    teammateATKValue: 4500,
    traceFuaCdBoost: true,
    e1UltResPen: true,
    e2UltSpdBuff: true,
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
    e2UltSpdBuff: {
      id: 'e2UltSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.e2UltSpdBuff.text'),
      content: t('TeammateContent.e2UltSpdBuff.content'),
      disabled: e < 2,
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
      max: 10000,
    },
    talentCdBuff: content.talentCdBuff,
    traceFuaCdBoost: {
      id: 'traceFuaCdBoost',
      formItem: 'switch',
      text: t('TeammateContent.traceFuaCdBoost.text'),
      content: t('TeammateContent.traceFuaCdBoost.content'),
    },
    e1UltResPen: content.e1UltResPen,
    e2UltSpdBuff: content.e2UltSpdBuff,
    e4TeamResBuff: content.e4TeamResBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((r.concertoActive) ? ultScaling : 0, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      if (r.concertoActive) {
        x.ATK.buff(ultAtkBuffFlatValue, SOURCE_ULT)
        x.UNCONVERTIBLE_ATK_BUFF.buff(ultAtkBuffFlatValue, SOURCE_ULT)
      }

      x.ULT_ADDITIONAL_DMG_CR_OVERRIDE.buff(1.00, SOURCE_ULT)
      x.ULT_ADDITIONAL_DMG_CD_OVERRIDE.buff((e >= 6 && r.concertoActive && r.e6UltCDBoost) ? 6.00 : 1.50, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CD.buffTeam((m.talentCdBuff) ? talentCdBuffValue : 0, SOURCE_TALENT)
      x.RES.buffTeam((e >= 4 && m.concertoActive && m.e4TeamResBuff) ? 0.50 : 0, SOURCE_E4)

      x.SPD_P.buffTeam((e >= 2 && m.concertoActive && m.e2UltSpdBuff) ? 0.16 : 0, SOURCE_E2)

      x.ELEMENTAL_DMG.buffTeam((m.skillDmgBuff) ? skillDmgBuffValue : 0, SOURCE_SKILL)
      x.RES_PEN.buffTeam((e >= 1 && m.concertoActive && m.e1UltResPen) ? 0.24 : 0, SOURCE_E1)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const atkBuff = (t.concertoActive) ? t.teammateATKValue * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0
      x.ATK.buffTeam(atkBuff, SOURCE_ULT)
      x.UNCONVERTIBLE_ATK_BUFF.buffTeam(atkBuff, SOURCE_ULT)

      buffAbilityCd(x, FUA_DMG_TYPE, t.traceFuaCdBoost && t.concertoActive ? 0.25 : 0, SOURCE_TRACE, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      ultAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuUltAdditionalDmgAtkFinalizer(),
    dynamicConditionals: [
      {
        id: 'RobinAtkConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.ATK],
        condition: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.concertoActive
        },
        effect: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.ATK, Stats.ATK, this, x, action, context, SOURCE_ULT, (convertibleValue) => convertibleValue * ultAtkBuffScalingValue)
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.ATK,
            this,
            action,
            context,
            `convertibleValue * ${ultAtkBuffScalingValue}`,
            `${wgslTrue(r.concertoActive)}`,
          )
        },
      },
    ],
  }
}
