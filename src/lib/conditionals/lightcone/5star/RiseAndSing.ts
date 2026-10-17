import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { precisionRound } from 'lib/utils/mathUtils'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.RiseAndSing.Content')
  const { SOURCE_LC } = Source.lightCone(RiseAndSing.id)

  const sValuesSpd = [0.20, 0.25, 0.30, 0.35, 0.40]

  const defaults = {
    newMelodySpdBuff: true,
  }

  const teammateDefaults = {
    newMelodySpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    newMelodySpdBuff: {
      lc: true,
      id: 'newMelodySpdBuff',
      formItem: 'switch',
      text: t('newMelodySpdBuff.text'),
      content: t('newMelodySpdBuff.content', { SpdBuff: precisionRound(100 * sValuesSpd[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    newMelodySpdBuff: content.newMelodySpdBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.SPD_P, m.newMelodySpdBuff ? sValuesSpd[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const RiseAndSing: LightConeConfig = {
  id: '23063',
  conditionals,
}
