import type { ReactNode } from 'react'
import { Badge, CloseButton, Group } from '@mantine/core'
import { IconSquareAsteriskFilled } from '@tabler/icons-react'
import { Assets } from 'lib/rendering/assets'
import type { TwoPieceSlot, TwoPieceCombo } from 'lib/stores/optimizerForm/setFilterTypes'
import { TwoPieceSlotType } from 'lib/stores/optimizerForm/setFilterTypes'
import type { SetsRelics, SetsOrnaments } from 'lib/sets/setConfigRegistry'
import classes from './RelicSetFilterModal.module.css'

function slotIcon(slot: TwoPieceSlot): string | null {
  switch (slot.type) {
    case TwoPieceSlotType.Set: return Assets.getSetImage(slot.value)
    case TwoPieceSlotType.Stat: return Assets.getStatIcon(slot.value)
    case TwoPieceSlotType.Any: return null
  }
}

function slotKey(slot: TwoPieceSlot): string {
  switch (slot.type) {
    case TwoPieceSlotType.Set: return `s:${slot.value}`
    case TwoPieceSlotType.Stat: return `t:${slot.value}`
    case TwoPieceSlotType.Any: return 'any'
  }
}

function comboKey(combo: TwoPieceCombo): string {
  return `2p-${slotKey(combo.a)}+${slotKey(combo.b)}`
}

function IconBadge({ onRemove, children }: {
  onRemove: () => void
  children: ReactNode
}) {
  return (
    <Badge
      variant="default"
      radius="sm"
      size="lg"
      h={28}
      fz={12}
      pl={6}
      pr={3}
      rightSection={<CloseButton size="xs" variant="transparent" onClick={onRemove} />}
    >
      <Group gap={6} wrap="nowrap" align="center">
        {children}
      </Group>
    </Badge>
  )
}

export function FourPieceBadges({ checked4p, onRemove }: {
  checked4p: Set<SetsRelics>
  onRemove: (name: SetsRelics) => void
}) {
  return (
    <>
      {[...checked4p].map((name) => (
        <IconBadge key={`4p-${name}`} onRemove={() => onRemove(name)}>
          <img className={classes.collectorImg} src={Assets.getSetImage(name)} alt="" />
          <img className={classes.collectorImg} src={Assets.getSetImage(name)} alt="" />
        </IconBadge>
      ))}
    </>
  )
}

function SlotImage({ slot }: { slot: TwoPieceSlot }) {
  if (slot.type === TwoPieceSlotType.Any) {
    return <IconSquareAsteriskFilled size={22} opacity={0.5} />
  }
  return <img className={classes.collectorImg} src={slotIcon(slot)!} alt="" />
}

export function TwoPieceComboBadges({ combos, onRemove }: {
  combos: TwoPieceCombo[]
  onRemove: (index: number) => void
}) {
  return (
    <>
      {combos.map((combo, i) => (
        <IconBadge key={comboKey(combo)} onRemove={() => onRemove(i)}>
          <SlotImage slot={combo.a} />
          <SlotImage slot={combo.b} />
        </IconBadge>
      ))}
    </>
  )
}

export function PendingSlotBadge({ slotA, onCancel }: {
  slotA: TwoPieceSlot
  onCancel: () => void
}) {
  return (
    <IconBadge onRemove={onCancel}>
      <SlotImage slot={slotA} />
      <div className={classes.collectorBlank} />
    </IconBadge>
  )
}

export function OrnamentBadges({ checkedOrnaments, onRemove }: {
  checkedOrnaments: Set<SetsOrnaments>
  onRemove: (name: SetsOrnaments) => void
}) {
  return (
    <>
      {[...checkedOrnaments].map((name) => (
        <IconBadge key={`orn-${name}`} onRemove={() => onRemove(name)}>
          <img className={classes.collectorImg} src={Assets.getSetImage(name)} alt="" />
        </IconBadge>
      ))}
    </>
  )
}
