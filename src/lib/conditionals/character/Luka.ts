import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon): CharacterConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Characters.Luka')
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const basicEnhancedHitValue = basic(e, 0.20, 0.22)
  const targetUltDebuffDmgTakenValue = ult(e, 0.20, 0.216)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 0.20 * 3 + 0.80, 0.22 * 3 + 0.88)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 3.30, 3.564)
  const dotScaling = skill(e, 3.38, 3.718)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'basicEnhanced',
      name: 'basicEnhanced',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content'),
    },
    {
      formItem: 'switch',
      id: 'targetUltDebuffed',
      name: 'targetUltDebuffed',
      text: t('Content.1.text'),
      title: t('Content.1.title'),
      content: t('Content.1.content', { targetUltDebuffDmgTakenValue: TsUtils.precisionRound(100 * targetUltDebuffDmgTakenValue) }),
    },
    {
      formItem: 'slider',
      id: 'basicEnhancedExtraHits',
      name: 'basicEnhancedExtraHits',
      text: t('Content.2.text'),
      title: t('Content.2.title'),
      content: t('Content.2.content'),
      min: 0,
      max: 3,
    },
    {
      formItem: 'switch',
      id: 'e1TargetBleeding',
      name: 'e1TargetBleeding',
      text: t('Content.3.text'),
      title: t('Content.3.title'),
      content: t('Content.3.content'),
      disabled: e < 1,
    },
    {
      formItem: 'slider',
      id: 'e4TalentStacks',
      name: 'e4TalentStacks',
      text: t('Content.4.text'),
      title: t('Content.4.title'),
      content: t('Content.4.content'),
      min: 0,
      max: 4,
      disabled: e < 4,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'targetUltDebuffed'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      basicEnhanced: true,
      targetUltDebuffed: true,
      e1TargetBleeding: true,
      basicEnhancedExtraHits: 3,
      e4TalentStacks: 4,
    }),
    teammateDefaults: () => ({
      targetUltDebuffed: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Stats
      x[Stats.ATK_P] += (e >= 4) ? r.e4TalentStacks * 0.05 : 0

      // Scaling
      x.BASIC_SCALING += (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      x.BASIC_SCALING += (r.basicEnhanced && r.basicEnhancedExtraHits) * basicEnhancedHitValue
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling

      // Boost
      x.ELEMENTAL_DMG += (e >= 1 && r.e1TargetBleeding) ? 0.15 : 0

      x.BASIC_TOUGHNESS_DMG += (r.basicEnhanced) ? 60 : 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90

      x.DOT_CHANCE = 1.00

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x.VULNERABILITY += (m.targetUltDebuffed) ? targetUltDebuffDmgTakenValue : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
