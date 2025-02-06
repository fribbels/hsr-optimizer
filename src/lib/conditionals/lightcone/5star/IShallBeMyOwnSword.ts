import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IShallBeMyOwnSword')
  const { SOURCE_LC } = Source.lightCone('23014')

  const sValuesStackDmg = [0.14, 0.165, 0.19, 0.215, 0.24]
  const sValuesDefPen = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    eclipseStacks: 3,
    maxStackDefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    eclipseStacks: {
      lc: true,
      id: 'eclipseStacks',
      formItem: 'slider',
      text: t('Content.eclipseStacks.text'),
      content: t('Content.eclipseStacks.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesStackDmg[s]) }),
      min: 0,
      max: 3,
    },
    maxStackDefPen: {
      lc: true,
      id: 'maxStackDefPen',
      formItem: 'switch',
      text: t('Content.maxStackDefPen.text'),
      content: t('Content.maxStackDefPen.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefPen[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>
      x.ELEMENTAL_DMG.buff(r.eclipseStacks * sValuesStackDmg[s], SOURCE_LC)
      x.DEF_PEN.buff((r.maxStackDefPen && r.eclipseStacks == 3) ? sValuesDefPen[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
