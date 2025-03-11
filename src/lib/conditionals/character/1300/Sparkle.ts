import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, countTeamElement } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, ElementNames, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sparkle')
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
  } = Source.character('1306')

  const skillCdBuffScaling = skill(e, 0.24, 0.264)
  const skillCdBuffBase = skill(e, 0.45, 0.486)
  const cipherTalentStackBoost = ult(e, 0.10, 0.108)
  const talentBaseStackBoost = talent(e, 0.06, 0.066)

  const basicScaling = basic(e, 1.00, 1.10)

  const atkBoostByQuantumAllies: Record<number, number> = {
    0: 0,
    1: 0.05,
    2: 0.15,
    3: 0.30,
    4: 0.30,
  }

  const defaults = {
    skillCdBuff: false,
    cipherBuff: true,
    talentStacks: 3,
    quantumAlliesAtkBuff: true,
  }

  const teammateDefaults = {
    ...defaults,
    ...{
      skillCdBuff: true,
      teammateCDValue: 2.5,
    },
  }

  const content: ContentDefinition<typeof defaults> = {
    skillCdBuff: {
      id: 'skillCdBuff',
      formItem: 'switch',
      text: t('Content.skillCdBuff.text'),
      content: t('Content.skillCdBuff.content', {
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
      }),
    },
    cipherBuff: {
      id: 'cipherBuff',
      formItem: 'switch',
      text: t('Content.cipherBuff.text'),
      content: t('Content.cipherBuff.content', { cipherTalentStackBoost: TsUtils.precisionRound(100 * cipherTalentStackBoost) }),
    },
    talentStacks: {
      id: 'talentStacks',
      formItem: 'slider',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', { talentBaseStackBoost: TsUtils.precisionRound(100 * talentBaseStackBoost) }),
      min: 0,
      max: 3,
    },
    quantumAlliesAtkBuff: {
      id: 'quantumAlliesAtkBuff',
      formItem: 'switch',
      text: t('Content.quantumAlliesAtkBuff.text'),
      content: t('Content.quantumAlliesAtkBuff.content'),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillCdBuff: content.skillCdBuff,
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t('TeammateContent.teammateCDValue.content', {
        skillCdBuffScaling: TsUtils.precisionRound(100 * skillCdBuffScaling),
        skillCdBuffBase: TsUtils.precisionRound(100 * skillCdBuffBase),
      }),
      min: 0,
      max: 3.50,
      percent: true,
    },
    cipherBuff: content.cipherBuff,
    talentStacks: content.talentStacks,
    quantumAlliesAtkBuff: content.quantumAlliesAtkBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      if (r.skillCdBuff) {
        x.CD.buff(skillCdBuffBase, SOURCE_SKILL)
        x.UNCONVERTIBLE_CD_BUFF.buff(skillCdBuffBase, SOURCE_SKILL)
      }
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Main damage type
      x.ATK_P.buffTeam(0.15, SOURCE_TRACE)
      x.ATK_P.buffDual(context.element == ElementNames.Quantum && m.quantumAlliesAtkBuff
        ? atkBoostByQuantumAllies[countTeamElement(context, ElementNames.Quantum)]
        : 0, SOURCE_TRACE)
      x.ATK_P.buffTeam((e >= 1 && m.cipherBuff) ? 0.40 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buffTeam(
        (m.cipherBuff)
          ? m.talentStacks * (talentBaseStackBoost + cipherTalentStackBoost)
          : m.talentStacks * talentBaseStackBoost,
        SOURCE_TALENT)
      x.DEF_PEN.buffTeam((e >= 2) ? 0.08 * m.talentStacks : 0, SOURCE_E2)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      if (e >= 6) {
        x.CD.buffTeam(
          (t.skillCdBuff)
            ? skillCdBuffBase + (skillCdBuffScaling + 0.30) * t.teammateCDValue
            : 0,
          SOURCE_SKILL)
        x.UNCONVERTIBLE_CD_BUFF.buffTeam(
          (t.skillCdBuff)
            ? skillCdBuffBase + (skillCdBuffScaling + 0.30) * t.teammateCDValue
            : 0,
          SOURCE_SKILL)
      } else {
        x.CD.buffSingle(
          (t.skillCdBuff)
            ? skillCdBuffBase + (skillCdBuffScaling) * t.teammateCDValue
            : 0,
          SOURCE_SKILL)
        x.UNCONVERTIBLE_CD_BUFF.buffSingle(
          (t.skillCdBuff)
            ? skillCdBuffBase + (skillCdBuffScaling) * t.teammateCDValue
            : 0,
          SOURCE_SKILL)
      }
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
    },
    gpuFinalizeCalculations: () => '',
    dynamicConditionals: [
      {
        id: 'SparkleCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.skillCdBuff
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.CD, Stats.CD, this, x, action, context,
            (convertibleValue) => convertibleValue * (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)),
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.CD, Stats.CD, this, action, context,
            `${skillCdBuffScaling + (e >= 6 ? 0.30 : 0)} * convertibleValue`,
            `${wgslTrue(r.skillCdBuff)}`,
          )
        },
      },
    ],
  }
}
