import { AbilityType, ADDITIONAL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sushang')
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
  } = Source.character('1206')

  const talentSpdBuffValue = talent(e, 0.20, 0.21)
  const ultBuffedAtk = ult(e, 0.30, 0.324)
  const talentSpdBuffStacksMax = (e >= 6) ? 2 : 1

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const skillExtraHitScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 3.20, 3.456)

  const defaults = {
    ultBuffedState: true,
    e2DmgReductionBuff: true,
    skillExtraHits: 3,
    skillTriggerStacks: 10,
    talentSpdBuffStacks: talentSpdBuffStacksMax,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuffedState: {
      id: 'ultBuffedState',
      formItem: 'switch',
      text: t('Content.ultBuffedState.text'),
      content: t('Content.ultBuffedState.content', { ultBuffedAtk: TsUtils.precisionRound(100 * ultBuffedAtk) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content'),
      min: 0,
      max: 3,
    },
    skillTriggerStacks: {
      id: 'skillTriggerStacks',
      formItem: 'slider',
      text: t('Content.skillTriggerStacks.text'),
      content: t('Content.skillTriggerStacks.content'),
      min: 0,
      max: 10,
    },
    talentSpdBuffStacks: {
      id: 'talentSpdBuffStacks',
      formItem: 'slider',
      text: t('Content.talentSpdBuffStacks.text'),
      content: t('Content.talentSpdBuffStacks.content', { talentSpdBuffValue: TsUtils.precisionRound(100 * talentSpdBuffValue) }),
      min: 0,
      max: talentSpdBuffStacksMax,
    },
    e2DmgReductionBuff: {
      id: 'e2DmgReductionBuff',
      formItem: 'switch',
      text: t('Content.e2DmgReductionBuff.text'),
      content: t('Content.e2DmgReductionBuff.content'),
      disabled: e < 2,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.BE.buff((e >= 4) ? 0.40 : 0, SOURCE_E4)
      x.ATK_P.buff((r.ultBuffedState) ? ultBuffedAtk : 0, SOURCE_ULT)
      x.SPD_P.buff((r.talentSpdBuffStacks) * talentSpdBuffValue, SOURCE_TALENT)

      /*
       * Scaling
       * Trace only affects stance damage not skill damage - boost this based on proportion of stance : total skill dmg
       */
      const originalSkillScaling = skillScaling
      let stanceSkillScaling = 0
      stanceSkillScaling += (r.skillExtraHits >= 1) ? skillExtraHitScaling : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 2) ? skillExtraHitScaling * 0.5 : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 3) ? skillExtraHitScaling * 0.5 : 0

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(originalSkillScaling, SOURCE_SKILL)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff(stanceSkillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      // Boost
      buffAbilityDmg(x, ADDITIONAL_DMG_TYPE, r.skillTriggerStacks * 0.025, SOURCE_SKILL)
      x.DMG_RED_MULTI.multiply((e >= 2 && r.e2DmgReductionBuff) ? (1 - 0.20) : 1, SOURCE_E2)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => gpuStandardAdditionalDmgAtkFinalizer(),
  }
}
