import { genericBuilder } from 'lib/conditionals/genericBuilder'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import {
  AdditionalDamageFunction,
  BreakDamageFunction,
  CritDamageFunction,
  HitDefinition,
} from 'types/hitConditionalTypes'

const BASE_HIT_DEFAULTS: Partial<HitDefinition> = {
  activeHit: false,
  atkScaling: 0,
  hpScaling: 0,
  defScaling: 0,
}

export function HitDefinitionBuilder(defaults?: Partial<HitDefinition>) {
  return genericBuilder<HitDefinition>({ ...BASE_HIT_DEFAULTS, ...defaults })
}

HitDefinitionBuilder.standardBasic = () =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: CritDamageFunction,
    damageType: DamageTag.BASIC,
    activeHit: true,
  })

HitDefinitionBuilder.standardSkill = () =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: CritDamageFunction,
    damageType: DamageTag.SKILL,
    activeHit: true,
  })

HitDefinitionBuilder.standardUlt = () =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: CritDamageFunction,
    damageType: DamageTag.ULT,
    activeHit: true,
  })

HitDefinitionBuilder.standardBreak = () =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: BreakDamageFunction,
    damageType: DamageTag.BREAK,
    damageElement: ElementTag.None,
    activeHit: false,
  })

HitDefinitionBuilder.standardAdditional = () =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: AdditionalDamageFunction,
    damageType: DamageTag.ADDITIONAL,
    activeHit: false,
  })
