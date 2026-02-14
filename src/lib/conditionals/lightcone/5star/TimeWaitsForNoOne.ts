import { ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TimeWaitsForNoOne')
  const { SOURCE_LC } = Source.lightCone('23013')

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
  }
}
