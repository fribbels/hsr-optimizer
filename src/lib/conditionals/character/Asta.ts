import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const {basic, skill, ult, talent} = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const ultSpdBuffValue = ult(e, 50, 52.8)
  const talentStacksAtkBuff = talent(e, 0.14, 0.154)
  const talentStacksDefBuff = 0.06
  const skillExtraDmgHitsMax = (e >= 1) ? 5 : 4

  const basicScaling = basic(e, 1.0, 1.1)
  const skillScaling = skill(e, 0.50, 0.55)
  const ultScaling = ult(e, 0, 0)
  const dotScaling = basic(e, 0.50, 0.55)

  const content: ContentItem[] = [
    {
      formItem: 'slider',
      id: 'skillExtraDmgHits',
      name: 'skillExtraDmgHits',
      text: 'Skill extra hits',
      title: 'Skill: Meteor Storm',
      content: `Deals 50% ATK DMG equal to a single enemy. Deals DMG for ${precisionRound(skillExtraDmgHitsMax)} extra times to a random enemy.
    ::BR::
    E1: When using Skill, deals DMG for 1 extra time to a random enemy.`,
      min: 0,
      max: skillExtraDmgHitsMax,
    },
    {
      formItem: 'slider',
      id: 'talentBuffStacks',
      name: 'talentBuffStacks',
      text: 'Talent ATK buff stacks',
      title: 'Talent: Astrometry',
      content: `Increases allies' ATK by ${precisionRound(talentStacksAtkBuff * 100)}% for every stack.
    ::BR::
    E4: Asta's Energy Regeneration Rate increases by 15% when she has 2 or more Charging stacks.`,
      min: 0,
      max: 5,
    },
    {
      formItem: 'switch',
      id: 'ultSpdBuff',
      name: 'ultSpdBuff',
      text: 'Ult SPD buff active',
      title: 'Ultimate: Astral Blessing',
      content: `Increases SPD of all allies by ${precisionRound(ultSpdBuffValue)} for 2 turn(s).`,
    },
    {
      formItem: 'switch',
      id: 'fireDmgBoost',
      name: 'fireDmgBoost',
      text: 'Fire DMG boost',
      title: 'Trace: Ignite',
      content: `When Asta is on the field, all allies' Fire DMG increases by 18%.`,
    }
  ]

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
      x[Stats.DEF_P] += (r.talentBuffStacks) * talentStacksDefBuff
      x[Stats.ERR] += (e >= 4 && r.talentBuffStacks >= 2) ? 0.15 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling + r.skillExtraDmgHits * skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30 + 15 * r.skillExtraDmgHits

      x.DOT_CHANCE = 0.8

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.SPD] += (m.ultSpdBuff) ? ultSpdBuffValue : 0
      x[Stats.ATK_P] += (m.talentBuffStacks) * talentStacksAtkBuff

      x[Stats.Fire_DMG] += (m.fireDmgBoost) ? 0.18 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    },
  }
}
