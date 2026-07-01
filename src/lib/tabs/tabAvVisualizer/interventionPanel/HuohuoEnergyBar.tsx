import type { CharacterEnergyBarProps } from 'lib/tabs/tabAvVisualizer/interventionPanel/characterEnergyBars'
import { EnergyBar } from 'lib/tabs/tabAvVisualizer/interventionPanel/EnergyBar'

// Matches Huohuo.ts's own buff name/duration constants — kept as plain literals here since this is a
// display-only component, not part of the battle simulation itself.
const RANGMING_ID = 'huohuo_rangming'
const RANGMING_BASE_MAX_TURNS = 3
const RANGMING_E1_MAX_TURNS = 4

// Huohuo's energy bar is the regular one — the only addition is a row of small slots below it tracking
// 禳命's remaining duration, lit up one per remaining turn. The slot count itself adjusts with E1 (3 -> 4
// turns), so it isn't a fixed number of slots.
export function HuohuoEnergyBar({ activeInterventions, eidolon, ...props }: CharacterEnergyBarProps) {
  const maxTurns = (eidolon ?? 0) >= 1 ? RANGMING_E1_MAX_TURNS : RANGMING_BASE_MAX_TURNS
  const remainingTurns = activeInterventions?.find((b) => b.effectId === RANGMING_ID)?.remainingTurns ?? 0
  const lit = Math.min(maxTurns, Math.max(0, remainingTurns))

  return (
    <div style={{ minWidth: 0 }}>
      <EnergyBar {...props} />
      <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
        {Array.from({ length: maxTurns }, (_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i < lit ? props.color : 'var(--mantine-color-dark-4)',
              transition: 'background 0.15s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
