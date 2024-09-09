import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { BETA_UPDATE, Stats } from 'lib/constants'
import { RappaConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5 // TODO

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 0.95, 0.95) // TODO

  // TOUGHNESS REDUCTION BASED ON WEAKNESS
  // Sealform super break
  // ATK scaling break vuln

  const skillScaling = skill(e, 1.50, 1.50)

  const ultBeBuff = ult(e, 0.40, 0.40)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'sealformActive',
      name: 'sealformActive',
      text: 'Sealform state (force weakness break)',
      title: 'Sealform state (force weakness break)',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'atkToBreakVulnerability',
      name: 'atkToBreakVulnerability',
      text: 'ATK to Break vulnerability',
      title: 'ATK to Break vulnerability',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'e1DefPen',
      name: 'e1DefPen',
      text: 'E1 DEF pen',
      title: 'E1 DEF pen',
      content: BETA_UPDATE,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2Buffs',
      name: 'e2Buffs',
      text: 'E2 break buffs',
      title: 'E2 break buffs',
      content: BETA_UPDATE,
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e4SpdBuff',
      name: 'e4SpdBuff',
      text: 'E4 SPD buff',
      title: 'E4 SPD buff',
      content: BETA_UPDATE,
      disabled: e < 4,
    },
  ]

  const teammateContent: ContentItem[] = []

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
    teammateDefaults: () => ({}),
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

      x.DEF_PEN += (e >= 1 && r.sealformActive) ? 0.15 : 0
      x[Stats.BE] += (e >= 2 && r.sealformActive) ? 0.20 : 0

      x.SUPER_BREAK_MODIFIER += (r.sealformActive) ? 0.60 : 0

      x.BASIC_SCALING += (r.sealformActive) ? basicEnhancedScaling : basicScaling
      x.SKILL_SCALING += skillScaling

      x.BASIC_TOUGHNESS_DMG += (r.enhancedStateActive) ? 45 : 30 // TODO
      x.SKILL_TOUGHNESS_DMG += (r.enhancedStateActive) ? 90 : 60 // TODO

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.SPD_P] += (e >= 4 && m.e4SpdBuff) ? 0.12 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [RappaConversionConditional],
  }
}
