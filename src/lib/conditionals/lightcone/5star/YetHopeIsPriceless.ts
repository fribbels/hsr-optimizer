import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Stats } from 'lib/constants'

const betaUpdate = 'All calculations are subject to change. Last updated v3 05-20-2024.'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesFuaDmg = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesUltFuaDefShred = [0.20, 0.24, 0.28, 0.32, 0.36]

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
      text: 'Ult / FUA DEF shred',
      title: 'Ult / FUA DEF shred',
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
    calculatePassives: (/* c, request */) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals
      const x: ComputedStatsObject = c.x

      x.FUA_BOOST += (r.fuaDmgBoost) ? sValuesFuaDmg[s] * Math.min(4, Math.floor(x[Stats.CD] - 1.20) / 0.20) : 0
    },
  }
}
