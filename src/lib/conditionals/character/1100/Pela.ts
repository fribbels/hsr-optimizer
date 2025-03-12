import { AbilityType, BASIC_DMG_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, standardAdditionalDmgAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Pela')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1106')

  const ultDefPenValue = ult(e, 0.40, 0.42)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const ultScaling = ult(e, 1.00, 1.08)

  const defaults = {
    teamEhrBuff: true,
    enemyDebuffed: true,
    skillRemovedBuff: false,
    ultDefPenDebuff: true,
    e4SkillResShred: true,
  }

  const teammateDefaults = {
    teamEhrBuff: true,
    ultDefPenDebuff: true,
    e4SkillResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    teamEhrBuff: {
      id: 'teamEhrBuff',
      formItem: 'switch',
      text: t('Content.teamEhrBuff.text'),
      content: t('Content.teamEhrBuff.content'),
    },
    enemyDebuffed: {
      id: 'enemyDebuffed',
      formItem: 'switch',
      text: t('Content.enemyDebuffed.text'),
      content: t('Content.enemyDebuffed.content'),
    },
    skillRemovedBuff: {
      id: 'skillRemovedBuff',
      formItem: 'switch',
      text: t('Content.skillRemovedBuff.text'),
      content: t('Content.skillRemovedBuff.content'),
    },
    ultDefPenDebuff: {
      id: 'ultDefPenDebuff',
      formItem: 'switch',
      text: t('Content.ultDefPenDebuff.text'),
      content: t('Content.ultDefPenDebuff.content', { ultDefPenValue: TsUtils.precisionRound(100 * ultDefPenValue) }),
    },
    e4SkillResShred: {
      id: 'e4SkillResShred',
      formItem: 'switch',
      text: t('Content.e4SkillResShred.text'),
      content: t('Content.e4SkillResShred.content'),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamEhrBuff: content.teamEhrBuff,
    ultDefPenDebuff: content.ultDefPenDebuff,
    e4SkillResShred: content.e4SkillResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.SPD_P.buff((e >= 2 && r.skillRemovedBuff) ? 0.10 : 0, SOURCE_E2)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      buffAbilityDmg(x, BASIC_DMG_TYPE | SKILL_DMG_TYPE | ULT_DMG_TYPE, (r.skillRemovedBuff) ? 0.20 : 0, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buff((r.enemyDebuffed) ? 0.20 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.enemyDebuffed) ? 0.40 : 0, SOURCE_TALENT)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.enemyDebuffed) ? 0.40 : 0, SOURCE_TALENT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.enemyDebuffed) ? 0.40 : 0, SOURCE_TALENT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.EHR.buffTeam((m.teamEhrBuff) ? 0.10 : 0, SOURCE_TRACE)

      x.DEF_PEN.buffTeam((m.ultDefPenDebuff) ? ultDefPenValue : 0, SOURCE_ULT)
      x.ICE_RES_PEN.buffTeam((e >= 4 && m.e4SkillResShred) ? 0.12 : 0, SOURCE_E4)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAdditionalDmgAtkFinalizer(),
  }
}
