import { BASIC_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Pela')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

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
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.SPD_P.buff((e >= 2 && r.skillRemovedBuff) ? 0.10 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)

      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE | ULT_TYPE, (r.skillRemovedBuff) ? 0.20 : 0, Source.NONE)
      x.ELEMENTAL_DMG.buff((r.enemyDebuffed) ? 0.20 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.EHR.buff((m.teamEhrBuff) ? 0.10 : 0, Source.NONE)

      x.DEF_PEN.buff((m.ultDefPenDebuff) ? ultDefPenValue : 0, Source.NONE)
      x.ICE_RES_PEN.buff((e >= 4 && m.e4SkillResShred) ? 0.12 : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.ATK], Source.NONE)
      x.SKILL_DMG.buff(x.a[Key.SKILL_SCALING] * x.a[Key.ATK], Source.NONE)
      x.ULT_DMG.buff(x.a[Key.ULT_SCALING] * x.a[Key.ATK], Source.NONE)

      x.BASIC_DMG.buff((e >= 6) ? 0.40 * x.a[Key.ATK] : 0, Source.NONE)
      x.SKILL_DMG.buff((e >= 6) ? 0.40 * x.a[Key.ATK] : 0, Source.NONE)
      x.ULT_DMG.buff((e >= 6) ? 0.40 * x.a[Key.ATK] : 0, Source.NONE)
    },
    gpuFinalizeCalculations: () => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;

if (${wgslTrue(e >= 6)}) {
  x.BASIC_DMG += 0.40 * x.ATK;
  x.SKILL_DMG += 0.40 * x.ATK;
  x.ULT_DMG += 0.40 * x.ATK;
}
    `
    },
  }
}
