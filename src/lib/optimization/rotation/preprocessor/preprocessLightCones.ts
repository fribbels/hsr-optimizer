import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { ThusBurnsTheDawn } from 'lib/conditionals/lightcone/5star/ThusBurnsTheDawn'
import { setComboBooleanCategoryLightConeActivation } from './utils/preprocessUtils'
import { TurnTriggeredStackPreprocessor } from './utils/turnTriggeredStackPreprocessor'

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
