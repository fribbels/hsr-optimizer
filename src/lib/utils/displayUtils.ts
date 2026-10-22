import type { TFunction } from 'i18next'
import {
  AbilityKind,
  ComboOptionsLabelMapping,
  NULL_TURN_ABILITY,
  type TurnAbility,
  TurnMarker,
} from 'lib/optimization/rotation/turnAbilityConfig'
import type { CharacterId } from 'types/character'
import type { UniqueAbilityOwner } from 'types/uniqueAbility'

// ---- Arrow color/direction for stat diffs ----

const GREEN = '#95ef90'
const RED = '#ff97a9'

export function arrowColor(increase: boolean) {
  return increase ? GREEN : RED
}

export function arrowDirection(increase: boolean) {
  return increase ? '▲' : '▼'
}

// ---- Turn ability i18n display ----

export function toI18NVisual(ability: TurnAbility, t: TFunction<'optimizerTab', 'ComboFilter'>, id: CharacterId | 'Default'): string {
  if (!ability || ability === NULL_TURN_ABILITY) return ''
  const { kind } = ability
  const abilityKindVisual = kind === AbilityKind.UNIQUE
    ? t(($) => $.ComboOptions[ComboOptionsLabelMapping[kind]][id as UniqueAbilityOwner])
    : t(($) => $.ComboOptions[ComboOptionsLabelMapping[kind]])

  switch (ability.marker) {
    case TurnMarker.START:
      return `[ ${abilityKindVisual}`
    case TurnMarker.END:
      return `${abilityKindVisual} ]`
    case TurnMarker.WHOLE:
      return `[ ${abilityKindVisual} ]`
    default:
      return abilityKindVisual
  }
}
