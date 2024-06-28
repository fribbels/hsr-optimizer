import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { BREAK_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { Stats } from 'lib/constants.ts'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { precisionRound } from 'lib/conditionals/utils'
import { buffAbilityDefShred } from 'lib/optimizer/calculateBuffs'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesSpdBuff = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesDefShred = [0.20, 0.23, 0.26, 0.29, 0.32]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'breakDmgDefShred',
      name: 'breakDmgDefShred',
      formItem: 'switch',
      text: 'Break DMG DEF shred',
      title: 'Break DMG DEF shred',
      content: `The Break DMG dealt by the wearer ignores ${precisionRound(sValuesDefShred[s] * 100)}% of the target's DEF.`,
    },
    {
      lc: true,
      id: 'spdBuffConditional',
      name: 'spdBuffConditional',
      formItem: 'switch',
      text: 'BE ≥ 150 SPD buff',
      title: 'BE ≥ 150 SPD buff',
      content: `When the wearer's Break Effect in battle is at 150% or greater, increases their SPD by ${precisionRound(sValuesSpdBuff[s] * 100)}%.`,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      breakDmgDefShred: true,
      spdBuffConditional: true,
    }),
    precomputeEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals
      const x: ComputedStatsObject = c.x

      x[Stats.SPD] += (r.spdBuffConditional && x[Stats.BE] >= 1.50) ? sValuesSpdBuff[s] * request.baseSpd : 0

      buffAbilityDefShred(x, BREAK_TYPE, sValuesDefShred[s], (r.breakDmgDefShred))
    },
  }
}
