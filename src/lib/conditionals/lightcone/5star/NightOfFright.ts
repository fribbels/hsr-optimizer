import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.NightOfFright')
  const sValues = [0.024, 0.028, 0.032, 0.036, 0.04]

  const content: ContentItem[] = [{
    lc: true,
    id: 'atkBuffStacks',
    name: 'atkBuffStacks',
    formItem: 'slider',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { AtkBuff: TsUtils.precisionRound(100 * sValues[s]), StackLimit: 5, Duration: 2 }),
    min: 0,
    max: 5,
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      atkBuffStacks: 5,
    }),
    teammateDefaults: () => ({
      atkBuffStacks: 5,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x[Stats.ATK_P] += m.atkBuffStacks * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
