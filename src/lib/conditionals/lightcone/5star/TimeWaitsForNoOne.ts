import { ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TimeWaitsForNoOne')

  const sValuesBonusMultiplier = [0.36, 0.42, 0.48, 0.54, 0.6]

  const defaults = {
    healingBasedDmgProc: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    healingBasedDmgProc: {
      lc: true,
      id: 'healingBasedDmgProc',
      formItem: 'switch',
      text: t('Content.healingBasedDmgProc.text'),
      content: t('Content.healingBasedDmgProc.content', { Multiplier: TsUtils.precisionRound(sValuesBonusMultiplier[s] * 100) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: () => {
    },
    finalizeCalculations: () => {
    },
  }
}
