import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.RiverFlowsInSpring')
  const sValuesSpd = [0.08, 0.09, 0.10, 0.11, 0.12]
  const sValuesDmg = [0.12, 0.15, 0.18, 0.21, 0.24]
  const content: ContentItem[] = [{
    lc: true,
    id: 'spdDmgBuff',
    name: 'spdDmgBuff',
    formItem: 'switch',
    text: t('Content.spdDmgBuff.text'),
    title: t('Content.spdDmgBuff.title'),
    content: t('Content.spdDmgBuff.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpd[s]), DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      spdDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.SPD_P] += (r.spdDmgBuff) ? sValuesSpd[s] : 0
      x.ELEMENTAL_DMG += (r.spdDmgBuff) ? sValuesDmg[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
