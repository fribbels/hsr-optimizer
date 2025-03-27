import { AbilityType, ASHBLAZING_ATK_STACK, BASIC_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { boostAshblazingAtkP, gpuBoostAshblazingAtkP } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityCr } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Bronya')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1101')

  const skillDmgBoostValue = skill(e, 0.66, 0.726)
  const ultAtkBoostValue = ult(e, 0.55, 0.594)
  const ultCdBoostValue = ult(e, 0.16, 0.168)
  const ultCdBoostBaseValue = ult(e, 0.20, 0.216)

  const basicScaling = basic(e, 1.0, 1.1)
  const fuaScaling = basicScaling * 0.80

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    teamDmgBuff: true,
    skillBuff: true,
    ultBuff: true,
    battleStartDefBuff: false,
    techniqueBuff: false,
    e2SkillSpdBuff: false,
  }

  const teammateDefaults = {
    ...defaults,
    ...{
      teammateCDValue: 2.50,
    },
  }

  const content: ContentDefinition<typeof defaults> = {
    teamDmgBuff: {
      id: 'teamDmgBuff',
      formItem: 'switch',
      text: t('Content.teamDmgBuff.text'),
      content: t('Content.teamDmgBuff.content'),
    },
    skillBuff: {
      id: 'skillBuff',
      formItem: 'switch',
      text: t('Content.skillBuff.text'),
      content: t('Content.skillBuff.content', { skillDmgBoostValue: TsUtils.precisionRound(100 * skillDmgBoostValue) }),
    },
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultAtkBoostValue: TsUtils.precisionRound(100 * ultAtkBoostValue),
        ultCdBoostValue: TsUtils.precisionRound(100 * ultCdBoostValue),
        ultCdBoostBaseValue: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
      }),
    },
    battleStartDefBuff: {
      id: 'battleStartDefBuff',
      formItem: 'switch',
      text: t('Content.battleStartDefBuff.text'),
      content: t('Content.battleStartDefBuff.content'),
    },
    techniqueBuff: {
      id: 'techniqueBuff',
      formItem: 'switch',
      text: t('Content.techniqueBuff.text'),
      content: t('Content.techniqueBuff.content'),
    },
    e2SkillSpdBuff: {
      id: 'e2SkillSpdBuff',
      formItem: 'switch',
      text: t('Content.e2SkillSpdBuff.text'),
      content: t('Content.e2SkillSpdBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamDmgBuff: content.teamDmgBuff,
    skillBuff: content.skillBuff,
    ultBuff: content.ultBuff,
    battleStartDefBuff: content.battleStartDefBuff,
    techniqueBuff: content.techniqueBuff,
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t('TeammateContent.teammateCDValue.content', {
        ultAtkBoostValue: TsUtils.precisionRound(100 * ultAtkBoostValue),
        ultCdBoostValue: TsUtils.precisionRound(100 * ultCdBoostValue),
        ultCdBoostBaseValue: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
      }),
      min: 0,
      max: 4.00,
      percent: true,
    },
    e2SkillSpdBuff: content.e2SkillSpdBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      buffAbilityCr(x, BASIC_DMG_TYPE, 1.00, SOURCE_TRACE)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.FUA_ATK_SCALING.buff((e >= 4) ? fuaScaling : 0, SOURCE_E4)

      if (r.ultBuff) {
        x.CD.buff(ultCdBoostBaseValue, SOURCE_ULT)
        x.UNCONVERTIBLE_CD_BUFF.buff(ultCdBoostBaseValue, SOURCE_ULT)
      }

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.FUA_TOUGHNESS_DMG.buff((e >= 4) ? 10 : 0, SOURCE_E4)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.DEF_P.buffTeam((m.battleStartDefBuff) ? 0.20 : 0, SOURCE_TRACE)
      x.SPD_P.buffSingle((m.e2SkillSpdBuff) ? 0.30 : 0, SOURCE_E2)
      x.ATK_P.buffTeam((m.techniqueBuff) ? 0.15 : 0, SOURCE_TECHNIQUE)
      x.ATK_P.buffTeam((m.ultBuff) ? ultAtkBoostValue : 0, SOURCE_ULT)

      x.ELEMENTAL_DMG.buffTeam((m.teamDmgBuff) ? 0.10 : 0, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buffSingle((m.skillBuff) ? skillDmgBoostValue : 0, SOURCE_SKILL)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const cdBuff = (t.ultBuff) ? ultCdBoostValue * t.teammateCDValue + ultCdBoostBaseValue : 0
      x.CD.buffTeam(cdBuff, SOURCE_ULT)
      x.UNCONVERTIBLE_CD_BUFF.buffTeam(cdBuff, SOURCE_ULT)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuBoostAshblazingAtkP(hitMulti),
    dynamicConditionals: [
      {
        id: 'BronyaCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.ultBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.CD, Stats.CD, this, x, action, context, SOURCE_ULT,
            (convertibleValue) => convertibleValue * ultCdBoostValue,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.CD, Stats.CD, this, action, context,
            `${ultCdBoostValue} * convertibleValue`,
            `${wgslTrue(r.ultBuff)}`,
          )
        },
      },
    ],
  }
}
