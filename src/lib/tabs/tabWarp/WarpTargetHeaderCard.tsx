import { IconArrowBigRightLines, IconGripVertical, IconX } from '@tabler/icons-react'
import { ActionIcon, Flex, SegmentedControl, Table } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import { computeLcTransform, DEFAULT_LC_IMAGE_OFFSET } from 'lib/rendering/lcImageTransform'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Assets } from 'lib/rendering/assets'
import { EidolonLevel, SuperimpositionLevel, type WarpRequest, type WarpTarget } from 'lib/tabs/tabWarp/warpCalculatorTypes'
import { HiddenSelectHost, useHiddenSelectTrigger } from 'lib/tabs/tabWarp/HiddenSelectTrigger'
import {
  findCharacterByLightCone,
  getCharacterEidolonFloor,
  getLightConeSuperimpositionFloor,
  removeTarget,
  updateTarget,
  updateTargetFrom,
  updateTargetTo,
} from 'lib/tabs/tabWarp/warpTargetMutations'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { LightConeSelect } from 'lib/ui/selectors/LightConeSelect'
import { showImageOnLoad } from 'lib/utils/frontendUtils'
import type { HTMLAttributes } from 'react'
import unifiedClasses from './WarpUnifiedTable.module.css'

const EIDOLON_TO_DATA = Array.from({ length: 7 }, (_, i) => ({ value: String(i), label: `E${i}` }))
const EIDOLON_FROM_DATA = [{ value: String(EidolonLevel.NONE), label: '—' }, ...EIDOLON_TO_DATA]
const SUPERIMPOSITION_TO_DATA = Array.from({ length: 5 }, (_, i) => ({ value: String(i + 1), label: `S${i + 1}` }))
const SUPERIMPOSITION_FROM_DATA = [{ value: String(SuperimpositionLevel.NONE), label: '—' }, ...SUPERIMPOSITION_TO_DATA]

const LC_PREVIEW_WIDTH = 230
const LC_PREVIEW_HEIGHT = 64

function getGoalType(target: WarpTarget): 'character' | 'lightcone' {
  if (target.targetSuperimpositionLevel > SuperimpositionLevel.NONE && target.targetEidolonLevel === EidolonLevel.NONE) {
    return 'lightcone'
  }
  return 'character'
}

function TargetPreviewImage({ target, isChar, lcId }: { target: WarpTarget, isChar: boolean, lcId: WarpTarget['lightConeId'] }) {
  if (isChar) {
    if (!target.characterId) return null
    const portraitOffset = getCharacterConfig(target.characterId)?.display.gridPortraitOffset
    return (
      <img
        src={Assets.getCharacterPreviewById(target.characterId)}
        className={unifiedClasses.previewImage}
        draggable={false}
        decoding='async'
        onLoad={showImageOnLoad}
        style={portraitOffset ? { marginTop: -(portraitOffset * 0.5) } : undefined}
      />
    )
  }

  if (!lcId) return null
  const lcImageOffset = getGameMetadata().lightCones[lcId]?.imageOffset ?? DEFAULT_LC_IMAGE_OFFSET
  const { dy, scale } = computeLcTransform(lcImageOffset, LC_PREVIEW_WIDTH, LC_PREVIEW_HEIGHT)
  return (
    <div className={unifiedClasses.previewImageLcWrap} style={{ width: LC_PREVIEW_WIDTH, height: LC_PREVIEW_HEIGHT }}>
      <img
        src={Assets.getLightConePortraitById(lcId)}
        className={unifiedClasses.previewImageLc}
        draggable={false}
        decoding='async'
        onLoad={showImageOnLoad}
        style={{ transform: `translateY(${dy}px) scale(${scale})` }}
      />
    </div>
  )
}

function TargetGoalSelectors({ form, target, targetIndex, isChar, floor, canRemove }: {
  form: UseFormReturnType<WarpRequest>
  target: WarpTarget
  targetIndex: number
  isChar: boolean
  floor: number
  canRemove: boolean
}) {
  const fromValue = isChar ? target.currentEidolonLevel : target.currentSuperimpositionLevel
  const toValue = isChar ? target.targetEidolonLevel : target.targetSuperimpositionLevel
  const fromData = (isChar ? EIDOLON_FROM_DATA : SUPERIMPOSITION_FROM_DATA).map((item) => ({
    ...item,
    disabled: Number(item.value) < floor,
  }))
  const toData = (isChar ? EIDOLON_TO_DATA : SUPERIMPOSITION_TO_DATA).map((item) => ({
    ...item,
    disabled: Number(item.value) <= fromValue,
  }))

  return (
    <>
      <Table.Td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 10px' }}>
        <SegmentedControl
          size='sm'
          w='100%'
          data={fromData}
          value={String(fromValue)}
          onChange={(val) => updateTargetFrom(form, targetIndex, isChar, Number(val))}
        />
      </Table.Td>

      <Table.Td style={{ verticalAlign: 'middle', padding: '0 10px' }}>
        <Flex align='center' gap={4}>
          <Flex align='center' justify='center' w={32} h={32} style={{ flexShrink: 0, paddingRight: 15 }}>
            <IconArrowBigRightLines size={18} color='var(--text-primary)' fill='var(--text-primary)'/>
          </Flex>
          <SegmentedControl
            size='sm'
            style={{ flex: 1 }}
            data={toData}
            value={String(toValue)}
            onChange={(val) => updateTargetTo(form, targetIndex, isChar, Number(val))}
          />
          <ActionIcon
            size={32} variant='subtle' color='gray'
            disabled={!canRemove}
            onClick={() => removeTarget(form, targetIndex)}
          >
            <IconX size={18}/>
          </ActionIcon>
        </Flex>
      </Table.Td>
    </>
  )
}

export function TargetHeaderRow(props: {
  form: UseFormReturnType<WarpRequest>
  target: WarpTarget
  targetIndex: number
  canRemove: boolean
  dragHandleRef?: (node: HTMLElement | null) => void
  dragHandleProps?: HTMLAttributes<HTMLElement>
}) {
  const { form, target, targetIndex, canRemove, dragHandleRef, dragHandleProps } = props
  const select = useHiddenSelectTrigger()
  const isChar = getGoalType(target) === 'character'

  const signatureLcId = target.characterId ? getCharacterConfig(target.characterId)?.defaultLightCone ?? null : null
  const lcId = target.lightConeId ?? signatureLcId
  const floor = isChar
    ? getCharacterEidolonFloor(form.getValues().targets, target.characterId, targetIndex)
    : getLightConeSuperimpositionFloor(form.getValues().targets, target.lightConeId, targetIndex)

  return (
    <Table.Tr className={unifiedClasses.headerRow}>
      <Table.Td className={unifiedClasses.goalCell} onClick={select.open}>
        <div ref={dragHandleRef} className={unifiedClasses.dragHandle} {...dragHandleProps}>
          <IconGripVertical size={14}/>
        </div>

        <TargetPreviewImage target={target} isChar={isChar} lcId={lcId}/>

        <HiddenSelectHost>
          {isChar ? (
            <CharacterSelect
              value={target.characterId}
              onChange={(characterId) => updateTarget(form, targetIndex, { characterId: characterId ?? null })}
              opened={select.opened}
              onOpenChange={select.onOpenChange}
            />
          ) : (
            <LightConeSelect
              value={lcId}
              characterId={target.characterId}
              onChange={(selectedLcId) => {
                const characterId = selectedLcId ? findCharacterByLightCone(selectedLcId) : null
                updateTarget(form, targetIndex, { lightConeId: selectedLcId ?? null, characterId })
              }}
              opened={select.opened}
              onOpenChange={select.onOpenChange}
            />
          )}
        </HiddenSelectHost>
      </Table.Td>

      <TargetGoalSelectors
        form={form}
        target={target}
        targetIndex={targetIndex}
        isChar={isChar}
        floor={floor}
        canRemove={canRemove}
      />
    </Table.Tr>
  )
}
