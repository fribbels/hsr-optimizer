import { type ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ThisIsMe')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { SOURCE_LC } = Source.lightCone(ThisIsMe.id)

  const sValues = [0.6, 0.75, 0.9, 1.05, 1.2]

  const defaults = {
    defScalingUltDmg: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    defScalingUltDmg: {
      lc: true,
      id: 'defScalingUltDmg',
      formItem: 'switch',
      text: t('Content.defScalingUltDmg.text'),
      content: t('Content.defScalingUltDmg.content', { Multiplier: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    // TODO: NOT IMPLEMENTED - DEF scaling ULT damage
  }
}

export const ThisIsMe: LightConeConfig = {
  id: '21030',
  conditionals,
}
