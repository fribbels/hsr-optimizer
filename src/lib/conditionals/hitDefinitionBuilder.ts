import {
  genericBuilder,
  schemaBuilder,
} from 'lib/conditionals/genericBuilder'
import {
  DamageTag,
  ElementTag,
  OutputTag,
} from 'lib/optimization/engine/config/tag'
import {
  DamageFunctionType,
} from 'lib/optimization/engine/damage/damageCalculator'
import {
  AdditionalHitDefinition,
  BreakHitDefinition,
  CritHitDefinition,
  DotHitDefinition,
  HealHitDefinition,
  HealTallyHitDefinition,
  HitDefinition,
  ShieldHitDefinition,
  SuperBreakHitDefinition,
} from 'types/hitConditionalTypes'

const BASE_HIT_DEFAULTS = {
  directHit: false,
  atkScaling: 0,
  hpScaling: 0,
  defScaling: 0,
}

const dotHitSchema = schemaBuilder<
  DotHitDefinition,
  Pick<DotHitDefinition, 'damageFunctionType' | 'directHit' | 'outputTag'>,
  Pick<DotHitDefinition, 'dotBaseChance' | 'damageElement'>
>({
  defaults: {
    damageFunctionType: DamageFunctionType.Dot,
    directHit: false,
    outputTag: OutputTag.DAMAGE,
  },
  required: ['dotBaseChance', 'damageElement'],
})

const critHitSchema = schemaBuilder<
  CritHitDefinition,
  Pick<CritHitDefinition, 'damageFunctionType' | 'directHit' | 'outputTag'>,
  Pick<CritHitDefinition, 'damageElement'>
>({
  defaults: {
    damageFunctionType: DamageFunctionType.Crit,
    directHit: true,
    outputTag: OutputTag.DAMAGE,
  },
  required: ['damageElement'],
})

export function HitDefinitionBuilder(defaults?: Partial<HitDefinition>) {
  return genericBuilder<HitDefinition>({ ...BASE_HIT_DEFAULTS, ...defaults })
}

// New schema-driven builders // TODO: Careful
HitDefinitionBuilder.crit = critHitSchema

HitDefinitionBuilder.standardDot = () =>
  genericBuilder<DotHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Dot,
    damageType: DamageTag.DOT,
    outputTag: OutputTag.DAMAGE,
    directHit: false,
  })

// Convenience builders for standard hit types
HitDefinitionBuilder.standardBasic = () =>
  genericBuilder<CritHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Crit,
    damageType: DamageTag.BASIC,
    outputTag: OutputTag.DAMAGE,
    directHit: true,
  })

HitDefinitionBuilder.standardSkill = () =>
  genericBuilder<CritHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Crit,
    damageType: DamageTag.SKILL,
    outputTag: OutputTag.DAMAGE,
    directHit: true,
  })

HitDefinitionBuilder.standardUlt = () =>
  genericBuilder<CritHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Crit,
    damageType: DamageTag.ULT,
    outputTag: OutputTag.DAMAGE,
    directHit: true,
  })

HitDefinitionBuilder.standardFua = () =>
  genericBuilder<CritHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Crit,
    damageType: DamageTag.FUA,
    outputTag: OutputTag.DAMAGE,
    directHit: true,
  })

HitDefinitionBuilder.standardBreak = (e: ElementTag) =>
  genericBuilder<BreakHitDefinition>({
    damageFunctionType: DamageFunctionType.Break,
    damageType: DamageTag.BREAK,
    damageElement: e,
    outputTag: OutputTag.DAMAGE,
    directHit: false,
  })

HitDefinitionBuilder.standardAdditional = () =>
  genericBuilder<AdditionalHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Additional,
    damageType: DamageTag.ADDITIONAL,
    outputTag: OutputTag.DAMAGE,
    directHit: false,
  })

HitDefinitionBuilder.standardSuperBreak = (e: ElementTag) =>
  genericBuilder<SuperBreakHitDefinition>({
    damageFunctionType: DamageFunctionType.SuperBreak,
    damageType: DamageTag.SUPER_BREAK,
    damageElement: e,
    outputTag: OutputTag.DAMAGE,
    directHit: false,
  })

// Heal builders - heals produce healing instead of damage
// Heals default to ElementTag.None and directHit: false
HitDefinitionBuilder.heal = () =>
  genericBuilder<HealHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Heal,
    damageElement: ElementTag.None,
    outputTag: OutputTag.HEAL,
    directHit: false,
  })

HitDefinitionBuilder.skillHeal = () =>
  genericBuilder<HealHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Heal,
    damageType: DamageTag.SKILL,
    damageElement: ElementTag.None,
    outputTag: OutputTag.HEAL,
    directHit: false,
  })

HitDefinitionBuilder.ultHeal = () =>
  genericBuilder<HealHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Heal,
    damageType: DamageTag.ULT,
    damageElement: ElementTag.None,
    outputTag: OutputTag.HEAL,
    directHit: false,
  })

HitDefinitionBuilder.talentHeal = () =>
  genericBuilder<HealHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Heal,
    damageType: DamageTag.None,
    damageElement: ElementTag.None,
    outputTag: OutputTag.HEAL,
    directHit: false,
  })

// Shield builders - shields produce shields instead of damage
// Shields default to ElementTag.None and directHit: false
HitDefinitionBuilder.shield = () =>
  genericBuilder<ShieldHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Shield,
    damageElement: ElementTag.None,
    outputTag: OutputTag.SHIELD,
    directHit: false,
  })

HitDefinitionBuilder.skillShield = () =>
  genericBuilder<ShieldHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Shield,
    damageType: DamageTag.SKILL,
    damageElement: ElementTag.None,
    outputTag: OutputTag.SHIELD,
    directHit: false,
  })

HitDefinitionBuilder.ultShield = () =>
  genericBuilder<ShieldHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Shield,
    damageType: DamageTag.ULT,
    damageElement: ElementTag.None,
    outputTag: OutputTag.SHIELD,
    directHit: false,
  })

HitDefinitionBuilder.fuaShield = () =>
  genericBuilder<ShieldHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.Shield,
    damageType: DamageTag.FUA,
    damageElement: ElementTag.None,
    outputTag: OutputTag.SHIELD,
    directHit: false,
  })

// HealTally builders - damage based on a referenced heal hit's computed value
// Used for abilities like Hyacine's memo skill that deal damage based on heal amount
HitDefinitionBuilder.healTally = () =>
  genericBuilder<HealTallyHitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunctionType: DamageFunctionType.HealTally,
    outputTag: OutputTag.DAMAGE,
    directHit: true,
  })
