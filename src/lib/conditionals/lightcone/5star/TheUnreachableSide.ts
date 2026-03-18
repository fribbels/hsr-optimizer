import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheUnreachableSide')
  const { SOURCE_LC } = Source.lightCone(TheUnreachableSide.id)

  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    dmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBuff: {
      lc: true,
      id: 'dmgBuff',
      formItem: 'switch',
      text: t('Content.dmgBuff.text'),
      content: t('Content.dmgBuff.content', { DmgBuff: precisionRound(sValues[s] * 100) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.dmgBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const TheUnreachableSide: LightConeConfig = {
  id: '23009',
  conditionals,
}
