import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, calculateAshblazingSet } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.16)
  const fuaScaling = talent(e, 0.66, 0.726)

  let hitMulti = 0

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'skillCritBuff',
    name: 'skillCritBuff',
    text: 'Skill CR buff',
    title: 'Skill CR buff',
    content: `After using Skill, CRIT Rate increases by 10% for 2 turns.`,
  }, {
    formItem: 'slider',
    id: 'talentHitsPerAction',
    name: 'talentHitsPerAction',
    text: 'Lightning Lord stacks',
    title: 'Lightning Lord stacks',
    content: `Lightning Lord hits-per-action stack up to 10 times.`,
    min: 3,
    max: 10,
  }, {
    formItem: 'slider',
    id: 'talentAttacks',
    name: 'talentAttacks',
    text: 'Lightning Lord hits on target',
    title: 'Lightning Lord hits on target',
    content: `Count of hits on target. Should usually be set to the same value as Lightning Lord Stacks.`,
    min: 0,
    max: 10,
  }, {
    formItem: 'switch',
    id: 'e2DmgBuff',
    name: 'e2DmgBuff',
    text: 'E2 dmg buff',
    title: 'E2 dmg buff',
    content: `E2: After Lightning-Lord takes action, DMG caused by Jing Yuan's Basic ATK, Skill, and Ultimate increases by 20% for 2 turns.`,
    disabled: e < 2,
  }, {
    formItem: 'slider',
    id: 'e6FuaVulnerabilityStacks',
    name: 'e6FuaVulnerabilityStacks',
    text: 'E6 vulnerable stacks',
    title: 'E6 vulnerable stacks',
    content: `E6: Each hit performed by the Lightning-Lord when it takes action will make the target enemy Vulnerable. While Vulnerable, enemies receive 12% more DMG until the end of the Lightning-Lord's current turn, stacking up to 3 time(s). (applies to all hits)`,
    min: 0,
    max: 3,
    disabled: e < 6,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      skillCritBuff: true,
      talentHitsPerAction: 10,
      talentAttacks: 10,
      e2DmgBuff: true,
      e6FuaVulnerabilityStacks: 3,
    }),
    teammateDefaults: () => ({
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      r.talentHitsPerAction = Math.max(r.talentHitsPerAction, r.talentAttacks)

      // Stats
      x[Stats.CR] += (r.skillCritBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      // Boost
      x.FUA_CD_BOOST += (r.talentHitsPerAction >= 6) ? 0.25 : 0
      x.BASIC_BOOST += (e >= 2 && r.e2DmgBuff) ? 0.20 : 0
      x.SKILL_BOOST += (e >= 2 && r.e2DmgBuff) ? 0.20 : 0
      x.ULT_BOOST += (e >= 2 && r.e2DmgBuff) ? 0.20 : 0

      x.FUA_VULNERABILITY += (e >= 6) ? r.e6FuaVulnerabilityStacks * 0.12 : 0

      // Lightning lord calcs
      const stacks = r.talentHitsPerAction
      const hits = r.talentAttacks
      const stacksPerMiss = (request.enemyCount >= 3) ? 2 : 0
      const stacksPerHit = (request.enemyCount >= 3) ? 3 : 1
      const stacksPreHit = (request.enemyCount >= 3) ? 2 : 1

      // Calc stacks on miss
      let ashblazingStacks = stacksPerMiss * (stacks - hits)

      // Calc stacks on hit
      ashblazingStacks += stacksPreHit
      let atkBoostSum = 0
      for (let i = 0; i < hits; i++) {
        atkBoostSum += Math.min(8, ashblazingStacks) * (1 / hits)
        ashblazingStacks += stacksPerHit
      }

      hitMulti = atkBoostSum * 0.06

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 15 * hits

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
      // TODO: Technically E6 has a vulnerability but its kinda hard to calc
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * r.talentAttacks * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    },
  }
}
