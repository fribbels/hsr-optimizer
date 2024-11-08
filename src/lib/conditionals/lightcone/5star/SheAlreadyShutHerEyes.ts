import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SheAlreadyShutHerEyes')

  const sValues = [0.09, 0.105, 0.12, 0.135, 0.15]

  const defaults = {
    hpLostDmgBuff: true,
  }

  const teammateDefaults = {
    hpLostDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    hpLostDmgBuff: {
      lc: true,
      id: 'hpLostDmgBuff',
      formItem: 'switch',
      text: t('Content.hpLostDmgBuff.text'),
      content: t('Content.hpLostDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    hpLostDmgBuff: content.hpLostDmgBuff,
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

      x.ELEMENTAL_DMG.buff((m.hpLostDmgBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
