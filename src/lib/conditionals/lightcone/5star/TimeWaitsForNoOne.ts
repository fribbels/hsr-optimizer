import { type ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TimeWaitsForNoOne')
  const { SOURCE_LC } = Source.lightCone(TimeWaitsForNoOne.id)

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
      content: t('Content.healingBasedDmgProc.content', { Multiplier: precisionRound(sValuesBonusMultiplier[s] * 100) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
  }
}

export const TimeWaitsForNoOne: LightConeConfig = {
  id: '23013',
  conditionals,
}
