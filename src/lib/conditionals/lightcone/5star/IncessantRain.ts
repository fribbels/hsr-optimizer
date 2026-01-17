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
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IncessantRain')
  const { SOURCE_LC } = Source.lightCone('23007')

  const sValuesCr = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesDmg = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    enemy3DebuffsCrBoost: true,
    targetCodeDebuff: true,
  }

  const teammateDefaults = {
    targetCodeDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemy3DebuffsCrBoost: {
      lc: true,
      id: 'enemy3DebuffsCrBoost',
      formItem: 'switch',
      text: t('Content.enemy3DebuffsCrBoost.text'),
      content: t('Content.enemy3DebuffsCrBoost.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCr[s]) }),
    },
    targetCodeDebuff: {
      lc: true,
      id: 'targetCodeDebuff',
      formItem: 'switch',
      text: t('Content.targetCodeDebuff.text'),
      content: t('Content.targetCodeDebuff.content', { DmgIncrease: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetCodeDebuff: content.targetCodeDebuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, (r.enemy3DebuffsCrBoost) ? sValuesCr[s] : 0, x.source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.targetCodeDebuff) ? sValuesDmg[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}
