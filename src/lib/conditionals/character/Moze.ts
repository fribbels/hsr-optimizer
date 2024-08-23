import { ASHBLAZING_ATK_STACK, baseComputedStatsObject, ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, calculateAshblazingSet, findContentId } from 'lib/conditionals/utils'

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
  const ultScaling = ult(e, 2.70, 2.916)

  const fuaScaling = talent(e, 1.60, 1.76)
  const additionalDmgScaling = talent(e, 0.30, 0.33)

  const fuaHitCountMulti = ASHBLAZING_ATK_STACK * (1 * 0.08 + 2 * 0.08 + 3 * 0.08 + 4 * 0.08 + 5 * 0.08 + 6 * 0.6)

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
      id: 'e2CdBoost',
      name: 'e2CdBoost',
      text: 'E2 CD boost',
      title: 'E2 CD boost',
      content: BETA_UPDATE,
      disabled: e < 2
    },
    {
      formItem: 'switch',
      id: 'e4DmgBuff',
      name: 'e4DmgBuff',
      text: 'E4 DMG buff',
      title: 'E4 DMG buff',
      content: BETA_UPDATE,
      disabled: e < 4
    },
    {
      formItem: 'switch',
      id: 'e6MultiplierIncrease',
      name: 'e6MultiplierIncrease',
      text: 'E6 FUA multiplier buff',
      title: 'E6 FUA multiplier buff',
      content: BETA_UPDATE,
      disabled: e < 6
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'preyMark'),
    findContentId(content, 'e2CdBoost'),
  ]

  const defaults = {
    preyMark: true,
    e2CdBoost: true,
    e4DmgBuff: true,
    e6MultiplierIncrease: true
  }

  const teammateDefaults = {
    preyMark: true,
    e2CdBoost: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x.ELEMENTAL_DMG += (e >= 4 && r.e4DmgBuff) ? 0.30 : 0

      x.ULT_DMG_TYPE = ULT_TYPE | FUA_TYPE

      x.BASIC_SCALING += basicScaling + ((r.preyMark) ? additionalDmgScaling : 0)
      x.SKILL_SCALING += skillScaling + ((r.preyMark) ? additionalDmgScaling : 0)
      x.FUA_SCALING += fuaScaling + ((r.preyMark) ? additionalDmgScaling : 0)
      x.FUA_SCALING += (e >= 6 && r.e6MultiplierIncrease) ? 0.25 : 0
      x.ULT_SCALING += ultScaling + ((r.preyMark) ? additionalDmgScaling : 0)


      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90
      x.FUA_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      buffAbilityVulnerability(x, FUA_TYPE, 0.25, (m.preyMark))

      x[Stats.CD] += (e >= 2 && m.preyMark && m.e2CdBoost) ? 0.40 : 0
    },
    precomputeTeammateEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x: ComputedStatsObject = c.x

      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, fuaHitCountMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
