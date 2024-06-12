import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'

const betaUpdate = 'All calculations are subject to change. Last updated v4 05-27-2024.'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.00, 2.20)

  const skillScaling = skill(e, 2.00, 2.20)
  const skillEnhancedAtkScaling = skill(e, 2.00, 2.20)

  const ultSpdBuff = ult(e, 60, 66)
  const ultWeaknessBrokenBreakVulnerability = ult(e, 0.20, 0.22)
  const talentResBuff = talent(e, 0.30, 0.34)
  const talentDmgReductionBuff = talent(e, 0.40, 0.44)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'enhancedStateActive',
      name: 'enhancedStateActive',
      text: 'Enhanced state',
      title: 'Enhanced state',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'enhancedStateSpdBuff',
      name: 'enhancedStateSpdBuff',
      text: 'Enhanced SPD buff',
      title: 'Enhanced SPD buff',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'superBreakDmg',
      name: 'superBreakDmg',
      text: 'Super Break enabled',
      title: 'Super Break enabled',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'atkToBeConversion',
      name: 'atkToBeConversion',
      text: 'ATK to BE conversion',
      title: 'ATK to BE conversion',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'talentDmgReductionBuff',
      name: 'talentDmgReductionBuff',
      text: 'Max EHP buff',
      title: 'Max EHP buff',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'e1DefShred',
      name: 'e1DefShred',
      text: 'E1 DEF shred',
      title: 'E1 DEF shred',
      content: betaUpdate,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e4ResBuff',
      name: 'e4ResBuff',
      text: 'E4 RES buff',
      title: 'E4 RES buff',
      content: betaUpdate,
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6Buffs',
      name: 'e6Buffs',
      text: 'E6 buffs',
      title: 'E6 buffs',
      content: betaUpdate,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = []

  const defaults = {
    enhancedStateActive: true,
    enhancedStateSpdBuff: true,
    superBreakDmg: true,
    atkToBeConversion: true,
    talentDmgReductionBuff: true,
    e1DefShred: true,
    e4ResBuff: true,
    e6Buffs: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({}),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Special case where we force the weakness break on if the option is enabled
      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }

      x[Stats.RES] += (r.enhancedStateActive) ? talentResBuff : 0
      x[Stats.SPD] += (r.enhancedStateActive && r.enhancedStateSpdBuff) ? ultSpdBuff : 0
      x.BREAK_EFFICIENCY_BOOST += (r.enhancedStateActive) ? 0.50 : 0
      x.DMG_RED_MULTI *= (r.enhancedStateActive && r.talentDmgReductionBuff) ? (1 - talentDmgReductionBuff) : 1

      // Should be skill def shred but skill doesnt apply to super break
      x.DEF_SHRED += (e >= 1 && r.e1DefShred && r.enhancedStateActive) ? 0.15 : 0
      x[Stats.RES] += (e >= 4 && r.e4ResBuff && r.enhancedStateActive) ? 0.50 : 0
      x.FIRE_RES_PEN += (e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.20 : 0
      x.BREAK_EFFICIENCY_BOOST += (e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.50 : 0

      x.BASIC_SCALING += (r.enhancedStateActive) ? basicEnhancedScaling : basicScaling

      x.BASIC_TOUGHNESS_DMG += (r.enhancedStateActive) ? 45 : 30
      x.SKILL_TOUGHNESS_DMG += (r.enhancedStateActive) ? 90 : 60

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    precomputeTeammateEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x: ComputedStatsObject = c.x

      x.BREAK_VULNERABILITY += (r.enhancedStateActive && x.ENEMY_WEAKNESS_BROKEN) ? ultWeaknessBrokenBreakVulnerability : 0

      const trueAtk = x[Stats.ATK] - x.RATIO_BASED_ATK_BUFF - (x.RATIO_BASED_ATK_P_BUFF * request.baseAtk)
      x[Stats.BE] += (r.atkToBeConversion && (trueAtk > 1800)) ? 0.008 * Math.floor((trueAtk - 1800) / 10) : 0

      x.SUPER_BREAK_MODIFIER += (r.superBreakDmg && r.enhancedStateActive && x[Stats.BE] >= 2.00) ? 0.35 : 0
      x.SUPER_BREAK_MODIFIER += (r.superBreakDmg && r.enhancedStateActive && x[Stats.BE] >= 3.60) ? 0.15 : 0

      x.SKILL_SCALING += (r.enhancedStateActive) ? (0.2 * Math.min(3.60, x[Stats.BE]) + skillEnhancedAtkScaling) : skillScaling

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
    },
  }
}
