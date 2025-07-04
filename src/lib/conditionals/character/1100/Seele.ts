import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  gpuStandardAdditionalDmgAtkFinalizer,
  standardAdditionalDmgAtkFinalizer,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Seele')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1102')

  const buffedStateDmgBuff = talent(e, 0.80, 0.88)
  const speedBoostStacksMax = e >= 2 ? 2 : 1

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.20, 2.42)
  const ultScaling = ult(e, 4.25, 4.59)

  const defaults = {
    buffedState: true,
    speedBoostStacks: speedBoostStacksMax,
    e1EnemyHp80CrBoost: false,
    e6UltTargetDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    buffedState: {
      id: 'buffedState',
      formItem: 'switch',
      text: t('Content.buffedState.text'),
      content: t('Content.buffedState.content', { buffedStateDmgBuff: TsUtils.precisionRound(100 * buffedStateDmgBuff) }),
    },
    speedBoostStacks: {
      id: 'speedBoostStacks',
      formItem: 'slider',
      text: t('Content.speedBoostStacks.text'),
      content: t('Content.speedBoostStacks.content'),
      min: 0,
      max: speedBoostStacksMax,
    },
    e1EnemyHp80CrBoost: {
      id: 'e1EnemyHp80CrBoost',
      formItem: 'switch',
      text: t('Content.e1EnemyHp80CrBoost.text'),
      content: t('Content.e1EnemyHp80CrBoost.content'),
      disabled: e < 1,
    },
    e6UltTargetDebuff: {
      id: 'e6UltTargetDebuff',
      formItem: 'switch',
      text: t('Content.e6UltTargetDebuff.text'),
      content: t('Content.e6UltTargetDebuff.content'),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((e >= 1 && r.e1EnemyHp80CrBoost) ? 0.15 : 0, SOURCE_E1)
      x.SPD_P.buff(0.25 * r.speedBoostStacks, SOURCE_SKILL)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.BASIC_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.a[Key.ULT_ATK_SCALING] : 0, Source.NONE)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.a[Key.ULT_ATK_SCALING] : 0, Source.NONE)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((e >= 6 && r.e6UltTargetDebuff) ? 0.15 * x.a[Key.ULT_ATK_SCALING] : 0, Source.NONE)

      // Boost
      x.ELEMENTAL_DMG.buff((r.buffedState) ? buffedStateDmgBuff : 0, SOURCE_TALENT)
      x.RES_PEN.buff((r.buffedState) ? 0.20 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      // TODO: Seele's E6 should have a teammate effect but its kinda hard to calc
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuStandardAdditionalDmgAtkFinalizer(),
  }
}
