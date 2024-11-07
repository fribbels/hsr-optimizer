import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.EarthlyEscapade')

  const sValuesCr = [0.10, 0.11, 0.12, 0.13, 0.14]
  const sValuesCd = [0.28, 0.35, 0.42, 0.49, 0.56]

  const defaults = {
    maskActive: false,
  }

  const teammateDefaults = {
    maskActive: false,
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
      const t: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x.CR.buff((t.maskActive) ? sValuesCr[s] : 0, Source.NONE)
      x.CD.buff((t.maskActive) ? sValuesCd[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
