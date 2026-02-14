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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Amber')
  const { SOURCE_LC } = Source.lightCone('20003')

  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const defaults = {
    hp50DefBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    hp50DefBuff: {
      lc: true,
      id: 'hp50DefBuff',
      formItem: 'switch',
      text: t('Content.hp50DefBuff.text'),
      content: t('Content.hp50DefBuff.content', { DefBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_P, (r.hp50DefBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}
