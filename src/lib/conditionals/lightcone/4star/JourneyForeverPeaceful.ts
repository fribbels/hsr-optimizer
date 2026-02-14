import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { OutputTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.JourneyForeverPeaceful.Content')
  const { SOURCE_LC } = Source.lightCone('21053')

  const sValuesShieldBoost = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesDmgBoost = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    shieldBoost: true,
    dmgBoost: true,
  }

  const teammateDefaults = {
    dmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    shieldBoost: {
      lc: true,
      id: 'shieldBoost',
      formItem: 'switch',
      text: t('shieldBoost.text'),
      content: t('shieldBoost.content', { ShieldBuff: TsUtils.precisionRound(100 * sValuesShieldBoost[s]) }),
    },
    dmgBoost: {
      lc: true,
      id: 'dmgBoost',
      formItem: 'switch',
      text: t('dmgBoost.text'),
      content: t('dmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBoost[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    dmgBoost: content.dmgBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, r.shieldBoost ? sValuesShieldBoost[s] : 0, x.outputType(OutputTag.SHIELD).source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, m.dmgBoost ? sValuesDmgBoost[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}
