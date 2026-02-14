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
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.HeyOverHere')
  const { SOURCE_LC } = Source.lightCone('22001')

  const sValues = [0.16, 0.19, 0.22, 0.25, 0.28]

  const defaults = {
    postSkillHealBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    postSkillHealBuff: {
      lc: true,
      id: 'postSkillHealBuff',
      formItem: 'switch',
      text: t('Content.postSkillHealBuff.text'),
      content: t('Content.postSkillHealBuff.content', { HealingBoost: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.OHB, (r.postSkillHealBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}
