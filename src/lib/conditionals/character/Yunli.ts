import {
  ASHBLAZING_ATK_STACK,
  baseComputedStatsObject,
  ComputedStatsObject,
  FUA_TYPE,
  ULT_TYPE
} from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, calculateAshblazingSet } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { BETA_UPDATE, Stats } from 'lib/constants'
import {
  buffAbilityCd,
  buffAbilityCr,
  buffAbilityDefShred,
  buffAbilityDmg,
  buffAbilityResShred
} from 'lib/optimizer/calculateBuffs'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultSlashScaling = ult(e, 2.20, 2.376)
  const ultCullScaling = ult(e, 2.20, 2.376)
  const ultCullHitsScaling = ult(e, 0.72, 0.7776)

  const blockCdBuff = ult(e, 1.00, 1.08)

  const talentCounterScaling = talent(e, 1.20, 1.32)

  const maxCullHits = (e >= 1) ? 9 : 6

  // Slash is the same, 1 hit
  const fuaHitCountMultiByTargets = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 1), // 0.18
  }

  const cullHitCountMultiByTargets = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.12 + 2 * 0.12 + 3 * 0.12 + 4 * 0.12 + 5 * 0.12 + 6 * 0.12 + 7 * 0.12 + 8 * 0.16), // 0.2784
    3: ASHBLAZING_ATK_STACK * (2 * 0.12 + 5 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.16), // 0.4152
    5: ASHBLAZING_ATK_STACK * (3 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.16), // 0.444
  }

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'blockActive',
      name: 'blockActive',
      text: 'Parry active',
      title: 'Parry active',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'ultCull',
      name: 'ultCull',
      text: 'Intuit: Cull enabled',
      title: 'Intuit: Cull enabled',
      content: BETA_UPDATE,
    },
    {
      formItem: 'slider',
      id: 'ultCullHits',
      name: 'ultCullHits',
      text: `Intuit: Cull hits`,
      title: 'Intuit: Cull hits',
      content: BETA_UPDATE,
      min: 0,
      max: maxCullHits,
    },
    {
      formItem: 'switch',
      id: 'counterAtkBuff',
      name: 'counterAtkBuff',
      text: 'Counter ATK buff',
      title: 'Counter ATK buff',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'e1UltBuff',
      name: 'e1UltBuff',
      text: 'E1 Ult buff',
      title: 'E1 Ult buff',
      content: BETA_UPDATE,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2DefShred',
      name: 'e2DefShred',
      text: 'E2 FUA DEF shred',
      title: 'E2 FUA DEF shred',
      content: BETA_UPDATE,
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e4ResBuff',
      name: 'e4ResBuff',
      text: 'E4 RES buff',
      title: 'E4 RES buff',
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
    blockActive: true,
    ultCull: true,
    ultCullHits: maxCullHits,
    counterAtkBuff: true,
    e1UltBuff: true,
    e2DefShred: true,
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

      if (r.blockActive) {
        if (r.ultCull) {
          x.FUA_DMG_TYPE = ULT_TYPE | FUA_TYPE
          x.FUA_SCALING += ultCullScaling + r.ultCullHits * ultCullHitsScaling
        } else {
          x.FUA_SCALING += ultSlashScaling
        }
      } else {
        x.FUA_SCALING += talentCounterScaling
      }

      buffAbilityCd(x, FUA_TYPE, blockCdBuff, (r.blockActive))
      x[Stats.ATK_P] += (r.counterAtkBuff) ? 0.30 : 0

      x.DMG_RED_MULTI *= (r.blockActive) ? 1 - 0.20 : 1


      buffAbilityDmg(x, FUA_TYPE, 0.20, (e >= 1 && r.e1UltBuff && r.blockActive))
      buffAbilityDefShred(x, FUA_TYPE, 0.20, (e >= 2 && r.e2DefShred))
      x[Stats.RES] += (e >= 4 && r.e4ResBuff) ? 0.50 : 0
      buffAbilityCr(x, FUA_TYPE, 0.15, (e >= 6 && r.e6Buffs && r.blockActive))
      buffAbilityResShred(x, FUA_TYPE, 0.20, (e >= 6 && r.e6Buffs && r.blockActive))

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += (r.blockActive) ? 60 : 30
      x.FUA_TOUGHNESS_DMG += (r.blockActive && r.ultCull) ? r.ultCullHits * 15 : 0

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    precomputeTeammateEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x: ComputedStatsObject = c.x

      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request,
        (r.blockActive && r.ultCull)
          ? cullHitCountMultiByTargets[request.enemyCount]
          : fuaHitCountMultiByTargets[request.enemyCount])

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    },
  }
}
