import { Stats } from 'lib/constants'
import { baseComputedStatsObject } from 'lib/conditionals/constants'
import { basic, skill, ult } from 'lib/conditionals/utils'
import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'

export default (e: Eidolon): CharacterConditional => {
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const ultScaling = ult(e, 0, 0)

  return {
    content: () => [],
    defaults: () => ({
    }),
    precomputeEffects: () => {
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.RES] += 0.20

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x']

      x[Stats.ATK] += 0.35 * x[Stats.DEF]

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
    },
  }
}
