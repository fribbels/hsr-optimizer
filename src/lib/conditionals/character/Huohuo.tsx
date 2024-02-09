import { Stats } from 'lib/constants'
import { baseComputedStatsObject } from 'lib/conditionals/constants'
import { basic, precisionRound, ult } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const ultBuffValue = ult(e, 0.40, 0.432)
  const basicScaling = basic(e, 0.50, 0.55)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'ultBuff',
    name: 'ultBuff',
    text: 'Ult buff',
    title: 'Ult buff',
    content: `Increases all allies' ATK by ${precisionRound(ultBuffValue * 100)}% for 2 turns after using Ultimate.`,
  }, {
    formItem: 'switch',
    id: 'skillBuff',
    name: 'skillBuff',
    text: 'E1 skill buff',
    title: 'E1 skill buff',
    content: `E1: Increases all allies' SPD by 12% for 2 turns after using Skill.`,
    disabled: e < 1,
  }, {
    formItem: 'switch',
    id: 'e6DmgBuff',
    name: 'e6DmgBuff',
    text: 'E6 DMG buff',
    title: 'E6 DMG buff',
    content: `E6: When healing a target ally, increases the target ally's DMG dealt by 50% for 2 turns.`,
    disabled: e < 6,
  }]

  return {
    content: () => content,
    defaults: () => ({
      ultBuff: true,
      skillBuff: true,
      e6DmgBuff: true,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.SPD_P] += (e >= 1 && r.skillBuff) ? 0.12 : 0
      x[Stats.ATK_P] += (r.ultBuff) ? ultBuffValue : 0

      // Scaling
      x.BASIC_SCALING += basicScaling

      // Boost
      x.ELEMENTAL_DMG += (e >= 6 && r.skillBuff) ? 0.50 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
    },
  }
}
