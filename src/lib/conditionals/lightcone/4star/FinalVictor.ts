import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.FinalVictor')
  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]
  const content: ContentItem[] = [{
    lc: true,
    id: 'goodFortuneStacks',
    name: 'goodFortuneStacks',
    formItem: 'slider',
    text: t('Content.goodFortuneStacks.text'),
    title: t('Content.goodFortuneStacks.title'),
    content: t('Content.goodFortuneStacks.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    min: 0,
    max: 4,
  }]

  return {
    content: () => content,
    defaults: () => ({
      goodFortuneStacks: 4,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += r.goodFortuneStacks * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
