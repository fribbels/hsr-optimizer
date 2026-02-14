import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IVentureForthToHunt')
  const { SOURCE_LC } = Source.lightCone('23031')

  const sValuesDefShred = [0.27, 0.30, 0.33, 0.36, 0.39]

  const defaults = {
    luminfluxUltStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    luminfluxUltStacks: {
      lc: true,
      id: 'luminfluxUltStacks',
      formItem: 'slider',
      text: t('Content.luminfluxUltStacks.text'),
      content: t('Content.luminfluxUltStacks.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefShred[s]) }),
      min: 0,
      max: 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_PEN, r.luminfluxUltStacks * sValuesDefShred[s], x.damageType(DamageTag.ULT).source(SOURCE_LC))
    },
  }
}
