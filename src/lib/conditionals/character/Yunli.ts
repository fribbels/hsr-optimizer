import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { BETA_UPDATE, Stats } from 'lib/constants'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultSlashScaling = ult(e, 2.40, 2.592)
  const ultCullScaling = ult(e, 2.40, 2.592)
  const ultCullHitsScaling = ult(e, 0.80, 0.864)

  const blockCdBuff = ult(e, 1.00, 1.08)

  const talentCounterScaling = talent(e, 1.20, 1.32)

  const maxCullHits = (e >= 1) ? 9 : 6

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'blockActive',
      name: 'blockActive',
      text: 'Block active',
      title: 'Block active',
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
      id: 'e2CrBuff',
      name: 'e2CrBuff',
      text: 'E2 CR buff',
      title: 'E2 CR buff',
      content: BETA_UPDATE,
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e4DefShred',
      name: 'e4DefShred',
      text: 'E4 DEF shred',
      title: 'E4 DEF shred',
      content: BETA_UPDATE,
      disabled: e < 4,
    },
  ]

  const teammateContent: ContentItem[] = []

  const defaults = {
    blockActive: true,
    ultCull: true,
    ultCullHits: maxCullHits,
    counterAtkBuff: true,
    e1UltBuff: true,
    e2CrBuff: true,
    e4DefShred: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({}),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x[Stats.CD] += (r.blockActive) ? blockCdBuff : 0
      x[Stats.ATK_P] += (r.counterAtkBuff) ? 0.30 : 0
      x.DMG_RED_MULTI *= (r.blockActive) ? 1 - 0.20 : 1

      x[Stats.CR] += (e >= 2 && r.e2CrBuff) ? 0.18 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.BASIC_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += (r.blockActive) ? 60 : 30

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      if (r.blockActive) {
        if (r.ultCull) {
          x.FUA_SCALING += ultCullScaling + r.ultCullHits * ultCullHitsScaling
        } else {
          x.FUA_SCALING += ultSlashScaling
        }
      } else {
        x.FUA_SCALING += talentCounterScaling
      }

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    precomputeTeammateEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x: ComputedStatsObject = c.x

      if (r.blockActive && r.ultCull) {
        x.FUA_BOOST += x.ULT_BOOST
        x.FUA_CD_BOOST += x.ULT_CD_BOOST
        x.FUA_CR_BOOST += x.ULT_CR_BOOST
        x.FUA_VULNERABILITY = x.ULT_VULNERABILITY
        x.FUA_DEF_PEN = x.ULT_DEF_PEN
        x.FUA_RES_PEN = x.ULT_RES_PEN
      }

      x.FUA_DEF_PEN += (e >= 4 && r.e4DefShred) ? 0.20 : 0
      x.FUA_BOOST += (e >= 1 && r.e1UltBuff) ? 0.20 : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * x[Stats.ATK]
    },
  }
}
