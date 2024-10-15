import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Welt')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const skillExtraHitsMax = (e >= 6) ? 3 : 2

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.72, 0.792)
  const ultScaling = ult(e, 1.50, 1.62)
  const talentScaling = talent(e, 0.60, 0.66)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'enemyDmgTakenDebuff',
    name: 'enemyDmgTakenDebuff',
    text: t('Content.enemyDmgTakenDebuff.text'),
    title: t('Content.enemyDmgTakenDebuff.title'),
    content: t('Content.enemyDmgTakenDebuff.content'),
  }, {
    formItem: 'switch',
    id: 'enemySlowed',
    name: 'enemySlowed',
    text: t('Content.enemySlowed.text'),
    title: t('Content.enemySlowed.title'),
    content: t('Content.enemySlowed.content', { talentScaling: TsUtils.precisionRound(100 * talentScaling) }),
  }, {
    formItem: 'slider',
    id: 'skillExtraHits',
    name: 'skillExtraHits',
    text: t('Content.skillExtraHits.text'),
    title: t('Content.skillExtraHits.title'),
    content: t('Content.skillExtraHits.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
    min: 0,
    max: skillExtraHitsMax,
  }, {
    formItem: 'switch',
    id: 'e1EnhancedState',
    name: 'e1EnhancedState',
    text: t('Content.e1EnhancedState.text'),
    title: t('Content.e1EnhancedState.title'),
    content: t('Content.e1EnhancedState.content'),
    disabled: (e < 1),
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'enemyDmgTakenDebuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      enemySlowed: true,
      enemyDmgTakenDebuff: true,
      skillExtraHits: skillExtraHitsMax,
      e1EnhancedState: true,
    }),
    teammateDefaults: () => ({
      enemyDmgTakenDebuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x.ELEMENTAL_DMG += (x.ENEMY_WEAKNESS_BROKEN) ? 0.20 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_SCALING += (r.enemySlowed) ? talentScaling : 0
      x.SKILL_SCALING += (r.enemySlowed) ? talentScaling : 0
      x.ULT_SCALING += (r.enemySlowed) ? talentScaling : 0

      x.BASIC_SCALING += (e >= 1 && r.e1EnhancedState) ? 0.50 * basicScaling : 0
      x.SKILL_SCALING += (e >= 1 && r.e1EnhancedState) ? 0.80 * skillScaling : 0

      x.SKILL_SCALING += r.skillExtraHits * skillScaling

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30 + 30 * r.skillExtraHits
      x.ULT_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x.VULNERABILITY += (m.enemyDmgTakenDebuff) ? 0.12 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
