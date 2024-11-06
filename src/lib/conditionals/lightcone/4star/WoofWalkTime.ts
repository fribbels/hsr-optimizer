import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WoofWalkTime')

  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const defaults = {
    enemyBurnedBleeding: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyBurnedBleeding: {
      lc: true,
      id: 'enemyBurnedBleeding',
      formItem: 'switch',
      text: t('Content.enemyBurnedBleeding.text'),
      content: t('Content.enemyBurnedBleeding.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG.buff((r.enemyBurnedBleeding) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
