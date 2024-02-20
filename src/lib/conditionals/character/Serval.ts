import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/constants'
import { basicRev, precisionRound, skillRev, talentRev, ultRev } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const talentExtraDmgScaling = talentRev(e, 0.72, 0.792)

  const basicScaling = basicRev(e, 1.00, 1.10)
  const skillScaling = skillRev(e, 1.40, 1.54)
  const ultScaling = ultRev(e, 1.80, 1.944)
  const dotScaling = skillRev(e, 1.04, 1.144)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'targetShocked',
    name: 'targetShocked',
    text: 'Target shocked',
    title: 'Target shocked',
    content: `After Serval attacks, deals Additional Lightning DMG equal to ${precisionRound(talentExtraDmgScaling * 100)}% of Serval's ATK to all Shocked enemies.`,
  }, {
    formItem: 'switch',
    id: 'enemyDefeatedBuff',
    name: 'enemyDefeatedBuff',
    text: 'Enemy defeated buff',
    title: 'Enemy defeated buff',
    content: `Upon defeating an enemy, ATK increases by 20% for 2 turn(s).`,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      targetShocked: true,
      enemyDefeatedBuff: true,
    }),
    teammateDefaults: () => ({
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r.enemyDefeatedBuff) ? 0.20 : 0

      // Scaling;
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling

      x.BASIC_SCALING += (r.targetShocked) ? talentExtraDmgScaling : 0
      x.SKILL_SCALING += (r.targetShocked) ? talentExtraDmgScaling : 0
      x.ULT_SCALING += (r.targetShocked) ? talentExtraDmgScaling : 0

      // Boost
      x.ELEMENTAL_DMG += (e >= 6 && r.targetShocked) ? 0.30 : 0

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x']

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    },
  }
}
