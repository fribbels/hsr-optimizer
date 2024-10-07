import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.EarthlyEscapade')
  const sValuesCr = [0.10, 0.11, 0.12, 0.13, 0.14]
  const sValuesCd = [0.28, 0.35, 0.42, 0.49, 0.56]
  const content: ContentItem[] = [{
    lc: true,
    id: 'maskActive',
    name: 'maskActive',
    formItem: 'switch',
    text: t('Content.maskActive.text'),
    title: t('Content.maskActive.title'),
    content: t('Content.maskActive.content', { CritRateBuff: TsUtils.precisionRound(100 * sValuesCr[s]), CritDmgBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      maskActive: false,
    }),
    teammateDefaults: () => ({
      maskActive: true,
    }),
    precomputeEffects: () => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.lightConeConditionals

      x[Stats.CR] += (t.maskActive) ? sValuesCr[s] : 0
      x[Stats.CD] += (t.maskActive) ? sValuesCd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
