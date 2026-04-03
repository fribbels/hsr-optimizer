import { Button, Group, Stack, Text } from '@mantine/core'
import type { TwoPieceSlot, TwoPieceCombo } from 'lib/stores/optimizerForm/setFilterTypes'
import type { SetsRelics, SetsOrnaments } from 'lib/sets/setConfigRegistry'
import { FourPieceBadges, TwoPieceComboBadges, PendingSlotBadge, OrnamentBadges } from './SetFilterBadges'
import classes from './RelicSetFilterModal.module.css'

export function ResultsCollector({ checked4p, combos, checkedOrnaments, pendingSlotA, onRemove4p, onRemoveCombo, onRemoveOrnament, onCancelSlotA, onClearAll }: {
  checked4p: Set<SetsRelics>
  combos: TwoPieceCombo[]
  checkedOrnaments: Set<SetsOrnaments>
  pendingSlotA: TwoPieceSlot | null
  onRemove4p: (name: SetsRelics) => void
  onRemoveCombo: (index: number) => void
  onRemoveOrnament: (name: SetsOrnaments) => void
  onCancelSlotA: () => void
  onClearAll: () => void
}) {
  const hasAnything = checked4p.size > 0 || combos.length > 0 || checkedOrnaments.size > 0 || pendingSlotA !== null

  return (
    <Group gap="xs" p="sm" wrap="nowrap" align="center" className={classes.resultsCollector}>
      <Stack gap={4} style={{ flex: 1 }}>
        <Group gap={5} wrap="wrap" align="center" className={classes.collectorRow}>
          {checked4p.size === 0 && combos.length === 0 && !pendingSlotA && (
            <Text size="xs" c="dimmed">Relics</Text>
          )}
          <FourPieceBadges checked4p={checked4p} onRemove={onRemove4p} />
          <TwoPieceComboBadges combos={combos} onRemove={onRemoveCombo} />
          {pendingSlotA && <PendingSlotBadge slotA={pendingSlotA} onCancel={onCancelSlotA} />}
        </Group>

        <Group gap={5} wrap="wrap" align="center" className={classes.collectorRow}>
          {checkedOrnaments.size === 0 && (
            <Text size="xs" c="dimmed">Ornaments</Text>
          )}
          <OrnamentBadges checkedOrnaments={checkedOrnaments} onRemove={onRemoveOrnament} />
        </Group>
      </Stack>

      {hasAnything && (
        <Button variant="subtle" size="compact-xs" onClick={onClearAll}>
          Clear all
        </Button>
      )}
    </Group>
  )
}
