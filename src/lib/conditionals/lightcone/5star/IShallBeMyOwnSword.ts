import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IShallBeMyOwnSword')
  const sValuesStackDmg = [0.14, 0.165, 0.19, 0.215, 0.24]
  const sValuesDefPen = [0.12, 0.14, 0.16, 0.18, 0.20]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'eclipseStacks',
      name: 'eclipseStacks',
      formItem: 'slider',
      text: t('Content.eclipseStacks.text'),
      title: t('Content.eclipseStacks.title'),
      content: t('Content.eclipseStacks.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesStackDmg[s]) }),
      min: 0,
      max: 3,
    },
    {
      lc: true,
      id: 'maxStackDefPen',
      name: 'maxStackDefPen',
      formItem: 'switch',
      text: t('Content.maxStackDefPen.text'),
      title: t('Content.maxStackDefPen.title'),
      content: t('Content.maxStackDefPen.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefPen[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      eclipseStacks: 3,
      maxStackDefPen: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals
      x.ELEMENTAL_DMG += r.eclipseStacks * sValuesStackDmg[s]
      x.DEF_PEN += (r.maxStackDefPen && r.eclipseStacks == 3) ? sValuesDefPen[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
