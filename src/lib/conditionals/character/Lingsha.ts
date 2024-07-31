import { baseComputedStatsObject, BREAK_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { BETA_UPDATE, Stats } from 'lib/constants'
import { buffAbilityVulnerability } from "lib/optimizer/calculateBuffs";

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.80, 0.88)
  const ultScaling = ult(e, 1.50, 1.65)
  const ultBreakVulnerability = ult(e, 0.25, 0.27)
  const fuaScaling = talent(e, 0.90, 0.99)

  // TODO: Ashblazing

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'beConversion',
      name: 'beConversion',
      text: 'BE to ATK/OHB',
      title: 'BE to ATK/OHB',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'befogState',
      name: 'befogState',
      text: 'Befog state',
      title: 'Befog state',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'e1DefShred',
      name: 'e1DefShred',
      text: 'E1 weakness break buffs',
      title: 'E1 weakness break buffs',
      content: BETA_UPDATE,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2BeBuff',
      name: 'e2BeBuff',
      text: 'E2 BE buff',
      title: 'E2 BE buff',
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
    findContentId(content, 'befogState'),
    findContentId(content, 'e1DefShred'),
    findContentId(content, 'e2BeBuff'),
    findContentId(content, 'e6ResShred'),
  ]

  const defaults = {
    beConversion: true,
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }

  const teammateDefaults = {
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.FUA_SCALING += fuaScaling
      x.ULT_SCALING += ultScaling

      x.BREAK_EFFICIENCY_BOOST += (e >= 1) ? 0.50 : 0
      x.FUA_SCALING += (e >= 6 && r.e6ResShred) ? 0.50 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 45
      x.FUA_TOUGHNESS_DMG += (e >= 6) ? 15 : 0

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      buffAbilityVulnerability(x, BREAK_TYPE, ultBreakVulnerability, (m.befogState))

      x[Stats.BE] += (e >= 2 && m.e2BeBuff) ? 0.40 : 0
      x.RES_PEN += (e >= 6 && m.e6ResShred) ? 0.20 : 0
    },
    postPreComputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      if (x.ENEMY_WEAKNESS_BROKEN) {
        x.DEF_SHRED += (e >= 1 && m.e1DefShred) ? 0.20 : 0
      }
    },
    precomputeTeammateEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x: ComputedStatsObject = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * x[Stats.ATK]

      x[Stats.ATK] += (r.beConversion) ? Math.min(0.50, 0.20 * x[Stats.BE]) * request.baseAtk : 0
      x[Stats.OHB] += (r.beConversion) ? Math.min(0.20, 0.08 * x[Stats.BE]) : 0
    },
  }
}
