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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TextureOfMemories')
  const { SOURCE_LC } = Source.lightCone(TextureOfMemories.id)

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesShieldHp = [0.16, 0.2, 0.24, 0.28, 0.32]

  const defaults = {
    activeShieldDmgDecrease: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    activeShieldDmgDecrease: {
      lc: true,
      id: 'activeShieldDmgDecrease',
      formItem: 'switch',
      text: t('Content.activeShieldDmgDecrease.text'),
      content: t('Content.activeShieldDmgDecrease.content', {
        ShieldHp: precisionRound(100 * sValuesShieldHp[s]),
        DmgReduction: precisionRound(100 * sValues[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.multiplicativeComplement(StatKey.DMG_RED, (r.activeShieldDmgDecrease) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const TextureOfMemories: LightConeConfig = {
  id: '24002',
  conditionals,
}
