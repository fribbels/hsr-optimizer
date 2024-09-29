import { ComputedStatsObject, DOT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon): CharacterConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Characters.Sampo')
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
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content', { dotVulnerabilityValue: TsUtils.precisionRound(100 * dotVulnerabilityValue) }),
    },
    {
      formItem: 'slider',
      id: 'skillExtraHits',
      name: 'skillExtraHits',
      text: t('Content.1.text'),
      title: t('Content.1.title'),
      content: t('Content.1.content'),
      min: 1,
      max: maxExtraHits,
    },
    {
      formItem: 'switch',
      id: 'targetWindShear',
      name: 'targetWindShear',
      text: t('Content.2.text'),
      title: t('Content.2.title'),
      content: t('Content.2.content'),
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
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

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
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      buffAbilityVulnerability(x, DOT_TYPE, dotVulnerabilityValue, (m.targetDotTakenDebuff))
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
