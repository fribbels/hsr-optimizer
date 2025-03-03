import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Misha')
  const { basic, skill, ult } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1312')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  let ultStackScaling = ult(e, 0.60, 0.65)
  ultStackScaling += (e >= 4 ? 0.06 : 0)

  const defaults = {
    ultHitsOnTarget: 10,
    enemyFrozen: true,
    e2DefReduction: true,
    e6UltDmgBoost: true,
  }

  const teammateDefaults = {
    e2DefReduction: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultHitsOnTarget: {
      id: 'ultHitsOnTarget',
      formItem: 'slider',
      text: t('Content.ultHitsOnTarget.text'),
      content: t('Content.ultHitsOnTarget.content', { ultStackScaling: TsUtils.precisionRound(100 * ultStackScaling) }),
      min: 1,
      max: 10,
    },
    enemyFrozen: {
      id: 'enemyFrozen',
      formItem: 'switch',
      text: t('Content.enemyFrozen.text'),
      content: t('Content.enemyFrozen.content'),
    },
    e2DefReduction: {
      id: 'e2DefReduction',
      formItem: 'switch',
      text: t('Content.e2DefReduction.text'),
      content: t('Content.e2DefReduction.content'),
      disabled: e < 2,
    },
    e6UltDmgBoost: {
      id: 'e6UltDmgBoost',
      formItem: 'switch',
      text: t('Content.e6UltDmgBoost.text'),
      content: t('Content.e6UltDmgBoost.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e2DefReduction: content.e2DefReduction,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CD.buff((r.enemyFrozen) ? 0.30 : 0, SOURCE_TRACE)

      x.ELEMENTAL_DMG.buff((e >= 6 && r.e6UltDmgBoost) ? 0.30 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultStackScaling * (r.ultHitsOnTarget), SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(10 + 5 * (r.ultHitsOnTarget - 1), SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.DEF_PEN.buffTeam((e >= 2 && m.e2DefReduction) ? 0.16 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {},
    gpuFinalizeCalculations: () => '',
  }
}
