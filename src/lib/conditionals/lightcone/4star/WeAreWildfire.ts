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
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WeAreWildfire')
  const { SOURCE_LC } = Source.lightCone('21023')

  const sValues = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesHealing = [0.3, 0.35, 0.4, 0.45, 0.5]

  const defaults = {
    initialDmgReductionBuff: false,
  }

  const teammateDefaults = {
    initialDmgReductionBuff: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    initialDmgReductionBuff: {
      lc: true,
      id: 'initialDmgReductionBuff',
      formItem: 'switch',
      text: t('Content.initialDmgReductionBuff.text'),
      content: t('Content.initialDmgReductionBuff.content', {
        Healing: TsUtils.precisionRound(100 * sValuesHealing[s]),
        DmgReduction: sValues[s],
      }),
    },
  }

  const teammateContent = {
    initialDmgReductionBuff: content.initialDmgReductionBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.multiplicativeComplement(StatKey.DMG_RED, (m.initialDmgReductionBuff) ? sValues[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}
