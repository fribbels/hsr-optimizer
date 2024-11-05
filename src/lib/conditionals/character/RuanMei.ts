import { AbilityEidolon, Conditionals, ContentDefinition, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { RuanMeiConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.RuanMei')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const fieldResPenValue = ult(e, 0.25, 0.27)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.32, 0.352)
  const talentSpdScaling = talent(e, 0.10, 0.104)

  const defaults = {
    skillOvertoneBuff: true,
    teamBEBuff: true,
    ultFieldActive: true,
    e2AtkBoost: false,
    e4BeBuff: false,
  }

  const teammateDefaults = {
    skillOvertoneBuff: true,
    teamSpdBuff: true,
    teamBEBuff: true,
    ultFieldActive: true,
    e2AtkBoost: false,
    teamDmgBuff: 0.36,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillOvertoneBuff: {
      formItem: 'switch',
      id: 'skillOvertoneBuff',
      text: t('Content.skillOvertoneBuff.text'),
      content: t('Content.skillOvertoneBuff.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
    },
    teamBEBuff: {
      formItem: 'switch',
      id: 'teamBEBuff',
      text: t('Content.teamBEBuff.text'),
      content: t('Content.teamBEBuff.content'),
    },
    ultFieldActive: {
      formItem: 'switch',
      id: 'ultFieldActive',
      text: t('Content.ultFieldActive.text'),
      content: t('Content.ultFieldActive.content', { fieldResPenValue: TsUtils.precisionRound(100 * fieldResPenValue) }),
    },
    e2AtkBoost: {
      formItem: 'switch',
      id: 'e2AtkBoost',
      text: t('Content.e2AtkBoost.text'),
      content: t('Content.e2AtkBoost.content'),
      disabled: (e < 2),
    },
    e4BeBuff: {
      formItem: 'switch',
      id: 'e4BeBuff',
      text: t('Content.e4BeBuff.text'),
      content: t('Content.e4BeBuff.content'),
      disabled: (e < 4),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillOvertoneBuff: content.skillOvertoneBuff,
    teamSpdBuff: {
      formItem: 'switch',
      id: 'teamSpdBuff',
      text: t('TeammateContent.teamSpdBuff.text'),
      content: t('TeammateContent.teamSpdBuff.content', { talentSpdScaling: TsUtils.precisionRound(100 * talentSpdScaling) }),
    },
    teamBEBuff: content.teamBEBuff,
    teamDmgBuff: {
      formItem: 'slider',
      id: 'teamDmgBuff',
      text: t('TeammateContent.teamDmgBuff.text'),
      content: t('TeammateContent.teamDmgBuff.content'),
      min: 0,
      max: 0.36,
      percent: true,
    },
    ultFieldActive: content.ultFieldActive,
    e2AtkBoost: content.e2AtkBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      // Stats
      x.ATK_P.buff((e >= 2 && r.e2AtkBoost) ? 0.40 : 0, Source.NONE)
      x.BE.buff((e >= 4 && r.e4BeBuff) ? 1.00 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.characterConditionals

      x.BE.buff((m.teamBEBuff) ? 0.20 : 0, Source.NONE)

      x.ELEMENTAL_DMG.buff((m.skillOvertoneBuff) ? skillScaling : 0, Source.NONE)
      x.BREAK_EFFICIENCY_BOOST.buff((m.skillOvertoneBuff) ? 0.50 : 0, Source.NONE)

      x.RES_PEN.buff((m.ultFieldActive) ? fieldResPenValue : 0, Source.NONE)
      x.DEF_PEN.buff((e >= 1 && m.ultFieldActive) ? 0.20 : 0, Source.NONE)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t: Conditionals<typeof teammateContent> = action.characterConditionals

      x.SPD_P.buff((t.teamSpdBuff) ? talentSpdScaling : 0, Source.NONE)
      x.ELEMENTAL_DMG.buff(t.teamDmgBuff, Source.NONE)

      x.ATK_P.buff((e >= 2 && t.e2AtkBoost) ? 0.40 : 0, Source.NONE)
      x.RATIO_BASED_ATK_P_BUFF.buff((e >= 2 && t.e2AtkBoost) ? 0.40 : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [RuanMeiConversionConditional],
  }
}
