import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.MakeFarewellsMoreBeautiful.Content')
  const { SOURCE_LC } = Source.lightCone('23040')

  const sValuesDefPen = [0.30, 0.35, 0.40, 0.45, 0.50]

  const defaults = {
    deathFlower: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    deathFlower: {
      lc: true,
      id: 'deathFlower',
      formItem: 'switch',
      text: t('deathFlower.text'),
      content: t('deathFlower.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefPen[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_PEN, (r.deathFlower) ? sValuesDefPen[s] : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_LC))
    },
  }
}
