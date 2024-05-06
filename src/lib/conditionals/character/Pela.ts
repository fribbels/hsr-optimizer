import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const ultDefPenValue = ult(e, 0.40, 0.42)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const ultScaling = ult(e, 1.00, 1.08)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'teamEhrBuff',
    name: 'teamEhrBuff',
    text: 'Team EHR buff',
    title: 'Team EHR buff',
    content: `When Pela is on the battlefield, all allies' Effect Hit Rate increases by 10%.`,
  }, {
    formItem: 'switch',
    id: 'enemyDebuffed',
    name: 'enemyDebuffed',
    text: 'Enemy debuffed',
    title: 'Enemy debuffed',
    content: `Deals 20% more DMG to debuffed enemies.`,
  }, {
    formItem: 'switch',
    id: 'skillRemovedBuff',
    name: 'skillRemovedBuff',
    text: 'Enemy buff removed skill buffs',
    title: 'Enemy buff removed skill buffs',
    content: `Using Skill to remove buff(s) increases the DMG of Pela's next attack by 20%.
    ::BR::
    E2: Using Skill to remove buff(s) increases SPD by 10% for 2 turn(s).`,
  }, {
    formItem: 'switch',
    id: 'ultDefPenDebuff',
    name: 'ultDefPenDebuff',
    text: 'Ult DEF shred debuff',
    title: 'Ult DEF shred debuff',
    content: `When Exposed, enemies' DEF is reduced by ${precisionRound(ultDefPenValue * 100)}% for 2 turn(s).`,
  }, {
    formItem: 'switch',
    id: 'e4SkillResShred',
    name: 'e4SkillResShred',
    text: 'E4 skill Ice RES shred',
    title: 'E4 skill Ice RES shred',
    content: `E4: When using Skill, there is a 100% base chance to reduce the target enemy's Ice RES by 12% for 2 turn(s).`,
    disabled: e < 4,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'teamEhrBuff'),
    findContentId(content, 'ultDefPenDebuff'),
    findContentId(content, 'e4SkillResShred'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      teamEhrBuff: true,
      enemyDebuffed: true,
      skillRemovedBuff: false,
      ultDefPenDebuff: true,
      e4SkillResShred: true,
    }),
    teammateDefaults: () => ({
      teamEhrBuff: true,
      ultDefPenDebuff: true,
      e4SkillResShred: true,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.SPD_P] += (e >= 2 && r.skillRemovedBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.BASIC_BOOST += (r.skillRemovedBuff) ? 0.20 : 0
      x.SKILL_BOOST += (r.skillRemovedBuff) ? 0.20 : 0
      x.ULT_BOOST += (r.skillRemovedBuff) ? 0.20 : 0

      x.ELEMENTAL_DMG += (r.enemyDebuffed) ? 0.20 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.EHR] += (m.teamEhrBuff) ? 0.10 : 0

      x.DEF_SHRED += (m.ultDefPenDebuff) ? ultDefPenValue : 0
      x.ICE_RES_PEN += (e >= 4 && m.e4SkillResShred) ? 0.12 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      x.BASIC_DMG += (e >= 6) ? 0.40 * x[Stats.ATK] : 0
      x.SKILL_DMG += (e >= 6) ? 0.40 * x[Stats.ATK] : 0
      x.ULT_DMG += (e >= 6) ? 0.40 * x[Stats.ATK] : 0
    },
  }
}
