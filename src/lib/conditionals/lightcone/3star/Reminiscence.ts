import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Reminiscence')
  const { SOURCE_LC } = Source.lightCone(Reminiscence.id)

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
      content: t('Content.dmgStacks.content', { DmgBuff: precisionRound(sValues[s] * 100) }),
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

export const Reminiscence: LightConeConfig = {
  id: '20022',
  conditionals,
}
