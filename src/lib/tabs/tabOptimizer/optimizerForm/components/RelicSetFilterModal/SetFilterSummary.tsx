import { useCallback, useMemo } from 'react'
import { Badge, Group, type MantineSpacing, Stack } from '@mantine/core'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import type { SetsRelics, SetsOrnaments } from 'lib/sets/setConfigRegistry'
import { FourPieceBadges, TwoPieceComboBadges, OrnamentBadges } from './SetFilterBadges'
import classes from './RelicSetFilterModal.module.css'

const MAX_VISIBLE_RELICS = 2
const MAX_VISIBLE_ORNAMENTS = 3

export function SetFilterSummary({ mt }: { mt?: MantineSpacing }) {
  const display = useOptimizerRequestStore((s) => s.setFilters)

  const checked4p = useMemo(() => new Set(display.fourPiece), [display.fourPiece])
  const checkedOrnaments = useMemo(() => new Set(display.ornaments), [display.ornaments])
  const combos = display.twoPieceCombos
  const hasAnything = checked4p.size > 0 || combos.length > 0 || checkedOrnaments.size > 0

  const remove4p = useCallback((name: SetsRelics) => {
    const current = useOptimizerRequestStore.getState().setFilters
    useOptimizerRequestStore.getState().setSetFilters({ ...current, fourPiece: current.fourPiece.filter((s) => s !== name) })
  }, [])

  const removeCombo = useCallback((index: number) => {
    const current = useOptimizerRequestStore.getState().setFilters
    useOptimizerRequestStore.getState().setSetFilters({ ...current, twoPieceCombos: current.twoPieceCombos.filter((_, i) => i !== index) })
  }, [])

  const removeOrnament = useCallback((name: SetsOrnaments) => {
    const current = useOptimizerRequestStore.getState().setFilters
    useOptimizerRequestStore.getState().setSetFilters({ ...current, ornaments: current.ornaments.filter((s) => s !== name) })
  }, [])

  const relicTotal = checked4p.size + combos.length
  const relicOverflow = Math.max(0, relicTotal - MAX_VISIBLE_RELICS)
  const visible4p = useMemo(() => new Set(display.fourPiece.slice(0, MAX_VISIBLE_RELICS)), [display.fourPiece])
  const visibleCombos = useMemo(() => combos.slice(0, Math.max(0, MAX_VISIBLE_RELICS - checked4p.size)), [combos, checked4p.size])

  const ornamentOverflow = Math.max(0, checkedOrnaments.size - MAX_VISIBLE_ORNAMENTS)
  const visibleOrnaments = useMemo(() => new Set(display.ornaments.slice(0, MAX_VISIBLE_ORNAMENTS)), [display.ornaments])

  if (!hasAnything) return null

  return (
    <Stack gap={4} mt={mt}>
      {relicTotal > 0 && (
        <Group gap={5} wrap="nowrap" align="center" className={classes.collectorRow}>
          <FourPieceBadges checked4p={visible4p} onRemove={remove4p} />
          <TwoPieceComboBadges combos={visibleCombos} onRemove={removeCombo} />
          {relicOverflow > 0 && (
            <Badge variant="default" radius="sm" size="lg" h={28} fz={12} fw="normal">
              +{relicOverflow}
            </Badge>
          )}
        </Group>
      )}

      {checkedOrnaments.size > 0 && (
        <Group gap={5} wrap="nowrap" align="center" className={classes.collectorRow}>
          <OrnamentBadges checkedOrnaments={visibleOrnaments} onRemove={removeOrnament} />
          {ornamentOverflow > 0 && (
            <Badge variant="default" radius="sm" size="lg" h={28} fz={12} fw="normal">
              +{ornamentOverflow}
            </Badge>
          )}
        </Group>
      )}
    </Stack>
  )
}
