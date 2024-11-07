import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PastSelfInTheMirror')

  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    postUltDmgBuff: true,
  }

  const teammateDefaults = {
    postUltDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    postUltDmgBuff: {
      lc: true,
      id: 'postUltDmgBuff',
      formItem: 'switch',
      text: t('Content.postUltDmgBuff.text'),
      content: t('Content.postUltDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    postUltDmgBuff: content.postUltDmgBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x.ELEMENTAL_DMG.buff((m.postUltDmgBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
