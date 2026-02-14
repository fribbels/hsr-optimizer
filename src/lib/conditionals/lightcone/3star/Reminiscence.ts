import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Reminiscence')
  const { SOURCE_LC } = Source.lightCone('20022')

  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]

  const defaults = {
    dmgStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgStacks: {
      lc: true,
      id: 'dmgStacks',
      formItem: 'slider',
      text: t('Content.dmgStacks.text'),
      content: t('Content.dmgStacks.content', { DmgBuff: TsUtils.precisionRound(sValues[s] * 100) }),
      min: 0,
      max: 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, r.dmgStacks * sValues[s], x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_LC))
    },
  }
}
