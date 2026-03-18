import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { ThusBurnsTheDawn } from 'lib/conditionals/lightcone/5star/ThusBurnsTheDawn'
import { setComboBooleanCategoryLightConeActivation } from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { TurnTriggeredStackPreprocessor } from 'lib/optimization/rotation/preprocessor/utils/turnTriggeredStackPreprocessor'

export class ThusBurnsTheDawnPreprocessor extends TurnTriggeredStackPreprocessor {
  constructor() {
    super(
      ThusBurnsTheDawn.id,
      {
        key: 'dmgBuff',
        triggerKinds: [AbilityKind.ULT],
        activeTurns: 0,
        activationFn: setComboBooleanCategoryLightConeActivation,
      },
    )
  }
}
