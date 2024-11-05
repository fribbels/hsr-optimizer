import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.GoodNightAndSleepWell')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    debuffStacksDmgIncrease: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    debuffStacksDmgIncrease: {
      lc: true,
      id: 'debuffStacksDmgIncrease',
      formItem: 'slider',
      text: t('Content.debuffStacksDmgIncrease.text'),
      content: t('Content.debuffStacksDmgIncrease.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 3,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG.buff(r.debuffStacksDmgIncrease * sValues[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
