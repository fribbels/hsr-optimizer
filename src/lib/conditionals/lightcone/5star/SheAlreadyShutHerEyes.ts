import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
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
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.ELEMENTAL_DMG.buffTeam((m.hpLostDmgBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
