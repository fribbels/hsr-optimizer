import { gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Serval')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const talentExtraDmgScaling = talent(e, 0.72, 0.792)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.40, 1.54)
  const ultScaling = ult(e, 1.80, 1.944)
  const dotScaling = skill(e, 1.04, 1.144)

  const defaults = {
    targetShocked: true,
    enemyDefeatedBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetShocked: {
      id: 'targetShocked',
      formItem: 'switch',
      text: t('Content.targetShocked.text'),
      content: t('Content.targetShocked.content', { talentExtraDmgScaling: TsUtils.precisionRound(100 * talentExtraDmgScaling) }),
    },
    enemyDefeatedBuff: {
      id: 'enemyDefeatedBuff',
      formItem: 'switch',
      text: t('Content.enemyDefeatedBuff.text'),
      content: t('Content.enemyDefeatedBuff.content'),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((r.enemyDefeatedBuff) ? 0.20 : 0, Source.NONE)

      // Scaling;
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.DOT_SCALING.buff(dotScaling, Source.NONE)

      x.BASIC_SCALING.buff((r.targetShocked) ? talentExtraDmgScaling : 0, Source.NONE)
      x.SKILL_SCALING.buff((r.targetShocked) ? talentExtraDmgScaling : 0, Source.NONE)
      x.ULT_SCALING.buff((r.targetShocked) ? talentExtraDmgScaling : 0, Source.NONE)

      // Boost
      x.ELEMENTAL_DMG.buff((e >= 6 && r.targetShocked) ? 0.30 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)

      x.DOT_CHANCE.set(0.65, Source.NONE)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
