import i18next from 'i18next'
import { AbilityType } from 'lib/conditionals/conditionalConstants'
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
  CURRENT_DATA_VERSION,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

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
  } = Source.character('1306b1')

  const skillCdBuffScaling = skill(e, 0.24, 0.264)
  const skillCdBuffBase = skill(e, 0.45, 0.486)
  const cipherTalentStackBoost = ult(e, 0.06, 0.0648)
  const talentBaseStackBoost = talent(e, 0.04, 0.044)

  const basicScaling = basic(e, 1.00, 1.10)

  const defaults = {
    skillBuffs: false,
    cipherBuff: true,
    talentStacks: 3,
    teamAtkBuff: true,
    e1SpdBuff: true,
  }

  const teammateDefaults = {
    skillBuffs: true,
    cipherBuff: true,
    talentStacks: 3,
    teamAtkBuff: true,
    teammateCDValue: 2.5,
    e2DefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillBuffs: {
      id: 'skillBuffs',
      formItem: 'switch',
      text: 'Skill buffs',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    cipherBuff: {
      id: 'cipherBuff',
      formItem: 'switch',
      text: 'Cipher buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    talentStacks: {
      id: 'talentStacks',
      formItem: 'slider',
      text: 'Talent stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 3,
    },
    teamAtkBuff: {
      id: 'teamAtkBuff',
      formItem: 'switch',
      text: 'Team ATK buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1SpdBuff: {
      id: 'e1SpdBuff',
      formItem: 'switch',
      text: 'E1 SPD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillBuffs: content.skillBuffs,
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: 'Sparkle\'s combat CD',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 3.50,
      percent: true,
    },
    cipherBuff: content.cipherBuff,
    talentStacks: content.talentStacks,
    teamAtkBuff: content.teamAtkBuff,
    e2DefPen: {
      id: 'e2DefPen',
      formItem: 'switch',
      text: 'E2 DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
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

      if (r.skillBuffs) {
        x.CD.buff(skillCdBuffBase, SOURCE_SKILL)
        x.UNCONVERTIBLE_CD_BUFF.buff(skillCdBuffBase, SOURCE_SKILL)
      }

      x.SPD_P.buff((e >= 1 && r.e1SpdBuff) ? 0.15 : 0, SOURCE_E1)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Main damage type
      x.ATK_P.buffTeam(0.45, SOURCE_TRACE)
      x.ATK_P.buffTeam((e >= 1 && m.cipherBuff) ? 0.40 : 0, SOURCE_E1)

      x.RES_PEN.buff(m.skillBuffs ? 0.10 : 0, SOURCE_TRACE)

      x.VULNERABILITY.buffTeam(
        (m.cipherBuff)
          ? m.talentStacks * (talentBaseStackBoost + cipherTalentStackBoost)
          : m.talentStacks * talentBaseStackBoost,
        SOURCE_TALENT,
      )
      x.DEF_PEN.buffTeam((e >= 2 && m.e2DefPen) ? 0.10 * m.talentStacks : 0, SOURCE_E2)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const cdBuff = t.skillBuffs
        ? skillCdBuffBase + (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)) * t.teammateCDValue
        : 0
      if (e >= 6) {
        x.CD.buffTeam(cdBuff, SOURCE_SKILL)
        x.UNCONVERTIBLE_CD_BUFF.buffTeam(cdBuff, SOURCE_SKILL)
      } else {
        x.CD.buffSingle(cdBuff, SOURCE_SKILL)
        x.UNCONVERTIBLE_CD_BUFF.buffSingle(cdBuff, SOURCE_SKILL)
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
        condition: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.skillBuffs
        },
        effect: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(
            Stats.CD,
            Stats.CD,
            this,
            x,
            action,
            context,
            SOURCE_SKILL,
            (convertibleValue) => convertibleValue * (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)),
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.CD,
            Stats.CD,
            this,
            action,
            context,
            `${skillCdBuffScaling + (e >= 6 ? 0.30 : 0)} * convertibleValue`,
            `${wgslTrue(r.skillBuffs)}`,
          )
        },
      },
    ],
  }
}
