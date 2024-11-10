import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.EarthlyEscapade')

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
    precomputeEffects: () => {
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.CR.buff((t.maskActive) ? sValuesCr[s] : 0, Source.NONE)
      x.CD.buff((t.maskActive) ? sValuesCd[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
