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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ForTomorrowsJourney')
  const { SOURCE_LC } = Source.lightCone('22002')

  const sValuesDmgBoost = [0.18, 0.21, 0.24, 0.27, 0.30]

  const defaults = {
    ultDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultDmgBuff: {
      lc: true,
      id: 'ultDmgBuff',
      formItem: 'switch',
      text: t('Content.ultDmgBuff.text'),
      content: t('Content.ultDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBoost[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.ultDmgBuff) ? sValuesDmgBoost[s] : 0, x.source(SOURCE_LC))
    },
  }
}
