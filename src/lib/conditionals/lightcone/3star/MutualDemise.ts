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
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.MutualDemise')
  const { SOURCE_LC } = Source.lightCone(MutualDemise.id)

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    selfHp80CrBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    selfHp80CrBuff: {
      lc: true,
      id: 'selfHp80CrBuff',
      formItem: 'switch',
      text: t('Content.selfHp80CrBuff.text'),
      content: t('Content.selfHp80CrBuff.content', { CritBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, (r.selfHp80CrBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const MutualDemise: LightConeConfig = {
  id: '20016',
  conditionals,
}
