import { DOT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sampo')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const dotVulnerabilityValue = ult(e, 0.30, 0.32)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.56, 0.616)
  const ultScaling = ult(e, 1.60, 1.728)
  const dotScaling = talent(e, 0.52, 0.572)

  const maxExtraHits = e < 1 ? 4 : 5
  const defaults = {
    targetDotTakenDebuff: true,
    skillExtraHits: maxExtraHits,
    targetWindShear: true,
  }

  const teammateDefaults = {
    targetDotTakenDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetDotTakenDebuff: {
      id: 'targetDotTakenDebuff',
      formItem: 'switch',
      text: t('Content.targetDotTakenDebuff.text'),
      content: t('Content.targetDotTakenDebuff.content', { dotVulnerabilityValue: TsUtils.precisionRound(100 * dotVulnerabilityValue) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content'),
      min: 1,
      max: maxExtraHits,
    },
    targetWindShear: {
      id: 'targetWindShear',
      formItem: 'switch',
      text: t('Content.targetWindShear.text'),
      content: t('Content.targetWindShear.content'),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetDotTakenDebuff: content.targetDotTakenDebuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.SKILL_SCALING.buff((r.skillExtraHits) * skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.DOT_SCALING.buff(dotScaling, Source.NONE)
      x.DOT_SCALING.buff((e >= 6) ? 0.15 : 0, Source.NONE)

      // Boost
      x.DMG_RED_MULTI.multiply((r.targetWindShear) ? (1 - 0.15) : 1, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(30 + 15 * r.skillExtraHits, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)

      x.DOT_CHANCE.set(0.65, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, DOT_DMG_TYPE, (m.targetDotTakenDebuff) ? dotVulnerabilityValue : 0, Source.NONE, Target.TEAM)
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
