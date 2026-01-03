import { genericBuilder } from 'lib/conditionals/genericBuilder'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import {
  AdditionalDamageFunction,
  BreakDamageFunction,
  CritDamageFunction,
  DamageFunctionType,
} from 'lib/optimization/engine/damage/damageCalculator'
import { HitDefinition } from 'types/hitConditionalTypes'

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
    damageFunctionType: DamageFunctionType.Crit,
    damageType: DamageTag.BASIC,
    activeHit: true,
  })

HitDefinitionBuilder.standardSkill = () =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: CritDamageFunction,
    damageFunctionType: DamageFunctionType.Crit,
    damageType: DamageTag.SKILL,
    activeHit: true,
  })

HitDefinitionBuilder.standardUlt = () =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: CritDamageFunction,
    damageFunctionType: DamageFunctionType.Crit,
    damageType: DamageTag.ULT,
    activeHit: true,
  })

HitDefinitionBuilder.standardBreak = (e: ElementTag) =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: BreakDamageFunction,
    damageFunctionType: DamageFunctionType.Break,
    damageType: DamageTag.BREAK,
    damageElement: e,
    activeHit: false,
  })

HitDefinitionBuilder.standardAdditional = () =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: AdditionalDamageFunction,
    damageFunctionType: DamageFunctionType.Additional,
    damageType: DamageTag.ADDITIONAL,
    activeHit: false,
  })
