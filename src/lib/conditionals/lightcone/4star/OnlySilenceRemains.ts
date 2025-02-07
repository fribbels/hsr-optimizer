import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.OnlySilenceRemains')
  const { SOURCE_LC } = Source.lightCone('21003')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    enemies2CrBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemies2CrBuff: {
      lc: true,
      id: 'enemies2CrBuff',
      formItem: 'switch',
      text: t('Content.enemies2CrBuff.text'),
      content: t('Content.enemies2CrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.CR.buff((r.enemies2CrBuff && context.enemyCount <= 2) ? sValues[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
