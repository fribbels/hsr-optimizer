import { baseComputedStatsObject, ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
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
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 3.50, 3.78)
  const ultDmgBuffValue = ult(e, 0.50, 0.54)

  const fuaScaling = talent(e, 2.00, 2.20)
  const additionalDmgScaling = talent(e, 0.30, 0.33)

  // TODO: Ashblazing

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'preyMark',
      name: 'preyMark',
      text: 'Prey marked',
      title: 'Prey marked',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'ultDmgBuff',
      name: 'ultDmgBuff',
      text: 'Ult DMG buff',
      title: 'Ult DMG buff',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'e1Buffs',
      name: 'e1Buffs',
      text: 'E1 FUA vulnerability',
      title: 'E1 FUA vulnerability',
      content: BETA_UPDATE,
      disabled: e < 1
    },
    {
      formItem: 'switch',
      id: 'e4CdBoost',
      name: 'e4CdBoost',
      text: 'E4 CD boost',
      title: 'E4 CD boost',
      content: BETA_UPDATE,
      disabled: e < 4
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'preyMark'),
  ]

  const defaults = {
    preyMark: true,
    ultDmgBuff: true,
    e1Buffs: true,
    e4CdBoost: true,
  }

  const teammateDefaults = {
    preyMark: true,
    e4CdBoost: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x.ELEMENTAL_DMG += (r.ultDmgBuff) ? ultDmgBuffValue : 0

      if (e >= 1) {
        x.ULT_DMG_TYPE = ULT_TYPE | FUA_TYPE
      }

      x.BASIC_SCALING += basicScaling + ((r.preyMark) ? additionalDmgScaling : 0)
      x.SKILL_SCALING += skillScaling + ((r.preyMark) ? additionalDmgScaling : 0)
      x.FUA_SCALING += fuaScaling + ((r.preyMark) ? additionalDmgScaling : 0)
      x.ULT_SCALING += ultScaling + ((r.preyMark) ? additionalDmgScaling : 0)

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90
      x.FUA_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      buffAbilityVulnerability(x, FUA_TYPE, 0.25, (e >= 1 && m.e1Buffs && m.preyMark))
      x[Stats.CD] += (m.preyMark) ? 0.20 : 0
      x[Stats.CD] += (e >= 4 && m.e4CdBoost) ? 0.20 : 0
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
