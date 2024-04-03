import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  let ultStackScaling = ult(e, 0.60, 0.65)
  ultStackScaling += (e >= 4 ? 0.06 : 0)

  const content: ContentItem[] = [{
    formItem: 'slider',
    id: 'ultHitsOnTarget',
    name: 'ultHitsOnTarget',
    text: 'Ult hits on target',
    title: 'Ult hits on target',
    content: `Number of Ultimate hits on the primary target, dealing DMG equal to ${precisionRound(ultStackScaling * 100)}% ATK per hit.`,
    min: 1,
    max: 10,
  }, {
    formItem: 'switch',
    id: 'enemyFrozen',
    name: 'enemyFrozen',
    text: 'Enemy frozen',
    title: 'Enemy frozen',
    content: `When dealing DMG to Frozen enemies, increases CRIT DMG by 30%.`,
  }, {
    formItem: 'switch',
    id: 'e2DefReduction',
    name: 'e2DefReduction',
    text: 'E2 DEF reduction',
    title: 'E2 DEF reduction',
    content: `E2: Reduces the target's DEF by 16% for 3 turn(s).`,
    disabled: e < 2,
  }, {
    formItem: 'switch',
    id: 'e6UltDmgBoost',
    name: 'e6UltDmgBoost',
    text: 'E6 ult DMG boost',
    title: 'E6 ult DMG boost',
    content: `E6: When using the Ultimate, increases own DMG by 30%, lasting until the end of the turn.`,
    disabled: e < 6,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'e2DefReduction'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      ultHitsOnTarget: 10,
      enemyFrozen: true,
      e2DefReduction: true,
      e6UltDmgBoost: true,
    }),
    teammateDefaults: () => ({
      e2DefReduction: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x[Stats.CD] += (r.enemyFrozen) ? 0.30 : 0

      x.ELEMENTAL_DMG += (e >= 6 && r.e6UltDmgBoost) ? 0.30 : 0

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultStackScaling * (r.ultHitsOnTarget)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x.DEF_SHRED += (e >= 2 && m.e2DefReduction) ? 0.16 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
