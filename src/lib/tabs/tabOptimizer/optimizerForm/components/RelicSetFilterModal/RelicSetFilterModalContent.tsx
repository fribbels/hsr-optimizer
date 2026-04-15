import {
  Box,
  Button,
  CloseButton,
  Divider,
  Group,
  SegmentedControl,
  Stack,
  TextInput,
} from '@mantine/core'
import {
  ornamentIndexToSetConfig,
  relicIndexToSetConfig,
  type SetsOrnaments,
  type SetsRelics,
} from 'lib/sets/setConfigRegistry'
import {
  buildDisplayFromModalState,
  parseDisplayToModalState,
} from 'lib/stores/optimizerForm/setFilterConversions'
import type {
  ModalState,
  TwoPieceCombo,
  TwoPieceSlot,
} from 'lib/stores/optimizerForm/setFilterTypes'
import {
  RelicSetMode,
  TwoPieceSlotType,
} from 'lib/stores/optimizerForm/setFilterTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import classes from './RelicSetFilterModal.module.css'
import { ResultsCollector } from './ResultsCollector'
import { SetGrid } from './SetGrid'
import { StatChips } from './StatChips'

function slotsEqual(a: TwoPieceSlot, b: TwoPieceSlot): boolean {
  if (a.type !== b.type) return false
  if (a.type === TwoPieceSlotType.Any) return true
  return 'value' in a && 'value' in b && a.value === b.value
}

function combosEqual(a: TwoPieceCombo, b: TwoPieceCombo): boolean {
  return (slotsEqual(a.a, b.a) && slotsEqual(a.b, b.b))
    || (slotsEqual(a.a, b.b) && slotsEqual(a.b, b.a))
}

function syncToStore(state: ModalState) {
  useOptimizerRequestStore.getState().setSetFilters(buildDisplayFromModalState(state))
}

const EMPTY_CHECKED = new Set<string>()

export function RelicSetFilterModalContent({ close }: { close: () => void }) {
  const [initial] = useState(() => {
    const display = useOptimizerRequestStore.getState().setFilters
    return { display, parsed: parseDisplayToModalState(display) }
  })
  const [mode, setMode] = useState<RelicSetMode>(RelicSetMode.FourPiece)
  const [checked4p, setChecked4p] = useState<Set<SetsRelics>>(initial.parsed.checked4p)
  const [combos, setCombos] = useState<TwoPieceCombo[]>(initial.parsed.combos)
  const [checkedOrnaments, setCheckedOrnaments] = useState<Set<SetsOrnaments>>(initial.parsed.checkedOrnaments)
  const [slotA, setSlotA] = useState<TwoPieceSlot | null>(null)
  const [search, setSearch] = useState('')

  const checked4pRef = useRef(checked4p)
  checked4pRef.current = checked4p
  const combosRef = useRef(combos)
  combosRef.current = combos
  const checkedOrnamentsRef = useRef(checkedOrnaments)
  checkedOrnamentsRef.current = checkedOrnaments
  const slotARef = useRef(slotA)
  slotARef.current = slotA

  const toggle4p = useCallback((name: string) => {
    const next = new Set(checked4pRef.current)
    if (next.has(name as SetsRelics)) next.delete(name as SetsRelics)
    else next.add(name as SetsRelics)
    setChecked4p(next)
    syncToStore({ checked4p: next, combos: combosRef.current, checkedOrnaments: checkedOrnamentsRef.current })
  }, [])

  const toggleOrnament = useCallback((name: string) => {
    const next = new Set(checkedOrnamentsRef.current)
    if (next.has(name as SetsOrnaments)) next.delete(name as SetsOrnaments)
    else next.add(name as SetsOrnaments)
    setCheckedOrnaments(next)
    syncToStore({ checked4p: checked4pRef.current, combos: combosRef.current, checkedOrnaments: next })
  }, [])

  const pick2p = useCallback((slot: TwoPieceSlot) => {
    const prevSlotA = slotARef.current
    if (!prevSlotA) {
      setSlotA(slot)
      return
    }
    const newCombo: TwoPieceCombo = { a: prevSlotA, b: slot }
    const isDupe = combosRef.current.some((existing) => combosEqual(existing, newCombo))
    if (!isDupe) {
      const next = [...combosRef.current, newCombo]
      setCombos(next)
      syncToStore({ checked4p: checked4pRef.current, combos: next, checkedOrnaments: checkedOrnamentsRef.current })
    }
    setSlotA(null)
  }, [])

  const cancelSlotA = useCallback(() => setSlotA(null), [])

  const removeCombo = useCallback((i: number) => {
    const next = combosRef.current.filter((_, idx) => idx !== i)
    setCombos(next)
    syncToStore({ checked4p: checked4pRef.current, combos: next, checkedOrnaments: checkedOrnamentsRef.current })
  }, [])

  const remove4p = useCallback((name: SetsRelics) => {
    const next = new Set(checked4pRef.current)
    next.delete(name)
    setChecked4p(next)
    syncToStore({ checked4p: next, combos: combosRef.current, checkedOrnaments: checkedOrnamentsRef.current })
  }, [])

  const removeOrnament = useCallback((name: SetsOrnaments) => {
    const next = new Set(checkedOrnamentsRef.current)
    next.delete(name)
    setCheckedOrnaments(next)
    syncToStore({ checked4p: checked4pRef.current, combos: combosRef.current, checkedOrnaments: next })
  }, [])

  const clearAll = useCallback(() => {
    const empty: ModalState = { checked4p: new Set(), combos: [], checkedOrnaments: new Set() }
    setChecked4p(empty.checked4p)
    setCombos(empty.combos)
    setCheckedOrnaments(empty.checkedOrnaments)
    setSlotA(null)
    syncToStore(empty)
  }, [])

  const handleRevert = useCallback(() => {
    const reverted = parseDisplayToModalState(initial.display)
    setChecked4p(reverted.checked4p)
    setCombos(reverted.combos)
    setCheckedOrnaments(reverted.checkedOrnaments)
    setSlotA(null)
    syncToStore(reverted)
  }, [initial])

  const handleModeSwitch = useCallback((val: string) => {
    setMode(val as RelicSetMode)
    setSearch('')
    if (val === RelicSetMode.FourPiece) setSlotA(null)
  }, [])

  const twoPCheckedNames = useMemo(
    () => slotA?.type === TwoPieceSlotType.Set ? new Set<string>([slotA.value]) : EMPTY_CHECKED,
    [slotA],
  )

  const twoPOnToggle = useCallback((name: string) => {
    pick2p({ type: TwoPieceSlotType.Set, value: name as SetsRelics })
  }, [pick2p])

  return (
    <Stack gap={0}>
      <Divider label='Selected Sets' labelPosition='center' mx='sm' mt='xs' />

      <ResultsCollector
        checked4p={checked4p}
        combos={combos}
        checkedOrnaments={checkedOrnaments}
        pendingSlotA={slotA}
        onRemove4p={remove4p}
        onRemoveCombo={removeCombo}
        onRemoveOrnament={removeOrnament}
        onCancelSlotA={cancelSlotA}
        onClearAll={clearAll}
      />

      <Box p='sm'>
        <Stack gap={10}>
          <TextInput
            data-autofocus
            placeholder='Search sets...'
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size='xs'
            rightSection={search && <CloseButton size='xs' onClick={() => setSearch('')} />}
          />

          <Divider label='Relic Sets' labelPosition='center' />

          <Group gap={10} wrap='nowrap'>
            <SegmentedControl
              value={mode}
              onChange={handleModeSwitch}
              size='xs'
              data={[
                { label: '4-Piece', value: RelicSetMode.FourPiece },
                { label: '2-Piece', value: RelicSetMode.TwoPiece },
              ]}
            />
            {mode === RelicSetMode.TwoPiece && <StatChips slotA={slotA} onPick={pick2p} />}
          </Group>

          <SetGrid
            configs={relicIndexToSetConfig}
            checkedNames={mode === RelicSetMode.FourPiece ? checked4p as Set<string> : twoPCheckedNames}
            onToggle={mode === RelicSetMode.FourPiece ? toggle4p : twoPOnToggle}
            search={search}
          />

          <Divider label='Ornament Sets' labelPosition='center' />
          <SetGrid
            configs={ornamentIndexToSetConfig}
            checkedNames={checkedOrnaments as Set<string>}
            onToggle={toggleOrnament}
            search={search}
          />
        </Stack>
      </Box>

      <Group className={classes.footer} p='sm' justify='flex-end' gap={6}>
        <Button variant='default' size='xs' onClick={handleRevert}>Revert</Button>
        <Button variant='filled' size='xs' onClick={close}>Done</Button>
      </Group>
    </Stack>
  )
}
