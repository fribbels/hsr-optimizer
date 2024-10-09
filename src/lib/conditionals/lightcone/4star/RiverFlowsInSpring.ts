import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesSpd = [0.08, 0.09, 0.10, 0.11, 0.12]
  const sValuesDmg = [0.12, 0.15, 0.18, 0.21, 0.24]
  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.RiverFlowsInSpring.Content')
    return [{
      lc: true,
      id: 'spdDmgBuff',
      name: 'spdDmgBuff',
      formItem: 'switch',
      text: t('spdDmgBuff.text'),
      title: t('spdDmgBuff.title'),
      content: t('spdDmgBuff.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpd[s]), DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      spdDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.SPD_P] += (r.spdDmgBuff) ? sValuesSpd[s] : 0
      x.ELEMENTAL_DMG += (r.spdDmgBuff) ? sValuesDmg[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
