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
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SheAlreadyShutHerEyes')
  const { SOURCE_LC } = Source.lightCone(SheAlreadyShutHerEyes.id)

  const sValues = [0.09, 0.105, 0.12, 0.135, 0.15]

  const defaults = {
    hpLostDmgBuff: true,
  }

  const teammateDefaults = {
    hpLostDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    hpLostDmgBuff: {
      lc: true,
      id: 'hpLostDmgBuff',
      formItem: 'switch',
      text: t('Content.hpLostDmgBuff.text'),
      content: t('Content.hpLostDmgBuff.content', { DmgBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    hpLostDmgBuff: content.hpLostDmgBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, (m.hpLostDmgBuff) ? sValues[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const SheAlreadyShutHerEyes: LightConeConfig = {
  id: '23011',
  conditionals,
}
