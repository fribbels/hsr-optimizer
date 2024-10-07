import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.MomentOfVictory')
  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [{
    lc: true,
    id: 'selfAttackedDefBuff',
    name: 'selfAttackedDefBuff',
    formItem: 'switch',
    text: t('Content.selfAttackedDefBuff.text'),
    title: t('Content.selfAttackedDefBuff.title'),
    content: t('Content.selfAttackedDefBuff.content', { DefBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      selfAttackedDefBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.DEF_P] += (r.selfAttackedDefBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
