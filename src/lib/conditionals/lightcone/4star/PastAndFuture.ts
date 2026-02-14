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
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PastAndFuture')
  const { SOURCE_LC } = Source.lightCone('21025')

  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const teammateDefaults = {
    postSkillDmgBuff: true,
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    postSkillDmgBuff: {
      lc: true,
      id: 'postSkillDmgBuff',
      formItem: 'switch',
      text: t('Content.postSkillDmgBuff.text'),
      content: t('Content.postSkillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => [],
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({}),
    teammateDefaults: () => teammateDefaults,
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, (t.postSkillDmgBuff) ? sValues[s] : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_LC))
    },
  }
}
