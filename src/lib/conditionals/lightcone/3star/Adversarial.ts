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
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Adversarial')
  const { SOURCE_LC } = Source.lightCone('20014')

  const sValues = [0.10, 0.12, 0.14, 0.16, 0.18]

  const defaults = {
    defeatedEnemySpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defeatedEnemySpdBuff: {
      lc: true,
      id: 'defeatedEnemySpdBuff',
      formItem: 'switch',
      text: t('Content.defeatedEnemySpdBuff.text'),
      content: t('Content.defeatedEnemySpdBuff.content', { SpdBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.SPD_P, (r.defeatedEnemySpdBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}
