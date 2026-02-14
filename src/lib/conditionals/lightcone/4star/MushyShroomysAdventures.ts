import { ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { MUSHY_SHROOMYS_ADVENTURES } from 'lib/simulations/tests/testMetadataConstants'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const { SOURCE_LC } = Source.lightCone(MUSHY_SHROOMYS_ADVENTURES)

  const defaults = {}

  const content: ContentDefinition<typeof defaults> = {}

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
  }
}
