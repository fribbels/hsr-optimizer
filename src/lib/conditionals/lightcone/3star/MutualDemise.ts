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
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.MutualDemise')
  const { SOURCE_LC } = Source.lightCone('20016')

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
      content: t('Content.selfHp80CrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
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
