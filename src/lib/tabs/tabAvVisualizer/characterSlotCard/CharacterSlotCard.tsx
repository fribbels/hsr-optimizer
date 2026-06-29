import {
  ActionIcon,
  NumberInput,
  Text,
  Tooltip,
} from '@mantine/core'
import { IconPencil, IconPlus, IconRefresh, IconX } from '@tabler/icons-react'
import { Assets } from 'lib/rendering/assets'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import type { Slot } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import classes from './CharacterSlotCard.module.css'

const EIDOLON_LEVELS = [0, 1, 2, 3, 4, 5, 6]

type CharacterSlotCardProps = {
  slotIndex: number
  slot: Slot
  characterName: string | null
  baseSpd: number | null
  baseErr: number
  baseEidolon: number
}

export function CharacterSlotCard({ slotIndex, slot, characterName, baseSpd, baseErr, baseEidolon }: CharacterSlotCardProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingErr, setIsEditingErr] = useState(false)
  const enterPressedRef = useRef(false)
  const enterPressedErrRef = useRef(false)
  const hasOverride = slot.spdOverride !== null
  const displaySpd = hasOverride ? slot.spdOverride : baseSpd
  const hasErrOverride = slot.errOverride != null
  // Displayed/edited as the in-game convention (100% = no bonus), stored internally as the bonus fraction
  const displayErrPct = (1 + (hasErrOverride ? slot.errOverride! : baseErr)) * 100
  const hasEidolonOverride = slot.eidolonOverride != null
  const displayEidolon = hasEidolonOverride ? slot.eidolonOverride! : baseEidolon

  if (!slot.characterId) {
    return (
      <>
        <div className={classes.emptyCard} onClick={() => setModalOpen(true)}>
          <ActionIcon variant='subtle' color='gray' size='xl' style={{ pointerEvents: 'none' }}>
            <IconPlus size={28} />
          </ActionIcon>
          <Text size='xs' c='dimmed'>{tAv('CharacterSlot.EmptySlot', { n: slotIndex + 1 })}</Text>
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

  const color = AvVisualTabController.getCharacterColor(slot.characterId, undefined, slotIndex)

  function handleSpdCommit(val: number | string) {
    if (typeof val === 'number' && val > 0) {
      AvVisualTabController.setSlotSpdOverride(slotIndex, val)
    }
    setIsEditing(false)
  }

  function handleErrCommit(val: number | string) {
    if (typeof val === 'number' && val > 0) {
      AvVisualTabController.setSlotErrOverride(slotIndex, val / 100 - 1)
    }
    setIsEditingErr(false)
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
          <Text className={classes.nameOverlay} size='xs' ta='center' c='white'>
            {characterName ?? slot.characterId}
          </Text>
        </div>

        <div className={classes.footer}>
          <div className={classes.speedRow}>
            {isEditing
              ? (
                <NumberInput
                  size='xs'
                  defaultValue={displaySpd ?? undefined}
                  placeholder={tAv('CharacterSlot.SpdPlaceholder')}
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
                    {displaySpd != null ? tAv('CharacterSlot.SpdDisplay', { value: displaySpd.toFixed(1) }) : tAv('CharacterSlot.NoValue')}
                  </Text>
                  <Tooltip label={tAv('CharacterSlot.EditSpd')} withArrow>
                    <ActionIcon variant='subtle' color='gray' size='xs' onClick={() => setIsEditing(true)}>
                      <IconPencil size={12} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}

            <Tooltip label={tAv('CharacterSlot.ResetSpd')} withArrow>
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

          <div className={classes.speedRow}>
            {isEditingErr
              ? (
                <NumberInput
                  size='xs'
                  defaultValue={displayErrPct}
                  placeholder={tAv('CharacterSlot.ErrPlaceholder')}
                  min={1}
                  max={999}
                  step={0.1}
                  decimalScale={1}
                  autoFocus
                  style={{ flex: 1 }}
                  onBlur={(e) => {
                    if (!enterPressedErrRef.current) handleErrCommit(Number(e.currentTarget.value))
                    enterPressedErrRef.current = false
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      enterPressedErrRef.current = true
                      handleErrCommit(Number(e.currentTarget.value))
                    }
                    if (e.key === 'Escape') setIsEditingErr(false)
                  }}
                />
              )
              : (
                <>
                  <Text
                    size='xs'
                    style={{ flex: 1, color: hasErrOverride ? color : undefined }}
                    c={hasErrOverride ? undefined : 'dimmed'}
                  >
                    {tAv('CharacterSlot.ErrDisplay', { value: displayErrPct.toFixed(1) })}
                  </Text>
                  <Tooltip label={tAv('CharacterSlot.EditErr')} withArrow>
                    <ActionIcon variant='subtle' color='gray' size='xs' onClick={() => setIsEditingErr(true)}>
                      <IconPencil size={12} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}

            <Tooltip label={tAv('CharacterSlot.ResetErr')} withArrow>
              <ActionIcon
                variant='subtle'
                color='gray'
                size='xs'
                disabled={!hasErrOverride}
                onClick={() => {
                  AvVisualTabController.resetSlotErrOverride(slotIndex)
                  setIsEditingErr(false)
                }}
              >
                <IconRefresh size={12} />
              </ActionIcon>
            </Tooltip>
          </div>

          <div className={classes.speedRow}>
            <Text
              size='xs'
              style={{ width: 18, flexShrink: 0, color: hasEidolonOverride ? color : undefined }}
              c={hasEidolonOverride ? undefined : 'dimmed'}
            >
              E{displayEidolon}
            </Text>
            <div style={{ display: 'flex', gap: 2, flex: 1 }}>
              {EIDOLON_LEVELS.map((level) => (
                <Tooltip key={level} label={`E${level}`} withArrow>
                  <div
                    onClick={() => AvVisualTabController.setSlotEidolonOverride(slotIndex, level)}
                    style={{
                      flex: 1,
                      height: 14,
                      borderRadius: 2,
                      cursor: 'pointer',
                      background: level <= displayEidolon
                        ? (hasEidolonOverride ? color : 'var(--mantine-color-gray-5)')
                        : 'var(--mantine-color-dark-4)',
                    }}
                  />
                </Tooltip>
              ))}
            </div>
            <Tooltip label={tAv('CharacterSlot.ResetEidolon')} withArrow>
              <ActionIcon
                variant='subtle'
                color='gray'
                size='xs'
                disabled={!hasEidolonOverride}
                onClick={() => AvVisualTabController.resetSlotEidolonOverride(slotIndex)}
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
