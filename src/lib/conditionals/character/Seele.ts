import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Seele')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const buffedStateDmgBuff = talent(e, 0.80, 0.88)
  const speedBoostStacksMax = (e >= 2 ? 2 : 1)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.20, 2.42)
  const ultScaling = ult(e, 4.25, 4.59)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'buffedState',
    name: 'buffedState',
    text: t('Content.buffedState.text'),
    title: t('Content.buffedState.title'),
    content: t('Content.buffedState.content', { buffedStateDmgBuff: TsUtils.precisionRound(100 * buffedStateDmgBuff) }),
  }, {
    formItem: 'slider',
    id: 'speedBoostStacks',
    name: 'speedBoostStacks',
    text: t('Content.speedBoostStacks.text'),
    title: t('Content.speedBoostStacks.title'),
    content: t('Content.speedBoostStacks.content', { speedBoostStacksMax: speedBoostStacksMax }),
    min: 0,
    max: speedBoostStacksMax,
  }, {
    formItem: 'switch',
    id: 'e1EnemyHp80CrBoost',
    name: 'e1EnemyHp80CrBoost',
    text: t('Content.e1EnemyHp80CrBoost.text'),
    title: t('Content.e1EnemyHp80CrBoost.title'),
    content: t('Content.e1EnemyHp80CrBoost.content'),
    disabled: e < 1,
  }, {
    formItem: 'switch',
    id: 'e6UltTargetDebuff',
    name: 'e6UltTargetDebuff',
    text: t('Content.e6UltTargetDebuff.text'),
    title: t('Content.e6UltTargetDebuff.title'),
    content: t('Content.e6UltTargetDebuff.content'),
    disabled: e < 6,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      buffedState: true,
      speedBoostStacks: speedBoostStacksMax,
      e1EnemyHp80CrBoost: false,
      e6UltTargetDebuff: true,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.CR] += (e >= 1 && r.e1EnemyHp80CrBoost) ? 0.15 : 0
      x[Stats.SPD_P] += 0.25 * r.speedBoostStacks

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.ELEMENTAL_DMG += (r.buffedState) ? buffedStateDmgBuff : 0
      x.RES_PEN += (r.buffedState) ? 0.20 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      // TODO: Seele's E6 should have a teammate effect but its kinda hard to calc
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      x.BASIC_DMG += (e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.ULT_DMG : 0
      x.SKILL_DMG += (e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.ULT_DMG : 0
      x.ULT_DMG += (e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.ULT_DMG : 0
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;

if (${wgslTrue(e >= 6 && r.e6UltTargetDebuff)}) {
  x.BASIC_DMG += 0.15 * x.ULT_DMG;
  x.SKILL_DMG += 0.15 * x.ULT_DMG;
  x.ULT_DMG += 0.15 * x.ULT_DMG;
}
    `
    },
  }
}
