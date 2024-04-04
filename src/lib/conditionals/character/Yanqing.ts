import { Stats } from 'lib/constants'

import { ASHBLAZING_ATK_STACK, baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, calculateAshblazingSet, precisionRound } from '../utils'
import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const ultCdBuffValue = ult(e, 0.50, 0.54)
  const talentCdBuffValue = ult(e, 0.30, 0.33)
  const talentCrBuffValue = ult(e, 0.20, 0.21)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.20, 2.42)
  const ultScaling = ult(e, 3.50, 3.78)
  const fuaScaling = talent(e, 0.50, 0.55)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'ultBuffActive',
    name: 'ultBuffActive',
    text: 'Ult buff active',
    title: 'Ult buff active',
    content: `Increases Yanqing's CRIT Rate by 60%. When Soulsteel Sync is active, increases Yanqing's CRIT DMG by an extra ${precisionRound(ultCdBuffValue * 100)}%.`,
  }, {
    formItem: 'switch',
    id: 'soulsteelBuffActive',
    name: 'soulsteelBuffActive',
    text: 'Soulsteel buff active',
    title: 'Soulsteel buff active',
    content: `When Soulsteel Sync is active, Yanqing's CRIT Rate increases by ${precisionRound(talentCrBuffValue * 100)}% and his CRIT DMG increases by ${precisionRound(talentCdBuffValue * 100)}%. 
    ::BR::
    Before using Ultimate, when Soulsteel Sync is active, increases Yanqing's CRIT DMG by an extra ${precisionRound(ultCdBuffValue * 100)}%.
    ::BR::
    When Soulsteel Sync is active, Effect RES increases by 20%.
    ::BR::
    E2: When Soulsteel Sync is active, Energy Regeneration Rate increases by an extra 10%.
    `,
  }, {
    formItem: 'switch',
    id: 'critSpdBuff',
    name: 'critSpdBuff',
    text: 'Crit spd buff',
    title: 'Crit spd buff',
    content: 'When a CRIT Hit is triggered, increases SPD by 10% for 2 turn(s).',
  }, {
    formItem: 'switch',
    id: 'e1TargetFrozen',
    name: 'e1TargetFrozen',
    text: 'E1 target frozen',
    title: 'E1 target frozen',
    content: 'When Yanqing attacks a Frozen enemy, he deals Additional Ice DMG equal to 60% of his ATK.',
    disabled: (e < 1),
  }, {
    formItem: 'switch',
    id: 'e4CurrentHp80',
    name: 'e4CurrentHp80',
    text: 'E4 self HP ≥ 80% RES PEN buff',
    title: 'E4 self HP ≥ 80% RES PEN buff',
    content: 'When the current HP percentage is 80% or higher, Ice RES PEN increases by 12%.',
    disabled: (e < 4),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      ultBuffActive: true,
      soulsteelBuffActive: true,
      critSpdBuff: true,
      e1TargetFrozen: true,
      e4CurrentHp80: true,
    }),
    teammateDefaults: () => ({
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CR] += (r.ultBuffActive) ? 0.60 : 0
      x[Stats.CD] += (r.ultBuffActive && r.soulsteelBuffActive) ? ultCdBuffValue : 0
      x[Stats.CR] += (r.soulsteelBuffActive) ? talentCrBuffValue : 0
      x[Stats.CD] += (r.soulsteelBuffActive) ? talentCdBuffValue : 0
      x[Stats.RES] += (r.soulsteelBuffActive) ? 0.20 : 0
      x[Stats.SPD_P] += (r.critSpdBuff) ? 0.10 : 0
      x[Stats.ERR] += (e >= 2 && r.soulsteelBuffActive) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      x.BASIC_SCALING += (request.enemyElementalWeak) ? 0.30 : 0
      x.SKILL_SCALING += (request.enemyElementalWeak) ? 0.30 : 0
      x.ULT_SCALING += (request.enemyElementalWeak) ? 0.30 : 0
      x.FUA_SCALING += (request.enemyElementalWeak) ? 0.30 : 0

      x.BASIC_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.SKILL_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.ULT_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.FUA_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0

      // Boost
      x.ICE_RES_PEN += (e >= 4 && r.e4CurrentHp80) ? 0.12 : 0

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    },
  }
}
