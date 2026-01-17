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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.GeniusesRepose')
  const { SOURCE_LC } = Source.lightCone('21020')

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    defeatedEnemyCdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defeatedEnemyCdBuff: {
      lc: true,
      id: 'defeatedEnemyCdBuff',
      formItem: 'switch',
      text: t('Content.defeatedEnemyCdBuff.text'),
      content: t('Content.defeatedEnemyCdBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, (r.defeatedEnemyCdBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}
