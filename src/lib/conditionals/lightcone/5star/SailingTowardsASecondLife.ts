import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { Stats } from 'lib/constants.ts'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'

const betaUpdate = 'All calculations are subject to change. Last updated 04-08-2024.'

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
      content: betaUpdate,
    },
    {
      lc: true,
      id: 'spdBuffConditional',
      name: 'spdBuffConditional',
      formItem: 'switch',
      text: 'BE ≥ 150 SPD buff',
      title: 'BE ≥ 150 SPD buff',
      content: betaUpdate,
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

      x.BREAK_DEF_PEN += (r.breakDmgDefShred) ? sValuesDefShred[s] : 0
      x[Stats.SPD] += (r.spdBuffConditional && x[Stats.BE] >= 1.50) ? sValuesSpdBuff[s] * request.baseSpd : 0
    },
  }
}
