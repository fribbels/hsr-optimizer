import { baseComputedStatsObject, BASIC_TYPE, ComputedStatsObject, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { BETA_UPDATE, Stats } from 'lib/constants'
import { buffAbilityCd, buffAbilityResShred } from "lib/optimizer/calculateBuffs";

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)

  const ultScaling = ult(e, 0.75, 0.81)
  const ultBrokenScaling = ult(e, 0.40, 0.432)

  const ultFinalScaling = ult(e, 0.10, 0.108)
  const ultFinalBrokenScaling = ult(e, 0.15, 0.162)

  const fuaScaling = talent(e, 2.00, 2.20)

  // TODO: Ashblazing

  const content: ContentItem[] = [
    {
      formItem: 'slider',
      id: 'ultStacks',
      name: 'ultStacks',
      text: 'Flying Aureus stacks',
      title: 'Flying Aureus stacks',
      content: BETA_UPDATE,
      min: 6,
      max: 12,
    },
    {
      formItem: 'switch',
      id: 'weaknessBrokenUlt',
      name: 'weaknessBrokenUlt',
      text: 'Weakness broken ult (force weakness break)',
      title: 'Weakness broken ult (force weakness break)',
      content: `Overrides weakness break to be enabled. ${BETA_UPDATE}`,
    },
    {
      formItem: 'slider',
      id: 'e1UltHitsOnTarget',
      name: 'e1UltHitsOnTarget',
      text: 'E1 hits on target',
      title: 'E1 hits on target',
      content: BETA_UPDATE,
      min: 6,
      max: 12,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e4DmgTypeChange',
      name: 'e4DmgTypeChange',
      text: 'E4 DMG type change',
      title: 'E4 DMG type change',
      content: BETA_UPDATE,
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6Buffs',
      name: 'e6Buffs',
      text: 'E6 buffs',
      title: 'E6 buffs',
      content: BETA_UPDATE,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = []

  const defaults = {
    ultStacks: 12,
    weaknessBrokenUlt: true,
    e1UltHitsOnTarget: 12,
    e4DmgTypeChange: true,
    e6Buffs: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => defaults,
    teammateDefaults: () => ({}),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Special case where we force the weakness break on if the ult break option is enabled
      if (r.weaknessBrokenUlt) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      } else {
        x.ULT_BREAK_EFFICIENCY_BOOST += 1.00
      }

      buffAbilityCd(x, FUA_TYPE, 0.60)

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.FUA_SCALING += fuaScaling
      x.ULT_SCALING += r.ultStacks * (ultScaling + ultFinalScaling + ultBrokenScaling + (r.weaknessBrokenUlt ? ultFinalBrokenScaling : 0)) // The two ults currently do the same thing
      x.ULT_SCALING += (e >= 1) ? 0.30 * Math.min(r.e1UltHitsOnTarget, r.ultStacks) : 0

      x.ULT_DMG_TYPE = ULT_TYPE | FUA_TYPE

      if (e >= 4 && r.e4DmgTypeChange) {
        x.BASIC_DMG_TYPE = BASIC_TYPE | FUA_TYPE
        x.SKILL_DMG_TYPE = SKILL_TYPE | FUA_TYPE
      }

      if (e >= 6 && r.e6Buffs) {
        buffAbilityResShred(x, FUA_TYPE, 0.20) // This should technically just be wind res pen
        x.FUA_DMG_TYPE = ULT_TYPE | FUA_TYPE
        x.FUA_SCALING += 3.60
      }

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 15 * r.ultStacks
      x.FUA_TOUGHNESS_DMG += 15


      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
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
    },
  }
}
