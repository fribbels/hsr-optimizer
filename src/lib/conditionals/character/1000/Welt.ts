import { gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Welt')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const skillExtraHitsMax = (e >= 6) ? 3 : 2

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.72, 0.792)
  const ultScaling = ult(e, 1.50, 1.62)
  const talentScaling = talent(e, 0.60, 0.66)

  const content: ContentDefinition<typeof defaults> = {
    enemyDmgTakenDebuff: {
      id: 'enemyDmgTakenDebuff',
      formItem: 'switch',
      text: t('Content.enemyDmgTakenDebuff.text'),
      content: t('Content.enemyDmgTakenDebuff.content'),
    },
    enemySlowed: {
      id: 'enemySlowed',
      formItem: 'switch',
      text: t('Content.enemySlowed.text'),
      content: t('Content.enemySlowed.content', { talentScaling: TsUtils.precisionRound(100 * talentScaling) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
      min: 0,
      max: skillExtraHitsMax,
    },
    e1EnhancedState: {
      id: 'e1EnhancedState',
      formItem: 'switch',
      text: t('Content.e1EnhancedState.text'),
      content: t('Content.e1EnhancedState.content'),
      disabled: (e < 1),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    enemyDmgTakenDebuff: content.enemyDmgTakenDebuff,
  }

  const defaults = {
    enemySlowed: true,
    enemyDmgTakenDebuff: true,
    skillExtraHits: skillExtraHitsMax,
    e1EnhancedState: true,
  }

  const teammateDefaults = {
    enemyDmgTakenDebuff: true,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ELEMENTAL_DMG.buff((x.a[Key.ENEMY_WEAKNESS_BROKEN]) ? 0.20 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)

      x.BASIC_SCALING.buff((r.enemySlowed) ? talentScaling : 0, Source.NONE)
      x.SKILL_SCALING.buff((r.enemySlowed) ? talentScaling : 0, Source.NONE)
      x.ULT_SCALING.buff((r.enemySlowed) ? talentScaling : 0, Source.NONE)

      x.BASIC_SCALING.buff((e >= 1 && r.e1EnhancedState) ? 0.50 * basicScaling : 0, Source.NONE)
      x.SKILL_SCALING.buff((e >= 1 && r.e1EnhancedState) ? 0.80 * skillScaling : 0, Source.NONE)

      x.SKILL_SCALING.buff(r.skillExtraHits * skillScaling, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(30 + 30 * r.skillExtraHits, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buff((m.enemyDmgTakenDebuff) ? 0.12 : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
