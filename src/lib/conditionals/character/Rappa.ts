import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { CURRENT_DATA_VERSION, Stats } from 'lib/constants'
import { RappaConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon): CharacterConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Characters.Rappa')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5 // TODO

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.00, 2.32)

  const skillScaling = skill(e, 1.20, 1.32)

  const ultBeBuff = ult(e, 0.30, 0.34)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'sealformActive',
      name: 'sealformActive',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'switch',
      id: 'atkToBreakVulnerability',
      name: 'atkToBreakVulnerability',
      text: t('Content.1.text'),
      title: t('Content.1.title'),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'switch',
      id: 'e1DefPen',
      name: 'e1DefPen',
      text: t('Content.2.text'),
      title: t('Content.2.title'),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2Buffs',
      name: 'e2Buffs',
      text: t('Content.3.text'),
      title: t('Content.3.title'),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e4SpdBuff',
      name: 'e4SpdBuff',
      text: t('Content.4.text'),
      title: t('Content.4.title'),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
  ]

  const teammateContent: ContentItem[] = [
    {
      formItem: 'slider',
      id: 'teammateBreakVulnerability',
      name: 'teammateBreakVulnerability',
      text: t('TeammateContent.0.text'),
      title: t('TeammateContent.0.title'),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 0.15,
      percent: true,
    },
    {
      formItem: 'switch',
      id: 'e4SpdBuff',
      name: 'e4SpdBuff',
      text: t('TeammateContent.1.text'),
      title: t('TeammateContent.1.title'),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
  ]

  const defaults = {
    sealformActive: true,
    atkToBreakVulnerability: true,
    e1DefPen: true,
    e2Buffs: true,
    e4SpdBuff: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({
      teammateBreakVulnerability: 0.15,
      e4SpdBuff: true,
    }),
    initializeConfigurations: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      if (r.sealformActive) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }
    },
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x[Stats.BE] += (r.sealformActive) ? ultBeBuff : 0
      x.BREAK_EFFICIENCY_BOOST += (r.sealformActive) ? 0.50 : 0

      x.DEF_PEN += (e >= 1 && r.sealformActive && r.e1DefPen) ? 0.15 : 0

      x[Stats.SPD_P] += (e >= 4 && r.sealformActive && r.e4SpdBuff) ? 0.12 : 0

      x.BASIC_SUPER_BREAK_MODIFIER += (r.sealformActive) ? 0.60 : 0

      x.BASIC_SCALING += (r.sealformActive) ? basicEnhancedScaling : basicScaling
      x.SKILL_SCALING += skillScaling

      x.BASIC_TOUGHNESS_DMG += (r.sealformActive) ? 75 : 30
      x.SKILL_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x.BREAK_VULNERABILITY += t.teammateBreakVulnerability

      x[Stats.SPD_P] += (e >= 4 && t.e4SpdBuff) ? 0.12 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [RappaConversionConditional],
  }
}
