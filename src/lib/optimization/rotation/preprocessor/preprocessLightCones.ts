import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { THUS_BURNS_THE_DAWN } from 'lib/simulations/tests/testMetadataConstants'
import { setComboBooleanCategoryLightConeActivation } from './utils/preprocessUtils'
import { TurnTriggeredStackPreprocessor } from './utils/turnTriggeredStackPreprocessor'

export class ThusBurnsTheDawnPreprocessor extends TurnTriggeredStackPreprocessor {
  constructor() {
    super(
      THUS_BURNS_THE_DAWN,
      {
        key: 'dmgBuff',
        triggerKinds: [AbilityKind.ULT],
        activeTurns: 0,
        activationFn: setComboBooleanCategoryLightConeActivation,
      },
    )
  }
}