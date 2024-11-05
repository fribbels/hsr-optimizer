import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PastSelfInTheMirror')

  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'postUltDmgBuff',
      formItem: 'switch',
      text: t('Content.postUltDmgBuff.text'),
      content: t('Content.postUltDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => Object.values(content),
    teammatecontent: () => Object.values(content),
    defaults: () => ({
      postUltDmgBuff: true,
    }),
    teammateDefaults: () => ({
      postUltDmgBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x.ELEMENTAL_DMG += (m.postUltDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
