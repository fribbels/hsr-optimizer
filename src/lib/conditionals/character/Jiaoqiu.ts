import { baseComputedStatsObject, ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { BETA_UPDATE, Stats } from 'lib/constants'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 1.00, 1.08)

  const ultVulnerabilityScaling = ult(e, 0.15, 0.162)

  const talentVulnerabilityBase = talent(e, 0.15, 0.165)
  const talentVulnerabilityScaling = talent(e, 0.05, 0.055)

  const talentDotScaling = talent(e, 1.80, 1.98)

  const maxAshenRoastStacks = e >= 6 ? 9 : 5

  const content: ContentItem[] = [
    {
      formItem: 'slider',
      id: 'ashenRoastStacks',
      name: 'ashenRoastStacks',
      text: `Ashen Roast stacks`,
      title: 'Ashen Roast stacks',
      content: BETA_UPDATE,
      min: 0,
      max: maxAshenRoastStacks,
    },
    {
      formItem: 'switch',
      id: 'ultFieldActive',
      name: 'ultFieldActive',
      text: 'Ult field active',
      title: 'Ult field active',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'ehrToAtkBoost',
      name: 'ehrToAtkBoost',
      text: 'EHR to ATK boost',
      title: 'EHR to ATK boost',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'e1DmgBoost',
      name: 'e1DmgBoost',
      text: 'E1 DMG boost',
      title: 'E1 DMG boost',
      content: BETA_UPDATE,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2Dot',
      name: 'e2Dot',
      text: 'E2 DOT scaling',
      title: 'E2 DOT scaling',
      content: BETA_UPDATE,
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e6ResShred',
      name: 'e6ResShred',
      text: 'E6 RES shred',
      title: 'E6 RES shred',
      content: BETA_UPDATE,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'ashenRoastStacks'),
    findContentId(content, 'ultFieldActive'),
    findContentId(content, 'e1DmgBoost'),
    findContentId(content, 'e6ResShred'),
  ]

  const defaults = {
    ashenRoastStacks: maxAshenRoastStacks,
    ultFieldActive: true,
    ehrToAtkBoost: true,
    e1DmgBoost: true,
    e2Dot: true,
    e6ResShred: true,
  }

  const teammateDefaults = {
    ashenRoastStacks: maxAshenRoastStacks,
    ultFieldActive: true,
    e1DmgBoost: true,
    e6ResShred: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += (r.ashenRoastStacks > 0) ? talentDotScaling : 0
      x.DOT_SCALING += (e >= 2 && r.e2Dot && r.ashenRoastStacks > 0) ? 3.00 : 0
      x.DOT_CHANCE = 100

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      buffAbilityVulnerability(x, ULT_TYPE, ultVulnerabilityScaling, (m.ultFieldActive))

      x.DMG_TAKEN_MULTI += (m.ashenRoastStacks > 0) ? talentVulnerabilityBase : 0
      x.DMG_TAKEN_MULTI += Math.max(0, m.ashenRoastStacks - 1) * talentVulnerabilityScaling

      x.ELEMENTAL_DMG += (e >= 1 && m.e1DmgBoost && m.ashenRoastStacks > 0) ? 0.48 : 0

      x.RES_PEN += (e >= 6 && m.e6ResShred) ? m.ashenRoastStacks * 0.03 : 0
    },
    precomputeTeammateEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x: ComputedStatsObject = c.x

      x[Stats.ATK] += (r.ehrToAtkBoost && x[Stats.EHR] > 0.80)
        ? Math.min(2.40, 0.60 * Math.floor((x[Stats.EHR] - 0.80) / 0.15)) * request.baseAtk
        : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    },
  }
}
