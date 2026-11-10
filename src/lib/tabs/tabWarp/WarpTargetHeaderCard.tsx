import {
  ActionIcon,
  Badge,
  Flex,
  SegmentedControl,
  type SegmentedControlItem,
  Table,
} from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import {
  IconArrowBigRightLines,
  IconGripVertical,
  IconX,
} from '@tabler/icons-react'
import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import { Assets } from 'lib/rendering/assets'
import {
  computeLcTransform,
  DEFAULT_LC_IMAGE_OFFSET,
} from 'lib/rendering/lcImageTransform'
import { getGameMetadata } from 'lib/state/gameMetadata'
import {
  HiddenSelectHost,
  useHiddenSelectTrigger,
} from 'lib/tabs/tabWarp/HiddenSelectTrigger'
import tableClasses from 'lib/tabs/tabWarp/WarpCalculatorTab.module.css'
import {
  EidolonLevel,
  isPremiumCharacter,
  isPremiumLightCone,
  type SkinGoal,
  SuperimpositionLevel,
  type WarpRequest,
  type WarpTarget,
  WarpType,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import { getTargetWarpType } from 'lib/tabs/tabWarp/warpDimensions'
import {
  clampSkinGoal,
  type SkinBanner,
} from 'lib/tabs/tabWarp/warpSkinBanners'
import {
  findCharacterByLightCone,
  getCharacterEidolonFloor,
  getLightConeSuperimpositionFloor,
  removeTarget,
  updateTarget,
  updateTargetFrom,
  updateTargetTo,
} from 'lib/tabs/tabWarp/warpTargetMutations'
import unifiedClasses from 'lib/tabs/tabWarp/WarpUnifiedTable.module.css'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { LightConeSelect } from 'lib/ui/selectors/LightConeSelect'
import type {
  CharacterOptions,
  LcOptions,
} from 'lib/ui/selectors/optionGenerator'
import { showImageOnLoad } from 'lib/utils/frontendUtils'
import type { HTMLAttributes } from 'react'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

const premiumCharacterFilter = (option: CharacterOptions[CharacterId]) => isPremiumCharacter(option.id)
const premiumLightConeFilter = (option: LcOptions[LightConeId]) => isPremiumLightCone(option.id)

const EIDOLON_TO_DATA = [
  { value: '0', label: 'E0' },
  { value: '1', label: 'E1' },
  { value: '2', label: 'E2' },
  { value: '3', label: 'E3' },
  { value: '4', label: 'E4' },
  { value: '5', label: 'E5' },
  { value: '6', label: 'E6' },
]
const EIDOLON_FROM_DATA = [
  { value: String(EidolonLevel.NONE), label: '—' },
  ...EIDOLON_TO_DATA,
]
const SUPERIMPOSITION_TO_DATA = [
  { value: '1', label: 'S1' },
  { value: '2', label: 'S2' },
  { value: '3', label: 'S3' },
  { value: '4', label: 'S4' },
  { value: '5', label: 'S5' },
]
const SUPERIMPOSITION_FROM_DATA = [
  { value: String(SuperimpositionLevel.NONE), label: '—' },
  ...SUPERIMPOSITION_TO_DATA,
]

const LC_PREVIEW_WIDTH = 230
const LC_PREVIEW_HEIGHT = 64

function TargetPreviewImage({ target, isChar, lcId }: { target: WarpTarget, isChar: boolean, lcId: LightConeId | null }) {
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

function GoalSelectorCells(props: {
  onRemove: () => void,
  fromData: SegmentedControlItem[],
  fromValue: number,
  onFromChange: (value: number) => void,
  toData: SegmentedControlItem[],
  toValue: number,
  onToChange: (value: number) => void,
}) {
  const { onRemove, fromData, fromValue, onFromChange, toData, toValue, onToChange } = props

  return (
    <>
      <Table.Td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 10px' }}>
        <SegmentedControl
          size='xs'
          w='100%'
          data={fromData}
          value={String(fromValue)}
          onChange={(val) => onFromChange(Number(val))}
        />
      </Table.Td>

      <Table.Td style={{ verticalAlign: 'middle', padding: '0 10px' }}>
        <Flex align='center' gap={4}>
          <Flex align='center' justify='center' w={32} h={32} style={{ flexShrink: 0, paddingRight: 15 }}>
            <IconArrowBigRightLines size={18} color='var(--text-primary)' fill='var(--text-primary)' />
          </Flex>
          <SegmentedControl
            size='xs'
            style={{ flex: 1 }}
            data={toData}
            value={String(toValue)}
            onChange={(val) => onToChange(Number(val))}
          />
          <ActionIcon size={32} variant='subtle' color='gray' onClick={onRemove}>
            <IconX size={18} />
          </ActionIcon>
        </Flex>
      </Table.Td>
    </>
  )
}

function TargetGoalSelectors({ form, target, targetIndex, warpType, floor }: {
  form: UseFormReturnType<WarpRequest>,
  target: WarpTarget,
  targetIndex: number,
  warpType: WarpType,
  floor: number,
}) {
  const isChar = warpType === WarpType.CHARACTER
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
    <GoalSelectorCells
      onRemove={() => removeTarget(form, targetIndex)}
      fromData={fromData}
      fromValue={fromValue}
      onFromChange={(value) => updateTargetFrom(form, targetIndex, warpType, value)}
      toData={toData}
      toValue={toValue}
      onToChange={(value) => updateTargetTo(form, targetIndex, warpType, value)}
    />
  )
}

export function TargetHeaderRow(props: {
  form: UseFormReturnType<WarpRequest>,
  target: WarpTarget,
  targetIndex: number,
  dragHandleRef?: (node: HTMLElement | null) => void,
  dragHandleProps?: HTMLAttributes<HTMLElement>,
}) {
  const { form, target, targetIndex, dragHandleRef, dragHandleProps } = props
  const select = useHiddenSelectTrigger()
  const warpType = getTargetWarpType(target)
  const isChar = warpType === WarpType.CHARACTER

  const characterConfig = target.characterId ? getCharacterConfig(target.characterId) : null
  const signatureLcId = characterConfig?.defaultLightCone ?? null
  const lcId = target.lightConeId ?? signatureLcId
  const goalCellBg = isChar && target.characterId
    ? 'linear-gradient(to right, rgba(0, 0, 0, 0.25) 75%, transparent 100%)'
    : undefined
  const floor = isChar
    ? getCharacterEidolonFloor(form.getValues().targets, target.characterId, targetIndex)
    : getLightConeSuperimpositionFloor(form.getValues().targets, target.lightConeId, targetIndex)

  return (
    <Table.Tr className={unifiedClasses.headerRow}>
      <Table.Td className={unifiedClasses.goalCell} onClick={select.open} style={{ background: goalCellBg }}>
        <div ref={dragHandleRef} className={unifiedClasses.dragHandle} {...dragHandleProps}>
          <IconGripVertical size={14} />
        </div>

        <TargetPreviewImage target={target} isChar={isChar} lcId={lcId} />

        <HiddenSelectHost>
          {isChar
            ? (
              <CharacterSelect
                value={target.characterId}
                onChange={(characterId) => updateTarget(form, targetIndex, { characterId: characterId ?? null })}
                opened={select.opened}
                onOpenChange={select.onOpenChange}
                optionFilter={premiumCharacterFilter}
              />
            )
            : (
              <LightConeSelect
                value={lcId}
                characterId={target.characterId}
                onChange={(selectedLcId) => {
                  const characterId = selectedLcId ? findCharacterByLightCone(selectedLcId) : null
                  updateTarget(form, targetIndex, { lightConeId: selectedLcId ?? null, characterId })
                }}
                opened={select.opened}
                onOpenChange={select.onOpenChange}
                optionFilter={premiumLightConeFilter}
              />
            )}
        </HiddenSelectHost>
      </Table.Td>

      <TargetGoalSelectors
        form={form}
        target={target}
        targetIndex={targetIndex}
        warpType={warpType}
        floor={floor}
      />
    </Table.Tr>
  )
}

// From counts failed draws already made. To is the final planned draw.
function SkinDrawSelectors({ skin, banner, onChange, onRemove }: {
  skin: SkinGoal,
  banner: SkinBanner,
  onChange: (skin: SkinGoal) => void,
  onRemove: () => void,
}) {
  const draws = Array.from({ length: banner.draws.length + 1 }, (_, draw) => draw)
  const fromData = draws.slice(0, -1).map((draw) => ({ value: String(draw), label: draw === 0 ? '—' : String(draw) }))
  const toData = draws.slice(1).map((draw) => ({ value: String(draw), label: String(draw), disabled: draw <= skin.drawsDone }))

  return (
    <GoalSelectorCells
      onRemove={onRemove}
      fromData={fromData}
      fromValue={skin.drawsDone}
      onFromChange={(drawsDone) => onChange(clampSkinGoal(banner, drawsDone, skin.drawTarget))}
      toData={toData}
      toValue={skin.drawTarget}
      onToChange={(drawTarget) => onChange(clampSkinGoal(banner, skin.drawsDone, drawTarget))}
    />
  )
}

export function SkinHeaderRow(props: {
  skin: SkinGoal,
  banner: SkinBanner,
  onChange: (skin: SkinGoal) => void,
  onRemove: () => void,
  dragHandleRef?: (node: HTMLElement | null) => void,
  dragHandleProps?: HTMLAttributes<HTMLElement>,
}) {
  const { skin, banner, onChange, onRemove, dragHandleRef, dragHandleProps } = props

  return (
    <Table.Tr className={unifiedClasses.headerRow}>
      <Table.Td className={unifiedClasses.goalCell} style={{ cursor: 'default' }}>
        {dragHandleProps && (
          <div ref={dragHandleRef} className={unifiedClasses.dragHandle} {...dragHandleProps}>
            <IconGripVertical size={14} />
          </div>
        )}

        <div className={unifiedClasses.previewImageLcWrap} style={{ width: LC_PREVIEW_WIDTH, height: LC_PREVIEW_HEIGHT }}>
          <img
            src={Assets.getSkinBanner(banner.image)}
            className={unifiedClasses.previewImageSkin}
            draggable={false}
            decoding='async'
            onLoad={showImageOnLoad}
          />
        </div>

        <Flex className={tableClasses.goalBarOverlay} align='center' style={{ pointerEvents: 'none' }}>
          <Flex className={tableClasses.goalContent} justify='center' align='center'>
            <Badge color='#000000aa' className={tableClasses.goalBadge} style={{ fontWeight: 'normal', fontSize: 12 }}>
              Skin
            </Badge>
          </Flex>
        </Flex>
      </Table.Td>

      <SkinDrawSelectors skin={skin} banner={banner} onChange={onChange} onRemove={onRemove} />
    </Table.Tr>
  )
}
