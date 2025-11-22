import { DamageType } from 'lib/conditionals/conditionalConstants'
import { genericBuilder } from 'lib/conditionals/genericBuilder'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import {
  BreakDamageFunction,
  CritDamageFunction,
  HitDefinition,
} from 'types/hitConditionalTypes'

const BASE_HIT_DEFAULTS: Partial<HitDefinition> = {
  activeHit: false,
}

export function HitDefinitionBuilder(defaults?: Partial<HitDefinition>) {
  return genericBuilder<HitDefinition>({ ...BASE_HIT_DEFAULTS, ...defaults })
}

HitDefinitionBuilder.standardBasic = () =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: CritDamageFunction,
    damageType: DamageType.BASIC,
    activeHit: true,
  })

HitDefinitionBuilder.standardSkill = () =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: CritDamageFunction,
    damageType: DamageType.SKILL,
    activeHit: true,
  })

HitDefinitionBuilder.standardUlt = () =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: CritDamageFunction,
    damageType: DamageType.ULT,
    activeHit: true,
  })

HitDefinitionBuilder.standardBreak = () =>
  genericBuilder<HitDefinition>({
    ...BASE_HIT_DEFAULTS,
    damageFunction: BreakDamageFunction,
    damageType: DamageType.BREAK,
    damageElement: ElementTag.None,
    activeHit: false,
  })
