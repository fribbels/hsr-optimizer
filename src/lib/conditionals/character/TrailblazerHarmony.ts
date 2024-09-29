import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon): CharacterConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Characters.TrailblazerHarmony')
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
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content', { ultBeScaling: TsUtils.precisionRound(100 * ultBeScaling) }),
    },
    {
      formItem: 'switch',
      id: 'superBreakDmg',
      name: 'superBreakDmg',
      text: t('Content.1.text'),
      title: t('Content.1.title'),
      content: t('Content.1.content'),
    },
    {
      formItem: 'slider',
      id: 'skillHitsOnTarget',
      name: 'skillHitsOnTarget',
      text: t('Content.2.text'),
      title: t('Content.2.title'),
      content: t('Content.2.content'),
      min: 0,
      max: skillMaxHits,
    },
    {
      formItem: 'switch',
      id: 'e2EnergyRegenBuff',
      name: 'e2EnergyRegenBuff',
      text: t('Content.3.text'),
      title: t('Content.3.title'),
      content: t('Content.3.content'),
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
      text: t('TeammateContent.0.text'),
      title: t('TeammateContent.0.title'),
      content: t('TeammateContent.0.content'),
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
    initializeConfigurations: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }
    },
    initializeTeammateConfigurations: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }
    },
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

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
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.BE] += (m.backupDancer) ? ultBeScaling : 0
      x.SUPER_BREAK_HMC_MODIFIER += (m.backupDancer && m.superBreakDmg) ? targetsToSuperBreakMulti[request.enemyCount] : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.BE] += (e >= 4) ? 0.15 * t.teammateBeValue : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
