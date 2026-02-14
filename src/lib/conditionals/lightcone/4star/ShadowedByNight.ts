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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ShadowedByNight')
  const { SOURCE_LC } = Source.lightCone('21047')

  const sValuesSpdBuff = [0.08, 0.09, 0.10, 0.11, 0.12]

  const defaults = {
    spdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    spdBuff: {
      lc: true,
      id: 'spdBuff',
      formItem: 'switch',
      text: t('Content.spdBuff.text'),
      content: t('Content.spdBuff.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpdBuff[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.SPD_P, (r.spdBuff) ? sValuesSpdBuff[s] : 0, x.source(SOURCE_LC))
    },
  }
}
