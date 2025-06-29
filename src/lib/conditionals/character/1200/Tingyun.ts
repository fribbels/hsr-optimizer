import {
  AbilityType,
  BASIC_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  gpuStandardAdditionalDmgAtkFinalizer,
  standardAdditionalDmgAtkFinalizer,
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
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Tingyun')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1202')

  const skillAtkBoostMax = skill(e, 0.25, 0.27)
  const ultDmgBoost = ult(e, 0.50, 0.56)
  const skillAtkBoostScaling = skill(e, 0.50, 0.55)
  const skillLightningDmgBoostScaling = skill(e, 0.40, 0.44) + ((e >= 4) ? 0.20 : 0)
  const talentScaling = talent(e, 0.60, 0.66) + ((e >= 4) ? 0.20 : 0)

  const basicScaling = basic(e, 1.00, 1.10)

  const defaults = {
    benedictionBuff: false,
    skillSpdBuff: false,
    ultSpdBuff: false,
    ultDmgBuff: false,
  }

  const teammateDefaults = {
    benedictionBuff: true,
    ultSpdBuff: false,
    ultDmgBuff: true,
    teammateAtkBuffValue: skillAtkBoostScaling,
  }

  const content: ContentDefinition<typeof defaults> = {
    benedictionBuff: {
      id: 'benedictionBuff',
      formItem: 'switch',
      text: t('Content.benedictionBuff.text'),
      content: t('Content.benedictionBuff.content', {
        skillAtkBoostScaling: TsUtils.precisionRound(100 * skillAtkBoostScaling),
        skillAtkBoostMax: TsUtils.precisionRound(100 * skillAtkBoostMax),
        skillLightningDmgBoostScaling: TsUtils.precisionRound(100 * skillLightningDmgBoostScaling),
      }),
    },
    skillSpdBuff: {
      id: 'skillSpdBuff',
      formItem: 'switch',
      text: t('Content.skillSpdBuff.text'),
      content: t('Content.skillSpdBuff.content'),
    },
    ultDmgBuff: {
      id: 'ultDmgBuff',
      formItem: 'switch',
      text: t('Content.ultDmgBuff.text'),
      content: t('Content.ultDmgBuff.content', { ultDmgBoost: TsUtils.precisionRound(100 * ultDmgBoost) }),
    },
    ultSpdBuff: {
      id: 'ultSpdBuff',
      formItem: 'switch',
      text: t('Content.ultSpdBuff.text'),
      content: t('Content.ultSpdBuff.content'),
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    benedictionBuff: content.benedictionBuff,
    teammateAtkBuffValue: {
      id: 'teammateAtkBuffValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateAtkBuffValue.text'),
      content: t('TeammateContent.teammateAtkBuffValue.content', {
        skillAtkBoostScaling: TsUtils.precisionRound(100 * skillAtkBoostScaling),
        skillAtkBoostMax: TsUtils.precisionRound(100 * skillAtkBoostMax),
        skillLightningDmgBoostScaling: TsUtils.precisionRound(100 * skillLightningDmgBoostScaling),
      }),
      min: 0,
      max: skillAtkBoostScaling,
      percent: true,
    },
    ultDmgBuff: content.ultDmgBuff,
    ultSpdBuff: content.ultSpdBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.SPD_P.buff((r.skillSpdBuff) ? 0.20 : 0, SOURCE_TRACE)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.benedictionBuff) ? skillLightningDmgBoostScaling + talentScaling : 0, SOURCE_SKILL)

      // Boost
      buffAbilityDmg(x, BASIC_DMG_TYPE, 0.40, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD_P.buffSingle((e >= 1 && m.ultSpdBuff) ? 0.20 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buffSingle((m.ultDmgBuff) ? ultDmgBoost : 0, SOURCE_ULT)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buffSingle((t.benedictionBuff) ? t.teammateAtkBuffValue : 0, SOURCE_SKILL)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuStandardAdditionalDmgAtkFinalizer(),
    dynamicConditionals: [
      {
        id: 'TingyunAtkConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.ATK],
        condition: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.benedictionBuff
        },
        effect: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.ATK, Stats.ATK, this, x, action, context, SOURCE_TRACE, (convertibleValue) => convertibleValue * skillAtkBoostMax)
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.ATK,
            this,
            action,
            context,
            `${skillAtkBoostMax} * convertibleValue`,
            `${wgslTrue(r.benedictionBuff)}`,
          )
        },
      },
    ],
  }
}
