import { Text } from '@mantine/core'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import { formatAvNumber } from 'lib/tabs/tabAvVisualizer/format'
import type { CharacterId } from 'types/character'

// Shared lookup used by every energy display — overrides the game_data.json max_sp lookup with a
// character's own customMaxEnergy when set (e.g. Saber's 480/560 overflow cap, Mimi's synthetic 100).
// eidolonLevel must be passed through (defaults to 0, same as getBattleConfig) — without it, eidolon-
// gated customMaxEnergy overrides (e.g. Saber's E6 bumping 480 -> 560) would never apply here regardless
// of the character's actual eidolon.
export function resolveMaxEnergy(characterId: string, eidolonLevel = 0): number {
  return getBattleConfig(characterId, eidolonLevel)?.customMaxEnergy
    ?? (getGameMetadata().characters?.[characterId as CharacterId]?.max_sp ?? 100)
}

export type EnergyBarProps = {
  energy: number | undefined   // undefined -> renders as "—" (no data at this point in the timeline)
  maxEnergy: number
  color: string
  name?: string   // omitted when the surrounding panel already identifies the character elsewhere
}

// A single bar track (rounded, dark background) with a real colored fill followed directly by a gray
// "potential" fill — shared by EnergyBar (gray always 0) and any character-specific bar that needs to
// preview value not yet actually gained (e.g. SaberEnergyBar's Reactor Core conversion preview).
export function SegmentBar({ total, real, gray, color }: { total: number; real: number; gray: number; color: string }) {
  const realPct = total > 0 ? Math.min(100, real / total * 100) : 0
  const grayPct = total > 0 ? Math.min(100 - realPct, gray / total * 100) : 0
  return (
    <div style={{ height: 6, borderRadius: 3, background: 'var(--mantine-color-dark-4)', overflow: 'hidden', display: 'flex' }}>
      <div style={{ height: '100%', width: `${realPct}%`, background: color, transition: 'width 0.15s', flexShrink: 0 }} />
      <div style={{ height: '100%', width: `${grayPct}%`, background: 'var(--mantine-color-gray-6)', transition: 'width 0.15s', flexShrink: 0 }} />
    </div>
  )
}

// The one shared "energy as a horizontal progress bar" look — used by the energy overview sidebar, the
// character detail panel, and the ult-caster picker, so all three render the same way instead of each
// having grown their own (a plain bar, plain text, or no display at all). Characters with a registered
// custom bar (see characterEnergyBars.tsx) render their own component through EnergyDisplay instead.
export function EnergyBar({ energy, maxEnergy, color, name }: EnergyBarProps) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        {name && <Text size='xs' fw={600} style={{ color }} truncate>{name}</Text>}
        <Text size='xs' c='dimmed' style={{ flexShrink: 0, marginLeft: name ? undefined : 'auto' }}>
          {energy !== undefined ? `${formatAvNumber(energy)} / ${maxEnergy}` : '—'}
        </Text>
      </div>
      <SegmentBar total={maxEnergy} real={energy ?? 0} gray={0} color={color} />
    </div>
  )
}
