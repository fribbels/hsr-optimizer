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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FlamesAfar')
  const { SOURCE_LC } = Source.lightCone('21038')

  const sValues = [0.25, 0.3125, 0.375, 0.4375, 0.50]

  const defaults = {
    dmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBuff: {
      lc: true,
      id: 'dmgBuff',
      formItem: 'switch',
      text: t('Content.dmgBuff.text'),
      content: t('Content.dmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
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
