import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { precisionRound } from 'lib/utils/mathUtils'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SummerRidesTheSurf.Content')
  const { SOURCE_LC } = Source.lightCone(SummerRidesTheSurf.id)

  const sValuesSpd = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesElation = [0.40, 0.55, 0.70, 0.85, 1.00]

  const defaults = {
    updraftSpdBuff: true,
    uptrendElationBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    updraftSpdBuff: {
      lc: true,
      id: 'updraftSpdBuff',
      formItem: 'switch',
      text: t('updraftSpdBuff.text'),
      content: t('updraftSpdBuff.content', { SpdBuff: precisionRound(100 * sValuesSpd[s]) }),
    },
    uptrendElationBuff: {
      lc: true,
      id: 'uptrendElationBuff',
      formItem: 'switch',
      text: t('uptrendElationBuff.text'),
      content: t('uptrendElationBuff.content', { ElationBuff: precisionRound(100 * sValuesElation[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => [],
    defaults: () => defaults,
    teammateDefaults: () => ({}),
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.SPD_P, r.updraftSpdBuff ? sValuesSpd[s] : 0, x.source(SOURCE_LC))
      x.buff(StatKey.ELATION, r.uptrendElationBuff ? sValuesElation[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const SummerRidesTheSurf: LightConeConfig = {
  id: '23064',
  conditionals,
}
