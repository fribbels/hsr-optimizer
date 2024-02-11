import { Stats } from 'lib/constants'
import { baseComputedStatsObject } from 'lib/conditionals/constants'
import { basic, precisionRound, skill, ult } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const ultDefPenValue = ult(e, 0.40, 0.42)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const ultScaling = ult(e, 1.00, 1.08)

  const content: ContentItem[] = [{
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
    text: 'Enemy buff removed skill buff',
    title: 'Enemy buff removed skill buff',
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
    text: 'E4 skill RES shred',
    title: 'E4 skill RES shred',
    content: `E4: When using Skill, there is a 100% base chance to reduce the target enemy's Ice RES by 12% for 2 turn(s).`,
    disabled: e < 4,
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemyDebuffed: true,
      skillRemovedBuff: true,
      ultDefPenDebuff: true,
      e4SkillResShred: true,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.EHR] += 0.10
      x[Stats.SPD_P] += (e >= 2 && r.skillRemovedBuff) ? 0.10 : 0
      x[Stats.SPD_P] += (e >= 2 && r.skillRemovedBuff) ? 0.10 : 0
      x[Stats.SPD_P] += (e >= 2 && r.skillRemovedBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.BASIC_BOOST += (r.skillRemovedBuff) ? 0.20 : 0
      x.SKILL_BOOST += (r.skillRemovedBuff) ? 0.20 : 0
      x.ULT_BOOST += (r.skillRemovedBuff) ? 0.20 : 0

      x.RES_PEN += (e >= 4 && r.e4SkillResShred) ? 0.12 : 0
      x.DEF_SHRED += (r.ultDefPenDebuff) ? ultDefPenValue : 0

      x.ELEMENTAL_DMG += (r.enemyDebuffed) ? 0.20 : 0

      return x
    },
    calculateBaseMultis: (c) => {
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
