import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Stats } from 'lib/constants'

const betaUpdate = 'All calculations are subject to change. Last updated 05-05-2024.'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesUltFuaCd = [0.08, 0.08, 0.08, 0.08, 0.08] // TODO
  const sValuesAtk = [0.04, 0.04, 0.04, 0.04, 0.04] // TODO

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'ultFuaCdBoost',
      name: 'ultFuaCdBoost',
      formItem: 'switch',
      text: 'Ult / FUA CD boost',
      title: 'Ult / FUA CD boost',
      content: betaUpdate,
    },
    {
      lc: true,
      id: 'atkBuff',
      name: 'atkBuff',
      formItem: 'switch',
      text: 'ATK buff',
      title: 'ATK buff',
      content: betaUpdate,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      ultFuaCdBoost: true,
      atkBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.atkBuff) ? sValuesAtk[s] : 0
      x.FUA_CD_BOOST += (r.ultFuaCdBoost) ? sValuesUltFuaCd[s] : 0
      x.ULT_CD_BOOST += (r.ultFuaCdBoost) ? sValuesUltFuaCd[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (_c: PrecomputedCharacterConditional, _request: Form) => {
    },
  }
}
