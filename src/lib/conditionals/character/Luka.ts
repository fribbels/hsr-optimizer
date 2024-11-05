import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Luka')
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
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content'),
    },
    {
      formItem: 'switch',
      id: 'targetUltDebuffed',
      text: t('Content.targetUltDebuffed.text'),
      content: t('Content.targetUltDebuffed.content', { targetUltDebuffDmgTakenValue: TsUtils.precisionRound(100 * targetUltDebuffDmgTakenValue) }),
    },
    {
      formItem: 'slider',
      id: 'basicEnhancedExtraHits',
      text: t('Content.basicEnhancedExtraHits.text'),
      content: t('Content.basicEnhancedExtraHits.content'),
      min: 0,
      max: 3,
    },
    {
      formItem: 'switch',
      id: 'e1TargetBleeding',
      text: t('Content.e1TargetBleeding.text'),
      content: t('Content.e1TargetBleeding.content'),
      disabled: e < 1,
    },
    {
      formItem: 'slider',
      id: 'e4TalentStacks',
      text: t('Content.e4TalentStacks.text'),
      content: t('Content.e4TalentStacks.content'),
      min: 0,
      max: 4,
      disabled: e < 4,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'targetUltDebuffed'),
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
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
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

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
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.characterConditionals

      x.VULNERABILITY += (m.targetUltDebuffed) ? targetUltDebuffDmgTakenValue : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
