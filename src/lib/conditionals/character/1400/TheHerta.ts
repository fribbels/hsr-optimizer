import i18next from 'i18next'
import { gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TheHerta')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.70, 0.77)
  const enhancedSkillScaling = skill(e, 0.80, 0.88)
  const enhancedSkillAoeScaling = skill(e, 0.40, 0.44)
  const talentStackScaling = talent(e, 0.08, 0.088)

  const ultScaling = ult(e, 2.00, 2.20)
  const ultAtkBuffScaling = ult(e, 0.64, 0.704)

  const defaults = {
    enhancedSkill: true,
    eruditionTeammate: true,
    ultAtkBuff: true,
    interpretationStacks: 42,
    totalInterpretationStacks: 99,
    e1AdjacentStacks: 21,
    e4EruditionSpdBuff: true,
    e6MultiplierBuff: true,
  }

  const teammateDefaults = {
    eruditionTeammate: true,
    e4EruditionSpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedSkill: {
      id: 'enhancedSkill',
      formItem: 'switch',
      text: 'Enhanced Skill',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    eruditionTeammate: {
      id: 'eruditionTeammate',
      formItem: 'switch',
      text: 'Erudition teammate',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    ultAtkBuff: {
      id: 'ultAtkBuff',
      formItem: 'switch',
      text: 'Ult ATK buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    interpretationStacks: {
      id: 'interpretationStacks',
      formItem: 'slider',
      text: 'Interpretation stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 1,
      max: 42,
    },
    totalInterpretationStacks: {
      id: 'totalInterpretationStacks',
      formItem: 'slider',
      text: 'Total stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 1,
      max: 99,
    },
    e1AdjacentStacks: {
      id: 'e1AdjacentStacks',
      formItem: 'slider',
      text: 'E1 adjacent stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 1,
      max: 42,
      disabled: e < 1,
    },
    e4EruditionSpdBuff: {
      id: 'e4EruditionSpdBuff',
      formItem: 'switch',
      text: 'E4 Erudition SPD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
    e6MultiplierBuff: {
      id: 'e6MultiplierBuff',
      formItem: 'switch',
      text: 'E6 Ult multiplier boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    eruditionTeammate: content.eruditionTeammate,
    e4EruditionSpdBuff: content.e4EruditionSpdBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ATK_P.buff((r.ultAtkBuff) ? ultAtkBuffScaling : 0, Source.NONE)

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling + r.totalInterpretationStacks * (e >= 6 && r.e6MultiplierBuff ? 0.05 : 0.01), Source.NONE)

      const enhancedSkillStackScaling = talentStackScaling
        * (r.interpretationStacks + (e >= 1 ? r.interpretationStacks + r.e1AdjacentStacks : 0) * 0.30)
        * (r.eruditionTeammate ? 2 : 1)
      x.SKILL_SCALING.buff((r.enhancedSkill ? enhancedSkillScaling * 3 + enhancedSkillStackScaling + enhancedSkillAoeScaling : skillScaling * 3), Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff((r.enhancedSkill) ? 75 : 60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.CD.buff((m.eruditionTeammate ? 0.80 : 0), Source.NONE)
      x.SPD_P.buff((e >= 4 && m.e4EruditionSpdBuff && m.eruditionTeammate) ? 0.10 : 0, Source.NONE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardAtkFinalizer()
    },
  }
}
