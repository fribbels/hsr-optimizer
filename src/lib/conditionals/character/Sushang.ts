import { Stats } from 'lib/constants'
import { ComputedStatsObject, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sushang')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const talentSpdBuffValue = talent(e, 0.20, 0.21)
  const ultBuffedAtk = ult(e, 0.30, 0.324)
  const talentSpdBuffStacksMax = (e >= 6) ? 2 : 1

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const skillExtraHitScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 3.20, 3.456)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'ultBuffedState',
    name: 'ultBuffedState',
    text: t('Content.ultBuffedState.text'),
    title: t('Content.ultBuffedState.title'),
    content: t('Content.ultBuffedState.content', { ultBuffedAtk: TsUtils.precisionRound(100 * ultBuffedAtk) }),
  }, {
    formItem: 'slider',
    id: 'skillExtraHits',
    name: 'skillExtraHits',
    text: t('Content.skillExtraHits.text'),
    title: t('Content.skillExtraHits.title'),
    content: t('Content.skillExtraHits.content'),
    min: 0,
    max: 3,
  }, {
    formItem: 'slider',
    id: 'skillTriggerStacks',
    name: 'skillTriggerStacks',
    text: t('Content.skillTriggerStacks.text'),
    title: t('Content.skillTriggerStacks.title'),
    content: t('Content.skillTriggerStacks.content'),
    min: 0,
    max: 10,
  }, {
    formItem: 'slider',
    id: 'talentSpdBuffStacks',
    name: 'talentSpdBuffStacks',
    text: t('Content.talentSpdBuffStacks.text'),
    title: t('Content.talentSpdBuffStacks.title'),
    content: t('Content.talentSpdBuffStacks.content', { talentSpdBuffValue: TsUtils.precisionRound(100 * talentSpdBuffValue) }),
    min: 0,
    max: talentSpdBuffStacksMax,
  },
  {
    formItem: 'switch',
    id: 'e2DmgReductionBuff',
    name: 'e2DmgReductionBuff',
    text: t('Content.e2DmgReductionBuff.text'),
    title: t('Content.e2DmgReductionBuff.title'),
    content: t('Content.e2DmgReductionBuff.content'),
    disabled: e < 2,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      ultBuffedState: true,
      e2DmgReductionBuff: true,
      skillExtraHits: 3,
      skillTriggerStacks: 10,
      talentSpdBuffStacks: talentSpdBuffStacksMax,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.BE] += (e >= 4) ? 0.40 : 0
      x[Stats.ATK_P] += (r.ultBuffedState) ? ultBuffedAtk : 0
      x[Stats.SPD_P] += (r.talentSpdBuffStacks) * talentSpdBuffValue

      /*
       * Scaling
       * Trace only affects stance damage not skill damage - boost this based on proportion of stance : total skill dmg
       */
      const originalSkillScaling = skillScaling
      let stanceSkillScaling = 0
      stanceSkillScaling += (r.skillExtraHits >= 1) ? skillExtraHitScaling : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 2) ? skillExtraHitScaling * 0.5 : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 3) ? skillExtraHitScaling * 0.5 : 0
      const stanceScalingProportion = stanceSkillScaling / (stanceSkillScaling + originalSkillScaling)

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += originalSkillScaling
      x.SKILL_SCALING += stanceSkillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      buffAbilityDmg(x, SKILL_TYPE, r.skillTriggerStacks * 0.025 * stanceScalingProportion)
      x.DMG_RED_MULTI *= (e >= 2 && r.e2DmgReductionBuff) ? (1 - 0.20) : 1

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
