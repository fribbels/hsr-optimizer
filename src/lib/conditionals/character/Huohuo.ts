import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'

export default (e: Eidolon): CharacterConditional => {
  const { basic, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const ultBuffValue = ult(e, 0.40, 0.432)
  const basicScaling = basic(e, 0.50, 0.55)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'ultBuff',
    name: 'ultBuff',
    text: 'Ult ATK buff',
    title: 'Ult ATK buff',
    content: `Increases all allies' ATK by ${precisionRound(ultBuffValue * 100)}% for 2 turns after using Ultimate.`,
  }, {
    formItem: 'switch',
    id: 'skillBuff',
    name: 'skillBuff',
    text: 'E1 SPD buff',
    title: 'E1 SPD buff',
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

  const teammateContent: ContentItem[] = [
    findContentId(content, 'ultBuff'),
    findContentId(content, 'skillBuff'),
    findContentId(content, 'e6DmgBuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      ultBuff: true,
      skillBuff: true,
      e6DmgBuff: true,
    }),
    teammateDefaults: () => ({
      ultBuff: true,
      skillBuff: true,
      e6DmgBuff: true,
    }),
    precomputeEffects: (_request) => {
      const x = Object.assign({}, baseComputedStatsObject)

      // Scaling
      x.BASIC_SCALING += basicScaling

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.ATK_P] += (m.ultBuff) ? ultBuffValue : 0
      x[Stats.SPD_P] += (e >= 1 && m.skillBuff) ? 0.12 : 0

      x.ELEMENTAL_DMG += (e >= 6 && m.e6DmgBuff) ? 0.50 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
    },
  }
}
