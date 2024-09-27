import { ContentItem } from 'types/Conditionals'

import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.WeWillMeetAgain')
  const sValues = [0.48, 0.60, 0.72, 0.84, 0.96]
  const content: ContentItem[] = [{
    lc: true,
    id: 'extraDmgProc',
    name: 'extraDmgProc',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { Multiplier: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      extraDmgProc: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.BASIC_SCALING += (r.extraDmgProc) ? sValues[s] : 0
      x.SKILL_SCALING += (r.extraDmgProc) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
