import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Guinaifen')
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
  } = Source.character('1210')

  const talentDebuffDmgIncreaseValue = talent(e, 0.07, 0.076)
  const talentDebuffMax = (e >= 6) ? 4 : 3

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 1.20, 1.296)
  const dotScaling = skill(e, 2.182, 2.40)

  const defaults = {
    talentDebuffStacks: talentDebuffMax,
    enemyBurned: true,
    skillDot: true,
    e1EffectResShred: true,
    e2BurnMultiBoost: true,
  }

  const teammateDefaults = {
    talentDebuffStacks: talentDebuffMax,
    e1EffectResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentDebuffStacks: {
      id: 'talentDebuffStacks',
      formItem: 'slider',
      text: t('Content.talentDebuffStacks.text'),
      content: t('Content.talentDebuffStacks.content', {
        talentDebuffDmgIncreaseValue: TsUtils.precisionRound(talentDebuffDmgIncreaseValue),
        talentDebuffMax,
      }),
      min: 0,
      max: talentDebuffMax,
    },
    enemyBurned: {
      id: 'enemyBurned',
      formItem: 'switch',
      text: t('Content.enemyBurned.text'),
      content: t('Content.enemyBurned.content'),
    },
    skillDot: {
      id: 'skillDot',
      formItem: 'switch',
      text: t('Content.skillDot.text'),
      content: t('Content.skillDot.content'),
    },
    e1EffectResShred: {
      id: 'e1EffectResShred',
      formItem: 'switch',
      text: t('Content.e1EffectResShred.text'),
      content: t('Content.e1EffectResShred.content'),
      disabled: e < 1,
    },
    e2BurnMultiBoost: {
      id: 'e2BurnMultiBoost',
      formItem: 'switch',
      text: t('Content.e2BurnMultiBoost.text'),
      content: t('Content.e2BurnMultiBoost.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    talentDebuffStacks: content.talentDebuffStacks,
    e1EffectResShred: content.e1EffectResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.DOT_ATK_SCALING.buff(dotScaling, SOURCE_SKILL)
      x.DOT_ATK_SCALING.buff((e >= 2 && r.e2BurnMultiBoost) ? 0.40 : 0, SOURCE_E2)

      // Boost
      x.ELEMENTAL_DMG.buff((r.enemyBurned) ? 0.20 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.DOT_CHANCE.set(r.skillDot ? 1.00 : 0.80, r.skillDot ? SOURCE_SKILL : SOURCE_TRACE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam(m.talentDebuffStacks * talentDebuffDmgIncreaseValue, SOURCE_TALENT)
      x.EFFECT_RES_PEN.buffTeam((e >= 1 && m.e1EffectResShred) ? 0.10 : 0, SOURCE_E1)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}
