import {
  ActionIcon,
  NumberInput,
  Text,
  Tooltip,
} from '@mantine/core'
import { IconPencil, IconPlus, IconRefresh, IconX } from '@tabler/icons-react'
import { Assets } from 'lib/rendering/assets'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { SLOT_COLORS } from 'lib/tabs/tabAvVisualizer/constants'
import type { Slot } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { useRef, useState } from 'react'
import type { CharacterId } from 'types/character'
import classes from './CharacterSlotCard.module.css'

type CharacterSlotCardProps = {
  slotIndex: number
  slot: Slot
  characterName: string | null
  baseSpd: number | null
}

export function CharacterSlotCard({ slotIndex, slot, characterName, baseSpd }: CharacterSlotCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const enterPressedRef = useRef(false)
  const color = SLOT_COLORS[slotIndex]
  const hasOverride = slot.spdOverride !== null
  const displaySpd = hasOverride ? slot.spdOverride : baseSpd

  if (!slot.characterId) {
    return (
      <>
        <div className={classes.emptyCard} onClick={() => setModalOpen(true)}>
          <ActionIcon variant='subtle' color='gray' size='xl' style={{ pointerEvents: 'none' }}>
            <IconPlus size={28} />
          </ActionIcon>
          <Text size='xs' c='dimmed'>Slot {slotIndex + 1}</Text>
        </div>

        <CharacterSelect
          value={null}
          onChange={(id) => {
            if (id) AvVisualTabController.setSlotCharacter(slotIndex, id)
          }}
          opened={modalOpen}
          onOpenChange={setModalOpen}
          selectStyle={{ display: 'none' }}
        />
      </>
    )
  }

  function handleSpdCommit(val: number | string) {
    if (typeof val === 'number' && val > 0) {
      AvVisualTabController.setSlotSpdOverride(slotIndex, val)
    }
    setIsEditing(false)
  }

  return (
    <>
      <div className={classes.card}>
        <div className={classes.colorStrip} style={{ backgroundColor: color }} />

        <div className={classes.imageArea} onClick={() => setModalOpen(true)}>
          <img
            className={classes.portrait}
            src={Assets.getCharacterPreviewById(slot.characterId)}
          />
          <ActionIcon
            className={classes.clearButton}
            variant='filled'
            color='dark'
            size='xs'
            onClick={(e) => {
              e.stopPropagation()
              AvVisualTabController.setSlotCharacter(slotIndex, null)
            }}
          >
            <IconX size={10} />
          </ActionIcon>
        </div>

        <div className={classes.footer}>
          <Text
            size='xs'
            ta='center'
            style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {characterName ?? slot.characterId}
          </Text>

          <div className={classes.speedRow}>
            {isEditing
              ? (
                <NumberInput
                  size='xs'
                  defaultValue={displaySpd ?? undefined}
                  placeholder='SPD'
                  min={1}
                  max={999}
                  step={0.1}
                  decimalScale={1}
                  autoFocus
                  style={{ flex: 1 }}
                  onBlur={(e) => {
                    if (!enterPressedRef.current) handleSpdCommit(Number(e.currentTarget.value))
                    enterPressedRef.current = false
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      enterPressedRef.current = true
                      handleSpdCommit(Number(e.currentTarget.value))
                    }
                    if (e.key === 'Escape') setIsEditing(false)
                  }}
                />
              )
              : (
                <>
                  <Text
                    size='xs'
                    style={{ flex: 1, color: hasOverride ? color : undefined }}
                    c={hasOverride ? undefined : 'dimmed'}
                  >
                    {displaySpd != null ? `SPD ${displaySpd.toFixed(1)}` : '—'}
                  </Text>
                  <Tooltip label='Edit SPD' withArrow>
                    <ActionIcon variant='subtle' color='gray' size='xs' onClick={() => setIsEditing(true)}>
                      <IconPencil size={12} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}

            <Tooltip label='Reset SPD' withArrow>
              <ActionIcon
                variant='subtle'
                color='gray'
                size='xs'
                disabled={!hasOverride}
                onClick={() => {
                  AvVisualTabController.resetSlotSpdOverride(slotIndex)
                  setIsEditing(false)
                }}
              >
                <IconRefresh size={12} />
              </ActionIcon>
            </Tooltip>
          </div>
        </div>
      </div>

      <CharacterSelect
        value={slot.characterId as CharacterId}
        onChange={(id) => AvVisualTabController.setSlotCharacter(slotIndex, id)}
        opened={modalOpen}
        onOpenChange={setModalOpen}
        selectStyle={{ display: 'none' }}
      />
    </>
  )
}
