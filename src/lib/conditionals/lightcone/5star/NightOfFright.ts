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
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type OptimizerAction, type OptimizerContext } from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NightOfFright')
  const { SOURCE_LC } = Source.lightCone(NightOfFright.id)

  const sValues = [0.024, 0.028, 0.032, 0.036, 0.04]

  const defaults = {
    atkBuffStacks: 5,
  }

  const teammateDefaults = {
    atkBuffStacks: 5,
  }

  const content: ContentDefinition<typeof defaults> = {
    atkBuffStacks: {
      lc: true,
      id: 'atkBuffStacks',
      formItem: 'slider',
      text: t('Content.atkBuffStacks.text'),
      content: t('Content.atkBuffStacks.content', { AtkBuff: precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 5,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    atkBuffStacks: content.atkBuffStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.ATK_P, m.atkBuffStacks * sValues[s], x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const NightOfFright: LightConeConfig = {
  id: '23017',
  conditionals,
}
