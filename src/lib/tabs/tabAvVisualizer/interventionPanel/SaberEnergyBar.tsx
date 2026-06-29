import { Text } from '@mantine/core'
import { formatAvNumber } from 'lib/tabs/tabAvVisualizer/format'
import type { CharacterEnergyBarProps } from 'lib/tabs/tabAvVisualizer/interventionPanel/characterEnergyBars'
import { SegmentBar } from 'lib/tabs/tabAvVisualizer/interventionPanel/EnergyBar'

// Matches Saber.ts's own FULL_ENERGY_THRESHOLD/REACTOR_CORE_ID — kept as plain literals here since this
// is a display-only component, not part of the battle simulation itself.
const FULL_ENERGY_THRESHOLD = 360
const REACTOR_CORE_ID = 'saber_reactor_core'

// Saber's energy is split into two bars (360 + up to 120/200 overflow, see maxEnergy) instead of one —
// plus a gray "potential" preview showing how far her current Reactor Core stacks (8 energy each, if
// spent) would additionally extend her energy: it fills whatever's left of bar 1 first, then spills into
// bar 2 with whatever's left over.
export function SaberEnergyBar({ energy, maxEnergy, color, name, activeInterventions }: CharacterEnergyBarProps) {
  const overflowCap = Math.max(0, maxEnergy - FULL_ENERGY_THRESHOLD)
  const stacks = activeInterventions?.find((b) => b.effectId === REACTOR_CORE_ID)?.stacks ?? 0
  const potential = stacks * 8
  const real = energy ?? 0
  const reachTotal = real + potential

  const bar1Real = Math.min(real, FULL_ENERGY_THRESHOLD)
  const bar1Gray = Math.max(0, Math.min(FULL_ENERGY_THRESHOLD, reachTotal) - bar1Real)
  const bar2Real = Math.max(0, Math.min(overflowCap, real - FULL_ENERGY_THRESHOLD))
  const bar2Gray = Math.max(0, Math.min(overflowCap, reachTotal - FULL_ENERGY_THRESHOLD) - bar2Real)

  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: -1 }}>
        {name && <Text size='xs' fw={600} style={{ color }} truncate>{name}</Text>}
        <Text size='xs' c='dimmed' style={{ flexShrink: 0, marginLeft: name ? undefined : 'auto' }}>
          {energy !== undefined
            ? `${formatAvNumber(Math.min(real, FULL_ENERGY_THRESHOLD))}/${FULL_ENERGY_THRESHOLD}`
            : '—'}
        </Text>
      </div>
      <SegmentBar total={FULL_ENERGY_THRESHOLD} real={bar1Real} gray={bar1Gray} color={color} />
      {/* Bar 2 is visually scaled to its real proportion of bar 1's length (e.g. 120/360 ≈ 33%, or
          200/360 ≈ 56% with E6) instead of rendering the same width as bar 1 — overflowCap is genuinely
          smaller than FULL_ENERGY_THRESHOLD, so the bar should read as smaller too. The overflow value
          shares this same row, right-aligned in the space bar 2 leaves empty, instead of its own line. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: `${overflowCap / FULL_ENERGY_THRESHOLD * 100}%`, flexShrink: 0 }}>
          <SegmentBar total={overflowCap} real={bar2Real} gray={bar2Gray} color={color} />
        </div>
        <Text size='xs' c='dimmed' style={{ flexShrink: 0, marginLeft: 'auto' }}>
          {energy !== undefined ? `${formatAvNumber(bar2Real)}/${overflowCap}` : '—'}
        </Text>
      </div>
    </div>
  )
}
