import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IndeliblePromise')
  const { SOURCE_LC } = Source.lightCone('21042')

  const sValues = [0.15, 0.1875, 0.225, 0.2625, 0.3]

  const defaults = {
    crBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    crBuff: {
      lc: true,
      id: 'crBuff',
      formItem: 'switch',
      text: t('Content.crBuff.text'),
      content: t('Content.crBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, (r.crBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}
