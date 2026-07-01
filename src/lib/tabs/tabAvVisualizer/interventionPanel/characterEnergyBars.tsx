import { EnergyBar, resolveMaxEnergy, type EnergyBarProps } from 'lib/tabs/tabAvVisualizer/interventionPanel/EnergyBar'
import { GilgameshEnergyBar } from 'lib/tabs/tabAvVisualizer/interventionPanel/GilgameshEnergyBar'
import { HuohuoEnergyBar } from 'lib/tabs/tabAvVisualizer/interventionPanel/HuohuoEnergyBar'
import { SaberEnergyBar } from 'lib/tabs/tabAvVisualizer/interventionPanel/SaberEnergyBar'
import type { ActiveIntervention } from 'lib/tabs/tabAvVisualizer/types'
import type { ComponentType } from 'react'

export type CharacterEnergyBarProps = EnergyBarProps & {
  activeInterventions?: ActiveIntervention[]
  // e.g. Huohuo's E1: Rangming's max duration becomes 4 turns instead of 3 — a custom bar may need to
  // know the character's own eidolon to adjust what it displays, not just their resolved energy/buffs.
  eidolon?: number
}

// Per-character custom energy bar registry — a UI-layer analogue of battleConfigs' per-character data
// registry, but for the energy display itself (e.g. Saber's two-segment 360+overflow bar with a Reactor
// Core conversion preview, instead of a single generic bar). Most characters have no entry here and just
// fall through to the generic EnergyBar via EnergyDisplay below.
const registry: Record<string, ComponentType<CharacterEnergyBarProps>> = {
  '1014': SaberEnergyBar,        // Saber
  '1217b1': HuohuoEnergyBar,     // Huohuo
  '1509': GilgameshEnergyBar,    // Gilgamesh
}

export function getCharacterEnergyBar(characterId: string): ComponentType<CharacterEnergyBarProps> | undefined {
  return registry[characterId]
}

// Drop-in replacement for rendering <EnergyBar> directly — dispatches to a registered custom bar for this
// characterId if one exists, otherwise renders the generic EnergyBar. Every call site should use this
// instead of EnergyBar directly so a future character's custom bar doesn't need to be wired into each
// panel separately.
//
// A registered custom bar always gets this character's *true* energy cap (resolveMaxEnergy), ignoring
// whatever maxEnergy the caller passed in — some callers (e.g. UltCasterPanel) intentionally pass a
// different "max" for the generic bar's own purposes (their ult threshold, to show "how close to being
// ult-ready" rather than "how close to the energy cap"). For Saber specifically those two numbers
// genuinely differ (360 threshold vs 480/560 cap with overflow) and her own bar needs the real cap to
// compute its overflow segment correctly, regardless of what any particular panel is using maxEnergy for.
export function EnergyDisplay({ characterId, eidolon, ...props }: CharacterEnergyBarProps & { characterId: string }) {
  const Custom = getCharacterEnergyBar(characterId)
  if (Custom) return <Custom {...props} eidolon={eidolon} maxEnergy={resolveMaxEnergy(characterId, eidolon)} />
  return <EnergyBar {...props} />
}
