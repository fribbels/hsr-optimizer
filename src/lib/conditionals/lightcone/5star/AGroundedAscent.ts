import i18next from 'i18next'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AGroundedAscent')
  const sValuesDmg = [0.15, 0.1725, 0.195, 0.2175, 0.24]

  const defaults = {
    dmgBuffStacks: 3,
  }

  const teammateDefaults = {
    dmgBuffStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBuffStacks: {
      lc: true,
      id: 'dmgBuffStacks',
      formItem: 'slider',
      text: 'DMG boost stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 3,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    dmgBuffStacks: content.dmgBuffStacks,
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

      x.ELEMENTAL_DMG.buff(m.dmgBuffStacks * sValuesDmg[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
