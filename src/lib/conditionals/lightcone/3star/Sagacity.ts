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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Sagacity')
  const { SOURCE_LC } = Source.lightCone('20020')

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    postUltAtkBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    postUltAtkBuff: {
      lc: true,
      id: 'postUltAtkBuff',
      formItem: 'switch',
      text: t('Content.postUltAtkBuff.text'),
      content: t('Content.postUltAtkBuff.content', { AtkBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (r.postUltAtkBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}
