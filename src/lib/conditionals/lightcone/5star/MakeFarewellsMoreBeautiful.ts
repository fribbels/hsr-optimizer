import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type OptimizerAction, type OptimizerContext } from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.MakeFarewellsMoreBeautiful.Content')
  const { SOURCE_LC } = Source.lightCone(MakeFarewellsMoreBeautiful.id)

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
      content: t('deathFlower.content', { DefIgnore: precisionRound(100 * sValuesDefPen[s]) }),
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

export const MakeFarewellsMoreBeautiful: LightConeConfig = {
  id: '23040',
  conditionals,
}
