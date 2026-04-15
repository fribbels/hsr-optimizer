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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.MomentOfVictory')
  const { SOURCE_LC } = Source.lightCone(MomentOfVictory.id)

  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    selfAttackedDefBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    selfAttackedDefBuff: {
      lc: true,
      id: 'selfAttackedDefBuff',
      formItem: 'switch',
      text: t('Content.selfAttackedDefBuff.text'),
      content: t('Content.selfAttackedDefBuff.content', { DefBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_P, (r.selfAttackedDefBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const MomentOfVictory: LightConeConfig = {
  id: '23005',
  conditionals,
}
