import { ComputedStatsObject, DOT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sampo')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const dotVulnerabilityValue = ult(e, 0.30, 0.32)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.56, 0.616)
  const ultScaling = ult(e, 1.60, 1.728)
  const dotScaling = talent(e, 0.52, 0.572)

  const maxExtraHits = e < 1 ? 4 : 5

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'targetDotTakenDebuff',
      name: 'targetDotTakenDebuff',
      text: t('Content.targetDotTakenDebuff.text'),
      title: t('Content.targetDotTakenDebuff.title'),
      content: t('Content.targetDotTakenDebuff.content', { dotVulnerabilityValue: TsUtils.precisionRound(100 * dotVulnerabilityValue) }),
    },
    {
      formItem: 'slider',
      id: 'skillExtraHits',
      name: 'skillExtraHits',
      text: t('Content.skillExtraHits.text'),
      title: t('Content.skillExtraHits.title'),
      content: t('Content.skillExtraHits.content'),
      min: 1,
      max: maxExtraHits,
    },
    {
      formItem: 'switch',
      id: 'targetWindShear',
      name: 'targetWindShear',
      text: t('Content.targetWindShear.text'),
      title: t('Content.targetWindShear.title'),
      content: t('Content.targetWindShear.content'),
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'targetDotTakenDebuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      targetDotTakenDebuff: true,
      skillExtraHits: maxExtraHits,
      targetWindShear: true,
    }),
    teammateDefaults: () => ({
      targetDotTakenDebuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.SKILL_SCALING += (r.skillExtraHits) * skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling
      x.DOT_SCALING += (e >= 6) ? 0.15 : 0

      // Boost
      x.DMG_RED_MULTI *= (r.targetWindShear) ? (1 - 0.15) : 1

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30 + 15 * r.skillExtraHits
      x.ULT_TOUGHNESS_DMG += 60

      x.DOT_CHANCE = 0.65

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      buffAbilityVulnerability(x, DOT_TYPE, dotVulnerabilityValue, (m.targetDotTakenDebuff))
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
