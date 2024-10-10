import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { BREAK_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { Stats } from 'lib/constants'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { GallagherConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.50, 2.75)
  const ultScaling = basic(e, 1.50, 1.65)
  const talentBesottedScaling = talent(e, 0.12, 0.132)

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Gallagher.Content')
    return [
      {
        formItem: 'switch',
        id: 'basicEnhanced',
        name: 'basicEnhanced',
        text: t('basicEnhanced.text'),
        title: t('basicEnhanced.title'),
        content: t('basicEnhanced.content'),
      },
      {
        formItem: 'switch',
        id: 'breakEffectToOhbBoost',
        name: 'breakEffectToOhbBoost',
        text: t('breakEffectToOhbBoost.text'),
        title: t('breakEffectToOhbBoost.title'),
        content: t('breakEffectToOhbBoost.content'),
      },
      {
        formItem: 'switch',
        id: 'targetBesotted',
        name: 'targetBesotted',
        text: t('targetBesotted.text'),
        title: t('targetBesotted.title'),
        content: t('targetBesotted.content', { talentBesottedScaling: TsUtils.precisionRound(100 * talentBesottedScaling) }),
      },
      {
        formItem: 'switch',
        id: 'e1ResBuff',
        name: 'e1ResBuff',
        text: t('e1ResBuff.text'),
        title: t('e1ResBuff.title'),
        content: t('e1ResBuff.content'),
        disabled: e < 1,
      },
      {
        formItem: 'switch',
        id: 'e2ResBuff',
        name: 'e2ResBuff',
        text: t('e2ResBuff.text'),
        title: t('e2ResBuff.title'),
        content: t('e2ResBuff.content'),
        disabled: e < 2,
      },
      {
        formItem: 'switch',
        id: 'e6BeBuff',
        name: 'e6BeBuff',
        text: t('e6BeBuff.text'),
        title: t('e6BeBuff.title'),
        content: t('e6BeBuff.content'),
        disabled: e < 6,
      },
    ]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    return [
      findContentId(content, 'targetBesotted'),
    ]
  })()

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      basicEnhanced: true,
      breakEffectToOhbBoost: true,
      e1ResBuff: true,
      e2ResBuff: true,
      e6BeBuff: true,
      targetBesotted: true,
    }),
    teammateDefaults: () => ({
      targetBesotted: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x[Stats.RES] += (e >= 1 && r.e1ResBuff) ? 0.50 : 0
      x[Stats.RES] += (e >= 2 && r.e2ResBuff) ? 0.30 : 0
      x[Stats.BE] += (e >= 6) ? 0.20 : 0

      x.BREAK_EFFICIENCY_BOOST += (e >= 6) ? 0.20 : 0

      x.BASIC_SCALING += (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += (r.basicEnhanced) ? 90 : 30
      x.ULT_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      buffAbilityVulnerability(x, BREAK_TYPE, talentBesottedScaling, (m.targetBesotted))
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [GallagherConversionConditional],
  }
}
