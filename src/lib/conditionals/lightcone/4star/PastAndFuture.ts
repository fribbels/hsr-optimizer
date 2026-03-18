import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type OptimizerAction, type OptimizerContext } from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PastAndFuture')
  const { SOURCE_LC } = Source.lightCone(PastAndFuture.id)

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
      content: t('Content.postSkillDmgBuff.content', { DmgBuff: precisionRound(100 * sValues[s]) }),
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

export const PastAndFuture: LightConeConfig = {
  id: '21025',
  conditionals,
}
