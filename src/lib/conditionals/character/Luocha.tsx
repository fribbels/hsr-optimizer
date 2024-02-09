import { Stats } from 'lib/constants'
import { baseComputedStatsObject } from 'lib/conditionals/constants'
import { basicRev, skillRev, ultRev } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from '../../../types/CharacterConditional'
import { ContentItem } from '../../../types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const basicScaling = basicRev(e, 1.00, 1.10)
  const skillScaling = skillRev(e, 0, 0)
  const ultScaling = ultRev(e, 2.00, 2.16)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'fieldActive',
    name: 'fieldActive',
    text: 'Field active',
    title: 'Field active',
    content: `
      E1: While the Field is active, ATK of all allies increases by 20%.
    `,
    // disabled: e < 1, Not disabling this one since technically the field can be active at E0
  }, {
    formItem: 'switch',
    id: 'e6ResReduction',
    name: 'e6ResReduction',
    text: 'E6 RES reduction',
    title: 'E6 RES reduction',
    content: `E6: When Ultimate is used, reduces all enemies' All-Type RES by 20% for 2 turn(s).`,
    disabled: e < 6,
  }]

  return {
    content: () => content,
    defaults: () => ({
      fieldActive: true,
      e6ResReduction: true,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r >= 1 && r.fieldActive) ? 0.20 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.RES_PEN += (e >= 6 && r.e6ResReduction) ? 0.20 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    },
  }
}
