import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import {
  type LightConeConditionalFunction,
  type LightConeConfig,
} from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals: LightConeConditionalFunction = (s, withContent) => {
  const { SOURCE_LC } = Source.lightCone(Sneering.id)

  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Sneering')

  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const defaults = {
    elationBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    elationBuff: {
      lc: true,
      id: 'elationBuff',
      formItem: 'switch',
      text: t('Content.elationBuff.text'),
      content: t('Content.elationBuff.content', { elationBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ELATION, (r.elationBuff) ? sValues[s] : 0, x.actionKind(AbilityKind.ELATION_SKILL).source(SOURCE_LC))
    },
  }
}

export const Sneering: LightConeConfig = {
  id: '20023',
  conditionals,
}
