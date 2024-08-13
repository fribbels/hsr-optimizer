import { ASHBLAZING_ATK_STACK, baseComputedStatsObject, ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, calculateAshblazingSet, findContentId } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { BETA_UPDATE, Stats } from 'lib/constants'
import { buffAbilityCd, buffAbilityVulnerability } from "lib/optimizer/calculateBuffs";

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)

  const ultScaling = ult(e, 0.60, 0.648)
  const ultBrokenScaling = ult(e, 0.30, 0.33)
  const ultFinalScaling = ult(e, 1.60, 1.728)

  const fuaScaling = talent(e, 1.10, 1.21)
  const talentDmgBuff = talent(e, 0.60, 0.66)

  const ultHitCountMulti = ASHBLAZING_ATK_STACK * (1 * 0.1285 + 2 * 0.1285 + 3 * 0.1285 + 4 * 0.1285 + 5 * 0.1285 + 6 * 0.1285 + 7 * 0.2285)
  const ultBrokenHitCountMulti = ASHBLAZING_ATK_STACK * (
    1 * 0.1285 * 0.1 + 2 * 0.1285 * 0.9 +
    3 * 0.1285 * 0.1 + 4 * 0.1285 * 0.9 +
    5 * 0.1285 * 0.1 + 6 * 0.1285 * 0.9 +
    7 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9 +
    8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9 +
    8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9 +
    8 * 0.2285)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'weaknessBrokenUlt',
      name: 'weaknessBrokenUlt',
      text: 'Weakness broken ult (force weakness break)',
      title: 'Weakness broken ult (force weakness break)',
      content: `Overrides weakness break to be enabled. ${BETA_UPDATE}`,
    },
    {
      formItem: 'switch',
      id: 'talentDmgBuff',
      name: 'talentDmgBuff',
      text: 'Talent DMG buff',
      title: 'Talent DMG buff',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'skillAtkBuff',
      name: 'skillAtkBuff',
      text: 'Skill ATK buff',
      title: 'Skill ATK buff',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'e1OriginalDmgBoost',
      name: 'e1OriginalDmgBoost',
      text: 'E1 original DMG boost',
      title: 'E1 original DMG boost',
      content: BETA_UPDATE,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e4FuaVulnerability',
      name: 'e4FuaVulnerability',
      text: 'E4 FUA vulnerability',
      title: 'E4 FUA vulnerability',
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

  const teammateContent: ContentItem[] = [
    findContentId(content, 'e4FuaVulnerability'),
  ]

  const defaults = {
    ultStacks: 6,
    weaknessBrokenUlt: true,
    talentDmgBuff: true,
    skillAtkBuff: true,
    e1OriginalDmgBoost: true,
    e4FuaVulnerability: true,
    e6Buffs: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => defaults,
    teammateDefaults: () => ({
      e4FuaVulnerability: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Special case where we force the weakness break on if the ult break option is enabled
      if (r.weaknessBrokenUlt) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      } else {
        x.ULT_BREAK_EFFICIENCY_BOOST += 1.00
      }

      buffAbilityCd(x, FUA_TYPE, 0.36)

      x[Stats.ATK_P] += (r.skillAtkBuff) ? 0.48 : 0
      x.ELEMENTAL_DMG += (r.talentDmgBuff) ? talentDmgBuff : 0
      x.ULT_DMG_TYPE = ULT_TYPE | FUA_TYPE

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.FUA_SCALING += fuaScaling

      // TODO: Ashblazing
      x.ULT_SCALING += 6 * (ultScaling + ultBrokenScaling) + ultFinalScaling

      x.ULT_ORIGINAL_DMG_BOOST += (e >= 1 && r.e1OriginalDmgBoost) ? 0.3071 : 0

      if (e >= 6 && r.e6Buffs) {
        x.RES_PEN += 0.20
        x.FUA_DMG_TYPE = ULT_TYPE | FUA_TYPE
        x.FUA_SCALING += 1.40
      }

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 15 * 6 + 15
      x.FUA_TOUGHNESS_DMG += 15

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      buffAbilityVulnerability(x, FUA_TYPE, 0.10, (e >= 4 && m.e4FuaVulnerability))
    },
    precomputeTeammateEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x: ComputedStatsObject = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      // Ult is multi hit ashblazing
      if (r.weaknessBrokenUlt) {
        const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, ultBrokenHitCountMulti)
        x.ULT_DMG += x.ULT_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      } else {
        const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, ultHitCountMulti)
        x.ULT_DMG += x.ULT_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      }

      // // Everything else is single hit
      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, ASHBLAZING_ATK_STACK * (1 * 1.00))
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    },
  }
}
