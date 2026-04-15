import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheForeverVictual.Content')
  const { SOURCE_LC } = Source.lightCone(TheForeverVictual.id)

  const sValuesAtk = [0.08, 0.10, 0.12, 0.14, 0.16]

  const defaults = {
    atkStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    atkStacks: {
      lc: true,
      id: 'atkStacks',
      formItem: 'slider',
      text: t('atkStacks.text'),
      content: t('atkStacks.content', { AtkBuff: precisionRound(100 * sValuesAtk[s]) }),
      min: 0,
      max: 3,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, r.atkStacks * sValuesAtk[s], x.source(SOURCE_LC))
    },
  }
}

export const TheForeverVictual: LightConeConfig = {
  id: '22005',
  conditionals,
}
