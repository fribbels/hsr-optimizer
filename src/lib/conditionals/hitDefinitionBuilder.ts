import {
  genericBuilder,
  schemaBuilder,
} from 'lib/conditionals/genericBuilder'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import {
  DamageFunctionType,
} from 'lib/optimization/engine/damage/damageCalculator'
import {
  AdditionalHitDefinition,
  BreakHitDefinition,
  CritHitDefinition,
  DotHitDefinition,
  HitDefinition,
  SuperBreakHitDefinition,
} from 'types/hitConditionalTypes'

const BASE_HIT_DEFAULTS = {
  activeHit: false,
  atkScaling: 0,
  hpScaling: 0,
  defScaling: 0,
}

const dotHitSchema = schemaBuilder<
  DotHitDefinition,
  Pick<DotHitDefinition, 'damageFunctionType' | 'activeHit'>,
  Pick<DotHitDefinition, 'dotBaseChance' | 'damageElement'>
>({
  defaults: {
    damageFunctionType: DamageFunctionType.Dot,
    activeHit: false,
  },
  required: ['dotBaseChance', 'damageElement'],
})

const critHitSchema = schemaBuilder<
  CritHitDefinition,
  Pick<CritHitDefinition, 'damageFunctionType' | 'activeHit'>,
  Pick<CritHitDefinition, 'damageElement'>
>({
  defaults: {
    damageFunctionType: DamageFunctionType.Crit,
    activeHit: true,
  },
  required: ['damageElement'],
})

export function HitDefinitionBuilder(defaults?: Partial<HitDefinition>) {
  return genericBuilder<HitDefinition>({ ...BASE_HIT_DEFAULTS, ...defaults })
}

// New schema-driven builders
HitDefinitionBuilder.dot = dotHitSchema
HitDefinitionBuilder.crit = critHitSchema

// Convenience builders for standard hit types
HitDefinitionBuilder.standardBasic = () =>
  genericBuilder<CritHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Crit,
    damageType: DamageTag.BASIC,
    activeHit: true,
  })

HitDefinitionBuilder.standardSkill = () =>
  genericBuilder<CritHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Crit,
    damageType: DamageTag.SKILL,
    activeHit: true,
  })

HitDefinitionBuilder.standardUlt = () =>
  genericBuilder<CritHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Crit,
    damageType: DamageTag.ULT,
    activeHit: true,
  })

HitDefinitionBuilder.standardFua = () =>
  genericBuilder<CritHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Crit,
    damageType: DamageTag.FUA,
    activeHit: true,
  })

HitDefinitionBuilder.standardBreak = (e: ElementTag) =>
  genericBuilder<BreakHitDefinition>({
    damageFunctionType: DamageFunctionType.Break,
    damageType: DamageTag.BREAK,
    damageElement: e,
    activeHit: false,
  })

HitDefinitionBuilder.standardAdditional = () =>
  genericBuilder<AdditionalHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Additional,
    damageType: DamageTag.ADDITIONAL,
    activeHit: false,
  })

HitDefinitionBuilder.standardSuperBreak = (e: ElementTag) =>
  genericBuilder<SuperBreakHitDefinition>({
    damageFunctionType: DamageFunctionType.SuperBreak,
    damageType: DamageTag.SUPER_BREAK,
    damageElement: e,
    activeHit: false,
  })
