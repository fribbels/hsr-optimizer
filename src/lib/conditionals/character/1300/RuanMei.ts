import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.RuanMei')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1303')

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
      id: 'skillOvertoneBuff',
      formItem: 'switch',
      text: t('Content.skillOvertoneBuff.text'),
      content: t('Content.skillOvertoneBuff.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
    },
    teamBEBuff: {
      id: 'teamBEBuff',
      formItem: 'switch',
      text: t('Content.teamBEBuff.text'),
      content: t('Content.teamBEBuff.content'),
    },
    ultFieldActive: {
      id: 'ultFieldActive',
      formItem: 'switch',
      text: t('Content.ultFieldActive.text'),
      content: t('Content.ultFieldActive.content', { fieldResPenValue: TsUtils.precisionRound(100 * fieldResPenValue) }),
    },
    e2AtkBoost: {
      id: 'e2AtkBoost',
      formItem: 'switch',
      text: t('Content.e2AtkBoost.text'),
      content: t('Content.e2AtkBoost.content'),
      disabled: (e < 2),
    },
    e4BeBuff: {
      id: 'e4BeBuff',
      formItem: 'switch',
      text: t('Content.e4BeBuff.text'),
      content: t('Content.e4BeBuff.content'),
      disabled: (e < 4),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillOvertoneBuff: content.skillOvertoneBuff,
    teamSpdBuff: {
      id: 'teamSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.teamSpdBuff.text'),
      content: t('TeammateContent.teamSpdBuff.content', { talentSpdScaling: TsUtils.precisionRound(100 * talentSpdScaling) }),
    },
    teamBEBuff: content.teamBEBuff,
    teamDmgBuff: {
      id: 'teamDmgBuff',
      formItem: 'slider',
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
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((e >= 2 && r.e2AtkBoost) ? 0.40 : 0, SOURCE_E2)
      x.BE.buff((e >= 4 && r.e4BeBuff) ? 1.00 : 0, SOURCE_E4)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.BE.buffTeam((m.teamBEBuff) ? 0.20 : 0, SOURCE_TRACE)

      x.ELEMENTAL_DMG.buffTeam((m.skillOvertoneBuff) ? skillScaling : 0, SOURCE_SKILL)
      x.BREAK_EFFICIENCY_BOOST.buffTeam((m.skillOvertoneBuff) ? 0.50 : 0, SOURCE_SKILL)

      x.RES_PEN.buffTeam((m.ultFieldActive) ? fieldResPenValue : 0, SOURCE_ULT)
      x.DEF_PEN.buffTeam((e >= 1 && m.ultFieldActive) ? 0.20 : 0, SOURCE_E1)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD_P.buffTeam((t.teamSpdBuff) ? talentSpdScaling : 0, SOURCE_TALENT)
      x.ELEMENTAL_DMG.buffTeam(t.teamDmgBuff, SOURCE_TRACE)

      x.ATK_P_BOOST.buffTeam((e >= 2 && t.e2AtkBoost) ? 0.40 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const beOver = Math.floor(TsUtils.precisionRound((x.a[Key.BE] * 100 - 120) / 10))
      const buffValue = Math.min(0.36, Math.max(0, beOver) * 0.06)
      x.ELEMENTAL_DMG.buff(buffValue, SOURCE_TRACE)
    },
    gpuFinalizeCalculations: () => {
      return `
let beOver = (x.BE * 100 - 120) / 10;
let buffValue: f32 = min(0.36, floor(max(0, beOver)) * 0.06);
x.ELEMENTAL_DMG += buffValue;
      `
    },
  }
}
