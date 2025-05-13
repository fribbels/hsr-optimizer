import { Sets } from 'lib/constants/constants'
import { AbilityTriggeredStackPreprocessor } from 'lib/optimization/rotation/preprocessor/utils/abilityTriggeredStackPreprocessor'
import { setComboBooleanCategorySetActivation } from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { TurnTriggeredStackPreprocessor } from 'lib/optimization/rotation/preprocessor/utils/turnTriggeredStackPreprocessor'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'

export class ScholarLostInEruditionPreprocessor extends AbilityTriggeredStackPreprocessor {
  constructor() {
    super(
      Sets.ScholarLostInErudition,
      {
        triggerKinds: [AbilityKind.ULT],
        consumeKinds: [AbilityKind.SKILL],
        activationFn: setComboBooleanCategorySetActivation,
        key: Sets.ScholarLostInErudition,
      },
    )
  }
}

export class FiresmithOfLavaForging extends AbilityTriggeredStackPreprocessor {
  constructor() {
    super(
      Sets.FiresmithOfLavaForging,
      {
        triggerKinds: [AbilityKind.ULT],
        consumeKinds: [AbilityKind.BASIC, AbilityKind.SKILL, AbilityKind.ULT, AbilityKind.FUA],
        activationFn: setComboBooleanCategorySetActivation,
        key: Sets.FiresmithOfLavaForging,
      },
    )
  }
}

export class WavestriderCaptainPreprocessor extends TurnTriggeredStackPreprocessor {
  constructor() {
    super(
      Sets.WavestriderCaptain,
      {
        key: Sets.WavestriderCaptain,
        triggerKinds: [AbilityKind.ULT],
        activeTurns: 1,
        activationFn: setComboBooleanCategorySetActivation,
      },
    )
  }
}

export class HunterOfGlacialForestPreprocessor extends TurnTriggeredStackPreprocessor {
  constructor() {
    super(
      Sets.HunterOfGlacialForest,
      {
        key: Sets.HunterOfGlacialForest,
        triggerKinds: [AbilityKind.ULT],
        activeTurns: 2,
        activationFn: setComboBooleanCategorySetActivation,
      },
    )
  }
}

export class BandOfSizzlingThunderPreprocessor extends TurnTriggeredStackPreprocessor {
  constructor() {
    super(
      Sets.BandOfSizzlingThunder,
      {
        key: Sets.BandOfSizzlingThunder,
        triggerKinds: [AbilityKind.SKILL],
        activeTurns: 1,
        activationFn: setComboBooleanCategorySetActivation,
      },
    )
  }
}
