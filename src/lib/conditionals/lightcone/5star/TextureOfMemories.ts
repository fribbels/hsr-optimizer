import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TextureOfMemories')
  const { SOURCE_LC } = Source.lightCone('24002')

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
        ShieldHp: TsUtils.precisionRound(100 * sValuesShieldHp[s]),
        DmgReduction: TsUtils.precisionRound(100 * sValues[s]),
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
