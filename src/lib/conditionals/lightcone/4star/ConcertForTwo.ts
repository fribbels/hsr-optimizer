import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ConcertForTwo')
  const { SOURCE_LC } = Source.lightCone(ConcertForTwo.id)

  const sValuesStackDmg = [0.04, 0.05, 0.06, 0.07, 0.08]

  const defaults = {
    teammateShieldStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    teammateShieldStacks: {
      lc: true,
      id: 'teammateShieldStacks',
      formItem: 'slider',
      text: t('Content.teammateShieldStacks.text'),
      content: t('Content.teammateShieldStacks.content', { DmgBuff: precisionRound(100 * sValuesStackDmg[s]) }),
      min: 0,
      max: 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, r.teammateShieldStacks * sValuesStackDmg[s], x.source(SOURCE_LC))
    },
  }
}

export const ConcertForTwo: LightConeConfig = {
  id: '21043',
  conditionals,
}
