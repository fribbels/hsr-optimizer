import type { ReactNode } from 'react'
import { Badge, CloseButton, Group } from '@mantine/core'
import { IconSquareAsteriskFilled } from '@tabler/icons-react'
import { Assets } from 'lib/rendering/assets'
import type { TwoPieceSlotNonAny, TwoPieceSlotSet, TwoPieceSlotStat, TwoPieceCombo } from 'lib/stores/optimizerForm/setFilterTypes'
import { TwoPieceSlotType } from 'lib/stores/optimizerForm/setFilterTypes'
import type { SetsRelics, SetsOrnaments } from 'lib/sets/setConfigRegistry'
import classes from './RelicSetFilterModal.module.css'

function slotIcon(slot: TwoPieceSlotSet | TwoPieceSlotStat): string {
  switch (slot.type) {
    case TwoPieceSlotType.Set: return Assets.getSetImage(slot.value)
    case TwoPieceSlotType.Stat: return Assets.getStatIcon(slot.value)
  }
}

function slotKey(slot: TwoPieceSlotSet | TwoPieceSlotStat): string {
  switch (slot.type) {
    case TwoPieceSlotType.Set: return `s:${slot.value}`
    case TwoPieceSlotType.Stat: return `t:${slot.value}`
  }
}

function comboKey(combo: TwoPieceCombo): string {
  return `2p-${slotKey(combo.a)}+${combo.b.type === TwoPieceSlotType.Any ? 'any' : slotKey(combo.b)}`
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

export function TwoPieceComboBadges({ combos, onRemove }: {
  combos: TwoPieceCombo[]
  onRemove: (index: number) => void
}) {
  return (
    <>
      {combos.map((combo, i) => (
        <IconBadge key={comboKey(combo)} onRemove={() => onRemove(i)}>
          <img className={classes.collectorImg} src={slotIcon(combo.a)} alt="" />
          {combo.b.type === TwoPieceSlotType.Any
            ? <IconSquareAsteriskFilled size={22} opacity={0.5} />
            : <img className={classes.collectorImg} src={slotIcon(combo.b)} alt="" />}
        </IconBadge>
      ))}
    </>
  )
}

export function PendingSlotBadge({ slotA, onCancel }: {
  slotA: TwoPieceSlotNonAny
  onCancel: () => void
}) {
  return (
    <IconBadge onRemove={onCancel}>
      <img className={classes.collectorImg} src={slotIcon(slotA)} alt="" />
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
