import { ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const { SOURCE_LC } = Source.lightCone(ELATION_BRIMMING_WITH_BLESSINGS)

  const defaults = {}

  const content: ContentDefinition<typeof defaults> = {}

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
  }
}
