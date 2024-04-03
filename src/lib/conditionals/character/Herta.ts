import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, calculateAshblazingSet, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.16)
  const fuaScaling = talent(e, 0.40, 0.43)

  const hitMultiByTargets = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1),
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 1),
  }

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'techniqueBuff',
      name: 'techniqueBuff',
      text: 'Technique buff',
      title: 'Technique buff',
      content: `Increases ATK by ${precisionRound(0.40 * 100)}% for 3 turns.`,
    },
    {
      formItem: 'switch',
      id: 'targetFrozen',
      name: 'targetFrozen',
      text: 'Target frozen',
      title: 'Target frozen',
      content: `When Ultimate is used, deals ${precisionRound(0.20 * 100)}% more DMG to Frozen enemies.`,
    },
    {
      formItem: 'switch',
      id: 'enemyHpGte50',
      name: 'enemyHpGte50',
      text: 'Enemy HP ≥ 50% skill DMG boost',
      title: 'One-Time Offer',
      content: `Skill: If the enemy's HP percentage is 50% or higher, DMG dealt to this target increases by 20%.`,
    },
    {
      formItem: 'switch',
      id: 'enemyHpLte50',
      name: 'enemyHpLte50',
      text: 'E1 enemy HP ≤ 50% basic scaling boost',
      title: 'E1: Kick You When You\'re Down',
      content: `E1: If the enemy's HP percentage is at 50% or less, Herta's Basic ATK deals Additional Ice DMG equal to 40% of Herta's ATK.`,
      disabled: e < 1,
    },
    {
      formItem: 'slider',
      id: 'e2TalentCritStacks',
      name: 'e2TalentCritStacks',
      text: 'E2 talent CR stacks',
      title: 'E2 talent CR stacks',
      content: `E2: Increases CRIT Rate by 3% per stack. Stacks up to 5 times.`,
      min: 0,
      max: 5,
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e6UltAtkBuff',
      name: 'e6UltAtkBuff',
      text: 'E6 ult ATK buff',
      title: 'E6 ult ATK buff',
      content: `E6: After Ult, increases ATK by ${precisionRound(0.25 * 100)}% for 1 turn.`,
      disabled: e < 6,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      techniqueBuff: true,
      targetFrozen: true,
      e2TalentCritStacks: 5,
      e6UltAtkBuff: true,
      enemyHpGte50: true,
      enemyHpLte50: false,
    }),
    teammateDefaults: () => ({
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r.techniqueBuff) ? 0.40 : 0
      x[Stats.CR] += (e >= 2) ? r.e2TalentCritStacks * 0.03 : 0
      x[Stats.ATK_P] += (e >= 6 && r.e6UltAtkBuff) ? 0.25 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.BASIC_SCALING += (e >= 1 && r.enemyHpLte50) ? 0.40 : 0
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      x.SKILL_BOOST += (r.enemyHpGte50) ? 0.45 : 0

      // Boost
      x.ULT_BOOST += (r.targetFrozen) ? 0.20 : 0
      x.FUA_BOOST += (e >= 4) ? 0.10 : 0

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      const hitMulti = hitMultiByTargets[request.enemyCount]
      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    },
  }
}
