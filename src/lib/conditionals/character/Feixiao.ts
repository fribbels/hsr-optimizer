import { ASHBLAZING_ATK_STACK, ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, calculateAshblazingSet } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { BETA_UPDATE, Stats } from 'lib/constants'
import { buffAbilityCd } from 'lib/optimizer/calculateBuffs'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)

  const ultScaling = ult(e, 0.60, 0.648)
  const ultBrokenScaling = ult(e, 0.30, 0.33)
  const ultFinalScaling = ult(e, 1.60, 1.728)

  const fuaScaling = talent(e, 1.10, 1.21)
  const talentDmgBuff = talent(e, 0.60, 0.66)

  const ultHitCountMulti = (1 * 0.1285 + 2 * 0.1285 + 3 * 0.1285 + 4 * 0.1285 + 5 * 0.1285 + 6 * 0.1285 + 7 * 0.2285)
  const ultBrokenHitCountMulti = (
    1 * 0.1285 * 0.1 + 2 * 0.1285 * 0.9
    + 3 * 0.1285 * 0.1 + 4 * 0.1285 * 0.9
    + 5 * 0.1285 * 0.1 + 6 * 0.1285 * 0.9
    + 7 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
    + 8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
    + 8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
    + 8 * 0.2285)

  function getUltHitMulti(request: Form) {
    const r = request.characterConditionals

    return r.weaknessBrokenUlt
      ? ASHBLAZING_ATK_STACK * ultBrokenHitCountMulti
      : ASHBLAZING_ATK_STACK * ultHitCountMulti
  }

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
      id: 'e4Buffs',
      name: 'e4Buffs',
      text: 'E4 buffs',
      title: 'E4 buffs',
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
    ultStacks: 6,
    weaknessBrokenUlt: true,
    talentDmgBuff: true,
    skillAtkBuff: true,
    e1OriginalDmgBoost: true,
    e4Buffs: true,
    e6Buffs: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => defaults,
    teammateDefaults: () => ({}),
    initializeConfigurations: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x.ULT_DMG_TYPE = ULT_TYPE | FUA_TYPE

      if (r.weaknessBrokenUlt) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }

      if (e >= 6 && r.e6Buffs) {
        x.FUA_DMG_TYPE = ULT_TYPE | FUA_TYPE
      }
    },
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Special case where we force the weakness break on if the ult break option is enabled
      if (!r.weaknessBrokenUlt) {
        x.ULT_BREAK_EFFICIENCY_BOOST += 1.00
      }

      buffAbilityCd(x, FUA_TYPE, 0.36)

      x[Stats.ATK_P] += (r.skillAtkBuff) ? 0.48 : 0
      x.ELEMENTAL_DMG += (r.talentDmgBuff) ? talentDmgBuff : 0

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.FUA_SCALING += fuaScaling

      x.ULT_SCALING += 6 * (ultScaling + ultBrokenScaling) + ultFinalScaling

      x.ULT_ORIGINAL_DMG_BOOST += (e >= 1 && r.e1OriginalDmgBoost) ? 0.3071 : 0

      if (e >= 4) {
        x[Stats.SPD_P] += 0.08
        x.FUA_TOUGHNESS_DMG += 15
      }

      if (e >= 6 && r.e6Buffs) {
        x.RES_PEN += 0.20
        x.FUA_SCALING += 1.40
      }

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90
      x.FUA_TOUGHNESS_DMG += 15

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * (x[Stats.ATK] + calculateAshblazingSet(x, request, getUltHitMulti(request)))
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] + calculateAshblazingSet(x, request, ASHBLAZING_ATK_STACK * (1 * 1.00)))
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    },
    gpuFinalizeCalculations: (request: Form) => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, ${getUltHitMulti(request)}));
x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, ${ASHBLAZING_ATK_STACK * (1 * 1.00)}));
x.DOT_DMG += x.DOT_SCALING * x.ATK;
    `
    },
  }
}
