import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { BoothillConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { NumberToNumberMap } from 'types/Common'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const standoffVulnerabilityBoost = skill(e, 0.30, 0.33)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.20, 2.42)
  const ultScaling = ult(e, 4.00, 4.32)

  const pocketTrickshotsToTalentBreakDmg: NumberToNumberMap = {
    0: 0,
    1: talent(e, 0.70, 0.77),
    2: talent(e, 1.20, 1.32),
    3: talent(e, 1.70, 1.87),
  }

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Boothill.Content')
    return [
      {
        formItem: 'switch',
        id: 'standoffActive',
        name: 'standoffActive',
        text: t('standoffActive.text'),
        title: t('standoffActive.title'),
        content: t('standoffActive.content', { standoffVulnerabilityBoost: TsUtils.precisionRound(100 * standoffVulnerabilityBoost) }),
      },
      {
        formItem: 'slider',
        id: 'pocketTrickshotStacks',
        name: 'pocketTrickshotStacks',
        text: t('pocketTrickshotStacks.text'),
        title: t('pocketTrickshotStacks.title'),
        content: t('pocketTrickshotStacks.content'),
        min: 0,
        max: 3,
      },
      {
        formItem: 'switch',
        id: 'beToCritBoost',
        name: 'beToCritBoost',
        text: t('beToCritBoost.text'),
        title: t('beToCritBoost.title'),
        content: t('beToCritBoost.content'),
      },
      {
        formItem: 'switch',
        id: 'talentBreakDmgScaling',
        name: 'talentBreakDmgScaling',
        text: t('talentBreakDmgScaling.text'),
        title: t('talentBreakDmgScaling.title'),
        content: t('talentBreakDmgScaling.content'),
      },
      {
        formItem: 'switch',
        id: 'e1DefShred',
        name: 'e1DefShred',
        text: t('e1DefShred.text'),
        title: t('e1DefShred.title'),
        content: t('e1DefShred.content'),
        disabled: e < 1,
      },
      {
        formItem: 'switch',
        id: 'e2BeBuff',
        name: 'e2BeBuff',
        text: t('e2BeBuff.text'),
        title: t('e2BeBuff.title'),
        content: t('e2BeBuff.content'),
        disabled: e < 2,
      },
      {
        formItem: 'switch',
        id: 'e4TargetStandoffVulnerability',
        name: 'e4TargetStandoffVulnerability',
        text: t('e4TargetStandoffVulnerability.text'),
        title: t('e4TargetStandoffVulnerability.title'),
        content: t('e4TargetStandoffVulnerability.content'),
        disabled: e < 4,
      },
      {
        formItem: 'switch',
        id: 'e6AdditionalBreakDmg',
        name: 'e6AdditionalBreakDmg',
        text: t('e6AdditionalBreakDmg.text'),
        title: t('e6AdditionalBreakDmg.title'),
        content: t('e6AdditionalBreakDmg.content'),
        disabled: e < 6,
      },
    ]
  })()

  const teammateContent: ContentItem[] = []

  const defaults = {
    standoffActive: true,
    pocketTrickshotStacks: 3,
    beToCritBoost: true,
    talentBreakDmgScaling: true,
    e1DefShred: true,
    e2BeBuff: true,
    e4TargetStandoffVulnerability: true,
    e6AdditionalBreakDmg: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({}),
    initializeConfigurations: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      if (r.talentBreakDmgScaling) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }
    },
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x[Stats.BE] += (e >= 2 && r.e2BeBuff) ? 0.30 : 0
      x.VULNERABILITY += (r.standoffActive) ? standoffVulnerabilityBoost : 0

      x.DEF_PEN += (e >= 1 && r.e1DefShred) ? 0.16 : 0
      x.VULNERABILITY += (e >= 4 && r.standoffActive && r.e4TargetStandoffVulnerability) ? 0.12 : 0

      x.BASIC_SCALING += (r.standoffActive) ? basicEnhancedScaling : basicScaling
      x.BASIC_BREAK_EFFICIENCY_BOOST += (r.standoffActive) ? r.pocketTrickshotStacks * 0.50 : 0

      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += (r.standoffActive) ? 60 : 30
      x.ULT_TOUGHNESS_DMG += 90

      // Since his toughness scaling is capped at 1600% x 30, we invert the toughness scaling on the original break dmg and apply the new scaling
      const newMaxToughness = Math.min(16.00 * 30, request.enemyMaxToughness)
      const inverseBreakToughnessMultiplier = 1 / (0.5 + request.enemyMaxToughness / 120)
      const newBreakToughnessMultiplier = (0.5 + newMaxToughness / 120)
      let talentBreakDmgScaling = pocketTrickshotsToTalentBreakDmg[r.pocketTrickshotStacks]
      talentBreakDmgScaling += (e >= 6 && r.e6AdditionalBreakDmg) ? 0.40 : 0
      x.BASIC_BREAK_DMG_MODIFIER += (r.talentBreakDmgScaling && r.standoffActive) ? inverseBreakToughnessMultiplier * newBreakToughnessMultiplier * talentBreakDmgScaling : 0

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [BoothillConversionConditional],
  }
}
