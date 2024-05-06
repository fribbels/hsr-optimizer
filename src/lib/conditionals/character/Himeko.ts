import { Stats } from 'lib/constants'
import {
  ASHBLAZING_ATK_STACK,
  baseComputedStatsObject,
  ComputedStatsObject
} from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, calculateAshblazingSet, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const ultScaling = ult(e, 2.30, 2.484)
  const fuaScaling = talent(e, 1.40, 1.54)
  const dotScaling = 0.30

  const hitMultiByTargets = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.20 + 2 * 0.20 + 3 * 0.20 + 4 * 0.40), // 0.168
    3: ASHBLAZING_ATK_STACK * (2 * 0.20 + 5 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.372
    5: ASHBLAZING_ATK_STACK * (3 * 0.20 + 8 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.42
  }

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'targetBurned',
      name: 'targetBurned',
      text: 'Target burned',
      title: 'Target burned',
      content: `Skill deals 20% more DMG to enemies currently afflicted with Burn.`,
    },
    {
      formItem: 'switch',
      id: 'selfCurrentHp80Percent',
      name: 'selfCurrentHp80Percent',
      text: 'Self HP ≥ 80% CR boost',
      title: 'Self HP ≥ 80% CR boost',
      content: `When current HP percentage is 80% or higher, CRIT Rate increases by 15%.`,
    },
    {
      formItem: 'switch',
      id: 'e1TalentSpdBuff',
      name: 'e1TalentSpdBuff',
      text: 'E1 SPD buff',
      title: 'E1 SPD buff',
      content: `E1: After Victory Rush is triggered, Himeko's SPD increases by 20% for 2 turns.`,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2EnemyHp50DmgBoost',
      name: 'e2EnemyHp50DmgBoost',
      text: 'E2 enemy HP ≤ 50% DMG boost',
      title: 'E2: Convergence',
      content: `E2: Deals 15% more DMG to enemies whose HP percentage is 50% or less.`,
      disabled: e < 2,
    },
    {
      formItem: 'slider',
      id: 'e6UltExtraHits',
      name: 'e6UltExtraHits',
      text: 'E6 ult extra hits',
      title: 'E6 ult extra hits',
      content: `Ultimate deals DMG 2 extra times. Extra hits deals ${precisionRound(0.40 * 100)}% of the original DMG per hit.`,
      min: 0,
      max: 2,
      disabled: e < 6,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      targetBurned: true,
      selfCurrentHp80Percent: true,
      e1TalentSpdBuff: false,
      e6UltExtraHits: 2,
    }),
    teammateDefaults: () => ({
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CR] += (r.selfCurrentHp80Percent) ? 0.15 : 0
      x[Stats.SPD_P] += (e >= 1 && r.e1TalentSpdBuff) ? 0.20 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 6) ? r.e6UltExtraHits * ultScaling * 0.40 : 0
      x.FUA_SCALING += fuaScaling
      x.DOT_SCALING += dotScaling

      // Boost
      x.SKILL_BOOST += (r.targetBurned) ? 0.20 : 0
      x.ELEMENTAL_DMG += (e >= 2 && r.e2EnemyHp50DmgBoost) ? 0.15 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]

      const hitMulti = hitMultiByTargets[request.enemyCount]
      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    },
  }
}
