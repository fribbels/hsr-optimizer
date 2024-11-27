import { gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Luka')
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const basicEnhancedHitValue = basic(e, 0.20, 0.22)
  const targetUltDebuffDmgTakenValue = ult(e, 0.20, 0.216)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 0.20 * 3 + 0.80, 0.22 * 3 + 0.88)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 3.30, 3.564)
  const dotScaling = skill(e, 3.38, 3.718)

  const defaults = {
    basicEnhanced: true,
    targetUltDebuffed: true,
    e1TargetBleeding: true,
    basicEnhancedExtraHits: 3,
    e4TalentStacks: 4,
  }

  const teammateDefaults = {
    targetUltDebuffed: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicEnhanced: {
      id: 'basicEnhanced',
      formItem: 'switch',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content'),
    },
    targetUltDebuffed: {
      id: 'targetUltDebuffed',
      formItem: 'switch',
      text: t('Content.targetUltDebuffed.text'),
      content: t('Content.targetUltDebuffed.content', { targetUltDebuffDmgTakenValue: TsUtils.precisionRound(100 * targetUltDebuffDmgTakenValue) }),
    },
    basicEnhancedExtraHits: {
      id: 'basicEnhancedExtraHits',
      formItem: 'slider',
      text: t('Content.basicEnhancedExtraHits.text'),
      content: t('Content.basicEnhancedExtraHits.content'),
      min: 0,
      max: 3,
    },
    e1TargetBleeding: {
      id: 'e1TargetBleeding',
      formItem: 'switch',
      text: t('Content.e1TargetBleeding.text'),
      content: t('Content.e1TargetBleeding.content'),
      disabled: e < 1,
    },
    e4TalentStacks: {
      id: 'e4TalentStacks',
      formItem: 'slider',
      text: t('Content.e4TalentStacks.text'),
      content: t('Content.e4TalentStacks.content'),
      min: 0,
      max: 4,
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetUltDebuffed: content.targetUltDebuffed,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((e >= 4) ? r.e4TalentStacks * 0.05 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff((r.basicEnhanced) ? basicEnhancedScaling : basicScaling, Source.NONE)
      x.BASIC_SCALING.buff((r.basicEnhanced && r.basicEnhancedExtraHits) * basicEnhancedHitValue, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.DOT_SCALING.buff(dotScaling, Source.NONE)

      // Boost
      x.ELEMENTAL_DMG.buff((e >= 1 && r.e1TargetBleeding) ? 0.15 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff((r.basicEnhanced) ? 60 : 30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(90, Source.NONE)

      x.DOT_CHANCE.set(1.00, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buff((m.targetUltDebuffed) ? targetUltDebuffDmgTakenValue : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
