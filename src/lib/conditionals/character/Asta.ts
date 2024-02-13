import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/constants'
import { basic, findContentId, precisionRound, skill, talent, ult } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const ultSpdBuffValue = ult(e, 50, 52.8)
  const talentStacksAtkBuff = talent(e, 0.14, 0.154)
  const talentStacksDefBuff = 0.06
  const skillExtraDmgHitsMax = (e >= 1) ? 5 : 4

  const basicScaling = basic(e, 1.0, 1.1)
  const skillScaling = skill(e, 0.50, 0.55)
  const ultScaling = ult(e, 0, 0)
  const dotScaling = basic(e, 0.50, 0.55)

  const content: ContentItem[] = [{
    formItem: 'slider',
    id: 'skillExtraDmgHits',
    name: 'skillExtraDmgHits',
    text: 'Skill extra hits',
    title: 'Skill: Meteor Storm',
    content: `Deals 50% ATK DMG equal to a single enemy. Deals DMG for ${precisionRound(skillExtraDmgHitsMax)} extra times to a random enemy.`,
    min: 0,
    max: skillExtraDmgHitsMax,
  }, {
    formItem: 'slider',
    id: 'talentBuffStacks',
    name: 'talentBuffStacks',
    text: 'Talent ATK buff stacks',
    title: 'Talent: Astrometry',
    content: `Increases allies' ATK by ${precisionRound(talentStacksAtkBuff * 100)}% for every stack.`,
    min: 0,
    max: 5,
  }, {
    formItem: 'switch',
    id: 'ultSpdBuff',
    name: 'ultSpdBuff',
    text: 'Ult SPD buff active',
    title: 'Ultimate: Astral Blessing',
    content: `Increases SPD of all allies by ${precisionRound(ultSpdBuffValue)} for 2 turn(s).`,
  }, {
    formItem: 'switch',
    id: 'fireDmgBoost',
    name: 'fireDmgBoost',
    text: 'Fire DMG boost',
    title: 'Trace: Ignite',
    content: `When Asta is on the field, all allies' Fire DMG increases by 18%.`,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'talentBuffStacks'),
    findContentId(content, 'ultSpdBuff'),
    findContentId(content, 'fireDmgBoost'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      talentBuffStacks: 5,
      skillExtraDmgHits: skillExtraDmgHitsMax,
      ultSpdBuff: true,
      fireDmgBoost: true,
    }),
    teammateDefaults: () => ({
      talentBuffStacks: 5,
      ultSpdBuff: true,
      fireDmgBoost: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r.talentBuffStacks) * talentStacksAtkBuff
      x[Stats.DEF_P] += (r.talentBuffStacks) * talentStacksDefBuff
      x[Stats.ERR] += (e >= 4 && r.talentBuffStacks >= 2) ? 0.15 : 0
      x[Stats.SPD] += (r.ultSpdBuff) ? ultSpdBuffValue : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling

      // Boost
      x.FIRE_DMG_BOOST += (r.fireDmgBoost) ? 0.18 : 0

      return x
    },
    teammatePrecomputeEffects: (x: ComputedStatsObject, _request: Form, teammateRequest: Form) => {
      const t = teammateRequest.characterConditionals

      x[Stats.SPD] += (t.ultSpdBuff) ? ultSpdBuffValue : 0
      x[Stats.ATK_P] += (t.talentBuffStacks) * talentStacksAtkBuff

      x.FIRE_DMG_BOOST += (t.fireDmgBoost) ? 0.18 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x']

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    },
  }
}
