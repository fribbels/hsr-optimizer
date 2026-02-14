import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { WHY_DOES_THE_OCEAN_SING } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WhyDoesTheOceanSing.Content')
  const { SOURCE_LC } = Source.lightCone(WHY_DOES_THE_OCEAN_SING)

  const sValuesDotVuln = [0.05, 0.0625, 0.075, 0.0875, 0.10]
  const sValuesSpd = [0.10, 0.125, 0.15, 0.175, 0.20]

  const defaults = {
    dotVulnStacks: 6,
    spdBuff: true,
  }

  const teammateDefaults = {
    dotVulnStacks: 6,
    spdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    dotVulnStacks: {
      lc: true,
      id: 'dotVulnStacks',
      formItem: 'slider',
      text: t('dotVulnStacks.text'),
      content: t('dotVulnStacks.content', { DotVuln: TsUtils.precisionRound(100 * sValuesDotVuln[s]) }),
      min: 0,
      max: 6,
    },
    spdBuff: {
      lc: true,
      id: 'spdBuff',
      formItem: 'switch',
      text: t('spdBuff.text'),
      content: t('spdBuff.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpd[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    dotVulnStacks: content.dotVulnStacks,
    spdBuff: content.spdBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, m.dotVulnStacks * sValuesDotVuln[s], x.damageType(DamageTag.DOT).targets(TargetTag.FullTeam).source(SOURCE_LC))
      x.buff(StatKey.SPD_P, (m.spdBuff) ? sValuesSpd[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}
