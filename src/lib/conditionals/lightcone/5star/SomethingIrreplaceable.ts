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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SomethingIrreplaceable')
  const { SOURCE_LC } = Source.lightCone('23002')

  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesHealing = [0.08, 0.09, 0.1, 0.11, 0.12]

  const defaults = {
    dmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBuff: {
      lc: true,
      id: 'dmgBuff',
      formItem: 'switch',
      text: t('Content.dmgBuff.text'),
      content: t('Content.dmgBuff.content', {
        Multiplier: TsUtils.precisionRound(100 * sValuesHealing[s]),
        DmgBuff: TsUtils.precisionRound(100 * sValues[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.dmgBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}
