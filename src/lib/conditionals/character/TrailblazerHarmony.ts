import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerHarmony')
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.50, 0.55)
  const ultBeScaling = ult(e, 0.30, 0.33)
  const skillMaxHits = e >= 6 ? 6 : 4

  const targetsToSuperBreakMulti = {
    1: 1.60,
    3: 1.40,
    5: 1.20,
  }

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'backupDancer',
      name: 'backupDancer',
      text: t('Content.backupDancer.text'),
      title: t('Content.backupDancer.title'),
      content: t('Content.backupDancer.content', { ultBeScaling: TsUtils.precisionRound(100 * ultBeScaling) }),
    },
    {
      formItem: 'switch',
      id: 'superBreakDmg',
      name: 'superBreakDmg',
      text: t('Content.superBreakDmg.text'),
      title: t('Content.superBreakDmg.title'),
      content: t('Content.superBreakDmg.content'),
    },
    {
      formItem: 'slider',
      id: 'skillHitsOnTarget',
      name: 'skillHitsOnTarget',
      text: t('Content.skillHitsOnTarget.text'),
      title: t('Content.skillHitsOnTarget.title'),
      content: t('Content.skillHitsOnTarget.content'),
      min: 0,
      max: skillMaxHits,
    },
    {
      formItem: 'switch',
      id: 'e2EnergyRegenBuff',
      name: 'e2EnergyRegenBuff',
      text: t('Content.e2EnergyRegenBuff.text'),
      title: t('Content.e2EnergyRegenBuff.title'),
      content: t('Content.e2EnergyRegenBuff.content'),
      disabled: e < 2,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'backupDancer'),
    findContentId(content, 'superBreakDmg'),
    {
      formItem: 'slider',
      id: 'teammateBeValue',
      name: 'teammateBeValue',
      text: t('TeammateContent.teammateBeValue.text'),
      title: t('TeammateContent.teammateBeValue.title'),
      content: t('TeammateContent.teammateBeValue.content'),
      min: 0,
      max: 4.00,
      percent: true,
      disabled: e < 4,
    },
  ]

  const defaults = {
    skillHitsOnTarget: skillMaxHits,
    backupDancer: true,
    superBreakDmg: true,
    e2EnergyRegenBuff: false,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({
      backupDancer: true,
      superBreakDmg: true,
      teammateBeValue: 2.00,
    }),
    initializeConfigurations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }
    },
    initializeTeammateConfigurations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }
    },
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.ERR] += (e >= 2 && r.e2EnergyRegenBuff) ? 0.25 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.SKILL_SCALING += r.skillHitsOnTarget * skillScaling

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30 * r.skillHitsOnTarget

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.BE] += (m.backupDancer) ? ultBeScaling : 0
      x.SUPER_BREAK_HMC_MODIFIER += (m.backupDancer && m.superBreakDmg) ? targetsToSuperBreakMulti[context.enemyCount] : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals

      x[Stats.BE] += (e >= 4) ? 0.15 * t.teammateBeValue : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
