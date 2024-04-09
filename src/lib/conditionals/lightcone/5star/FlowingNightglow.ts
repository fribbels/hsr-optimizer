import { ContentItem } from 'types/Conditionals'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants.ts'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { findContentId } from 'lib/conditionals/utils.ts'

const betaUpdate = 'All calculations are subject to change. Last updated 04-08-2024.'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesErr = [0.03, 0.035, 0.04, 0.045, 0.05]
  const sValuesAtkBuff = [0.48, 0.60, 0.72, 0.84, 0.96]
  const sValuesDmgBuff = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'cadenzaActive',
      name: 'cadenzaActive',
      formItem: 'switch',
      text: 'Cadenza active',
      title: 'Cadenza active',
      content: betaUpdate,
    },
    {
      lc: true,
      id: 'cantillationStacks',
      name: 'cantillationStacks',
      formItem: 'slider',
      text: 'Cantillation stacks',
      title: 'Cantillation stacks',
      content: betaUpdate,
      min: 0,
      max: 5,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [
      findContentId(content, 'cadenzaActive'),
    ],
    defaults: () => ({
      cantillationStacks: 5,
      cadenzaActive: true,
    }),
    teammateDefaults: () => ({
      cadenzaActive: true,
    }),
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.lightConeConditionals

      x.ELEMENTAL_DMG += (t.cadenzaActive) ? sValuesDmgBuff[s] : 0
    },
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ERR] += r.cantillationStacks * sValuesErr[s]
      x[Stats.ATK_P] += (r.cadenzaActive) ? sValuesAtkBuff[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
