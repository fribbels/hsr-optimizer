import { Stats } from 'lib/constants'
import { baseComputedStatsObject } from 'lib/conditionals/constants'
import { basicRev, precisionRound, skillRev, talentRev, ultRev } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const talentDebuffDmgIncreaseValue = talentRev(e, 0.07, 0.076)
  const talentDebuffMax = (e >= 6) ? 4 : 3

  const basicScaling = basicRev(e, 1.00, 1.10)
  const skillScaling = skillRev(e, 1.20, 1.32)
  const ultScaling = ultRev(e, 1.20, 1.296)
  const dotScaling = skillRev(e, 2.182, 2.40)

  const content: ContentItem[] = [{
    formItem: 'slider',
    id: 'talentDebuffStacks',
    name: 'talentDebuffStacks',
    text: 'Enemy Firekiss stacks',
    title: 'Enemy Firekiss stacks',
    content: `While inflicted with Firekiss, the enemy receives ${precisionRound(talentDebuffDmgIncreaseValue * 100)}% increased DMG, which lasts for 3 turns and can stack up to ${precisionRound(talentDebuffMax)} times.`,
    min: 0,
    max: talentDebuffMax,
  }, {
    formItem: 'switch',
    id: 'enemyBurned',
    name: 'enemyBurned',
    text: 'Enemy burned',
    title: 'Enemy burned',
    content: `Increases DMG by ${precisionRound(0.20 * 100)}% against enemies affected by Burn.`,
  }, {
    formItem: 'switch',
    id: 'e2BurnMultiBoost',
    name: 'e2BurnMultiBoost',
    text: 'E2 burn multi boost',
    title: 'E2 burn multi boost',
    content: `E2: When an enemy target is Burned, Guinaifen's Basic ATK and Skill can increase the DMG multiplier of their Burn status by 40%.`,
    disabled: e < 2,
  }]

  return {
    content: () => content,
    defaults: () => ({
      talentDebuffStacks: talentDebuffMax,
      enemyBurned: true,
      e2BurnMultiBoost: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling
      x.DOT_SCALING += (e >= 2 && r.e2BurnMultiBoost) ? 0.40 : 0

      // Boost
      x.ELEMENTAL_DMG += (r.enemyBurned) ? 0.20 : 0
      x.DMG_TAKEN_MULTI += r.talentDebuffStacks * talentDebuffDmgIncreaseValue

      return x
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
