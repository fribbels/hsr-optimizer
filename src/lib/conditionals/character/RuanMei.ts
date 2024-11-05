import { AbilityEidolon, Conditionals, ContentDefinition, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { RuanMeiConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
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

  const content: ContentDefinition<typeof defaults> = [
    {
      formItem: 'switch',
      id: 'skillOvertoneBuff',
      text: t('Content.skillOvertoneBuff.text'),
      content: t('Content.skillOvertoneBuff.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
    },
    {
      formItem: 'switch',
      id: 'teamBEBuff',
      text: t('Content.teamBEBuff.text'),
      content: t('Content.teamBEBuff.content'),
    },
    {
      formItem: 'switch',
      id: 'ultFieldActive',
      text: t('Content.ultFieldActive.text'),
      content: t('Content.ultFieldActive.content', { fieldResPenValue: TsUtils.precisionRound(100 * fieldResPenValue) }),
    },
    {
      formItem: 'switch',
      id: 'e2AtkBoost',
      text: t('Content.e2AtkBoost.text'),
      content: t('Content.e2AtkBoost.content'),
      disabled: (e < 2),
    },
    {
      formItem: 'switch',
      id: 'e4BeBuff',
      text: t('Content.e4BeBuff.text'),
      content: t('Content.e4BeBuff.content'),
      disabled: (e < 4),
    },
  ]

  const teammateContent: ContentDefinition<typeof teammateDefaults> = [
    findContentId(content, 'skillOvertoneBuff'),
    {
      formItem: 'switch',
      id: 'teamSpdBuff',
      text: t('TeammateContent.teamSpdBuff.text'),
      content: t('TeammateContent.teamSpdBuff.content', { talentSpdScaling: TsUtils.precisionRound(100 * talentSpdScaling) }),
    },
    findContentId(content, 'teamBEBuff'),
    {
      formItem: 'slider',
      id: 'teamDmgBuff',
      text: t('TeammateContent.teamDmgBuff.text'),
      content: t('TeammateContent.teamDmgBuff.content'),
      min: 0,
      max: 0.36,
      percent: true,
    },
    findContentId(content, 'ultFieldActive'),
    findContentId(content, 'e2AtkBoost'),
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({
      skillOvertoneBuff: true,
      teamBEBuff: true,
      ultFieldActive: true,
      e2AtkBoost: false,
      e4BeBuff: false,
    }),
    teammateDefaults: () => ({
      skillOvertoneBuff: true,
      teamSpdBuff: true,
      teamBEBuff: true,
      ultFieldActive: true,
      e2AtkBoost: false,
      teamDmgBuff: 0.36,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      // Stats
      x[Stats.ATK_P] += (e >= 2 && r.e2AtkBoost) ? 0.40 : 0
      x[Stats.BE] += (e >= 4 && r.e4BeBuff) ? 1.00 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.characterConditionals

      x[Stats.BE] += (m.teamBEBuff) ? 0.20 : 0

      x.ELEMENTAL_DMG += (m.skillOvertoneBuff) ? skillScaling : 0
      x.BREAK_EFFICIENCY_BOOST += (m.skillOvertoneBuff) ? 0.50 : 0

      x.RES_PEN += (m.ultFieldActive) ? fieldResPenValue : 0
      x.DEF_PEN += (e >= 1 && m.ultFieldActive) ? 0.20 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t: Conditionals<typeof teammateContent> = action.characterConditionals

      x[Stats.SPD_P] += (t.teamSpdBuff) ? talentSpdScaling : 0
      x.ELEMENTAL_DMG += t.teamDmgBuff

      x[Stats.ATK_P] += (e >= 2 && t.e2AtkBoost) ? 0.40 : 0
      x.RATIO_BASED_ATK_P_BUFF += (e >= 2 && t.e2AtkBoost) ? 0.40 : 0
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [RuanMeiConversionConditional],
  }
}
