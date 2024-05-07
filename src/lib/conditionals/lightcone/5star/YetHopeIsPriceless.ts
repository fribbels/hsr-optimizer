import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Stats } from 'lib/constants'

const betaUpdate = 'All calculations are subject to change. Last updated 05-05-2024.'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesFuaDmg = [0.16, 0.19, 0.22, 0.25, 0.28]
  const sValuesUltFuaDefShred = [0.16, 0.19, 0.22, 0.25, 0.28]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'fuaDmgBoost',
      name: 'fuaDmgBoost',
      formItem: 'switch',
      text: 'CD to FUA DMG boost',
      title: 'CD to FUA DMG boost',
      content: betaUpdate,
    },
    {
      lc: true,
      id: 'ultFuaDefShred',
      name: 'ultFuaDefShred',
      formItem: 'switch',
      text: 'FUA DEF shred',
      title: 'FUA DEF shred',
      content: betaUpdate,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      fuaDmgBoost: true,
      ultFuaDefShred: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ULT_DEF_PEN += (r.ultFuaDefShred) ? sValuesUltFuaDefShred[s] : 0
      x.FUA_DEF_PEN += (r.ultFuaDefShred) ? sValuesUltFuaDefShred[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals
      const x: ComputedStatsObject = c.x

      x.FUA_BOOST += (r.fuaDmgBoost) ? sValuesFuaDmg[s] * Math.min(4, Math.floor(x[Stats.CD] - 1.20) / 0.20) : 0
    },
  }
}
