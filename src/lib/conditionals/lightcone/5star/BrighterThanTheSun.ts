import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type OptimizerAction, type OptimizerContext } from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.BrighterThanTheSun')
  const { SOURCE_LC } = Source.lightCone(BrighterThanTheSun.id)

  const sValuesAtk = [0.18, 0.21, 0.24, 0.27, 0.30]
  const sValuesErr = [0.06, 0.07, 0.08, 0.09, 0.10]

  const defaults = {
    dragonsCallStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    dragonsCallStacks: {
      lc: true,
      id: 'dragonsCallStacks',
      formItem: 'slider',
      text: t('Content.dragonsCallStacks.text'),
      content: t('Content.dragonsCallStacks.content', {
        AtkBuff: precisionRound(100 * sValuesAtk[s]),
        RegenBuff: precisionRound(100 * sValuesErr[s]),
      }),
      min: 0,
      max: 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, r.dragonsCallStacks * sValuesAtk[s], x.source(SOURCE_LC))
      x.buff(StatKey.ERR, r.dragonsCallStacks * sValuesErr[s], x.source(SOURCE_LC))
    },
  }
}

export const BrighterThanTheSun: LightConeConfig = {
  id: '23015',
  conditionals,
}
