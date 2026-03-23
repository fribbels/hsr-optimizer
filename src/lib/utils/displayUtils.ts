import type { TFunction } from 'i18next'
import {
  ComboOptionsLabelMapping,
  NULL_TURN_ABILITY,
  TurnMarker,
  type TurnAbility,
} from 'lib/optimization/rotation/turnAbilityConfig'

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

export function toI18NVisual(ability: TurnAbility, t: TFunction<'optimizerTab', 'ComboFilter'>): string {
  if (!ability || ability === NULL_TURN_ABILITY) return ''
  const abilityKindVisual: string = t(`ComboOptions.${ComboOptionsLabelMapping[ability.kind]}`)

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
