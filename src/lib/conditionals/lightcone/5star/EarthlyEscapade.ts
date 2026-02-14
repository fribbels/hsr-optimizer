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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.EarthlyEscapade')
  const { SOURCE_LC } = Source.lightCone('23021')

  const sValuesCr = [0.10, 0.11, 0.12, 0.13, 0.14]
  const sValuesCd = [0.28, 0.35, 0.42, 0.49, 0.56]

  const defaults = {
    maskActive: false,
  }

  const teammateDefaults = {
    maskActive: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    maskActive: {
      lc: true,
      id: 'maskActive',
      formItem: 'switch',
      text: t('Content.maskActive.text'),
      content: t('Content.maskActive.content', {
        CritRateBuff: TsUtils.precisionRound(100 * sValuesCr[s]),
        CritDmgBuff: TsUtils.precisionRound(100 * sValuesCd[s]),
      }),
    },
  }

  const teammateContent = {
    maskActive: content.maskActive,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.CR, (t.maskActive) ? sValuesCr[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
      x.buff(StatKey.CD, (t.maskActive) ? sValuesCd[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}
