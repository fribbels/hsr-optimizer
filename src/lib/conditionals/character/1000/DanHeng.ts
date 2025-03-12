import { AbilityType, BASIC_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.DanHeng')
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
  } = Source.character('1002')

  const extraPenValue = talent(e, 0.36, 0.396)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.60, 2.86)
  const ultScaling = ult(e, 4.00, 4.32)
  const ultExtraScaling = ult(e, 1.20, 1.296)

  const defaults = {
    talentPenBuff: true,
    enemySlowed: true,
    spdBuff: true,
    e1EnemyHp50: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentPenBuff: {
      id: 'talentPenBuff',
      formItem: 'switch',
      text: t('Content.talentPenBuff.text'),
      content: t('Content.talentPenBuff.content', { extraPenValue: TsUtils.precisionRound(100 * extraPenValue) }),
    },
    enemySlowed: {
      id: 'enemySlowed',
      formItem: 'switch',
      text: t('Content.enemySlowed.text'),
      content: t('Content.enemySlowed.content'),
    },
    spdBuff: {
      id: 'spdBuff',
      formItem: 'switch',
      text: t('Content.spdBuff.text'),
      content: t('Content.spdBuff.content'),
    },
    e1EnemyHp50: {
      id: 'e1EnemyHp50',
      formItem: 'switch',
      text: t('Content.e1EnemyHp50.text'),
      content: t('Content.e1EnemyHp50.content'),
      disabled: e < 1,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((e >= 1 && r.e1EnemyHp50) ? 0.12 : 0, SOURCE_E1)
      x.SPD_P.buff((r.spdBuff) ? 0.20 : 0, SOURCE_TRACE)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff((r.enemySlowed) ? ultExtraScaling : 0, SOURCE_ULT)

      // Boost
      x.RES_PEN.buff((r.talentPenBuff) ? extraPenValue : 0, SOURCE_TALENT)
      buffAbilityDmg(x, BASIC_DMG_TYPE, (r.enemySlowed) ? 0.40 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}
