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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PastSelfInTheMirror')
  const { SOURCE_LC } = Source.lightCone('23019')

  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    postUltDmgBuff: true,
  }

  const teammateDefaults = {
    postUltDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    postUltDmgBuff: {
      lc: true,
      id: 'postUltDmgBuff',
      formItem: 'switch',
      text: t('Content.postUltDmgBuff.text'),
      content: t('Content.postUltDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    postUltDmgBuff: content.postUltDmgBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, (m.postUltDmgBuff) ? sValues[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}
