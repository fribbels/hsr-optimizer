import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditionalsController } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IShallBeMyOwnSword')

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
      const r: Conditionals<typeof content> = action.lightConeConditionals
      x.ELEMENTAL_DMG.buff(r.eclipseStacks * sValuesStackDmg[s], Source.NONE)
      x.DEF_PEN.buff((r.maxStackDefPen && r.eclipseStacks == 3) ? sValuesDefPen[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
