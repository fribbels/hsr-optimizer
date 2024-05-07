import { ContentItem } from 'types/Conditionals'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { ConditionalLightConeMap, LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants.ts'
import { precisionRound } from 'lib/conditionals/utils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesCd = [0.24, 0.30, 0.36, 0.42, 0.48]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'enemyDefReducedSlowed',
      name: 'enemyDefReducedSlowed',
      formItem: 'switch',
      text: 'Enemy DEF reduced / slowed',
      title: 'Enemy DEF reduced / slowed',
      content: `The wearer deals ${precisionRound(sValuesCd[s] * 100)}% more CRIT DMG to enemies that are currently Slowed or have reduced DEF.`,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      enemyDefReducedSlowed: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals as ConditionalLightConeMap

      x[Stats.CD] += (r.enemyDefReducedSlowed) ? sValuesCd[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
