import { closestCenter, DndContext, type DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconArrowBigRightLines, IconGripVertical, IconPlus, IconX } from '@tabler/icons-react'
import { ActionIcon, Badge, Button, Flex, SegmentedControl, Table } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import i18next from 'i18next'
import { getAllCharacterConfigs, getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import { computeLcTransform, DEFAULT_LC_IMAGE_OFFSET } from 'lib/rendering/lcImageTransform'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Assets } from 'lib/rendering/assets'
import { EidolonLevel, SuperimpositionLevel, type WarpRequest, type WarpTarget, type WarpTargetResult, type EnrichedWarpRequest, DEFAULT_WARP_REQUEST } from 'lib/tabs/tabWarp/warpCalculatorController'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { LightConeSelect } from 'lib/ui/selectors/LightConeSelect'
import type { LightConeId } from 'types/lightCone'
import { localeNumberComma, localeNumber_0 } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { showImageOnLoad } from 'lib/utils/frontendUtils'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { useRef, useState } from 'react'
import chroma from 'chroma-js'
import classes from './WarpCalculatorTab.module.css'
import unifiedClasses from './WarpUnifiedTable.module.css'

const warpChanceColorScale = chroma.scale(['#df524bcc', '#efe959cc', '#89d86dcc']).domain([0, 0.33, 1])
const chanceThreshold = 0.0005

const EIDOLON_FROM_DATA = [
  { value: String(EidolonLevel.NONE), label: '—' },
  { value: String(EidolonLevel.E0), label: 'E0' },
  { value: String(EidolonLevel.E1), label: 'E1' },
  { value: String(EidolonLevel.E2), label: 'E2' },
  { value: String(EidolonLevel.E3), label: 'E3' },
  { value: String(EidolonLevel.E4), label: 'E4' },
  { value: String(EidolonLevel.E5), label: 'E5' },
  { value: String(EidolonLevel.E6), label: 'E6' },
]

const EIDOLON_TO_DATA = [
  { value: String(EidolonLevel.E0), label: 'E0' },
  { value: String(EidolonLevel.E1), label: 'E1' },
  { value: String(EidolonLevel.E2), label: 'E2' },
  { value: String(EidolonLevel.E3), label: 'E3' },
  { value: String(EidolonLevel.E4), label: 'E4' },
  { value: String(EidolonLevel.E5), label: 'E5' },
  { value: String(EidolonLevel.E6), label: 'E6' },
]

const SUPERIMPOSITION_FROM_DATA = [
  { value: String(SuperimpositionLevel.NONE), label: '—' },
  { value: String(SuperimpositionLevel.S1), label: 'S1' },
  { value: String(SuperimpositionLevel.S2), label: 'S2' },
  { value: String(SuperimpositionLevel.S3), label: 'S3' },
  { value: String(SuperimpositionLevel.S4), label: 'S4' },
  { value: String(SuperimpositionLevel.S5), label: 'S5' },
]

const SUPERIMPOSITION_TO_DATA = [
  { value: String(SuperimpositionLevel.S1), label: 'S1' },
  { value: String(SuperimpositionLevel.S2), label: 'S2' },
  { value: String(SuperimpositionLevel.S3), label: 'S3' },
  { value: String(SuperimpositionLevel.S4), label: 'S4' },
  { value: String(SuperimpositionLevel.S5), label: 'S5' },
]

function findCharacterByLightCone(lightConeId: LightConeId): WarpTarget['characterId'] {
  for (const [characterId, config] of getAllCharacterConfigs()) {
    if (config.defaultLightCone === lightConeId) return characterId
  }
  return null
}

function getGoalType(target: WarpTarget): 'character' | 'lightcone' {
  if (target.targetSuperimpositionLevel > SuperimpositionLevel.NONE && target.targetEidolonLevel === EidolonLevel.NONE) {
    return 'lightcone'
  }
  return 'character'
}

function translateLabel(label: string) {
  const t = i18next.getFixedT(null, ['warpCalculatorTab', 'common'])
  if (/^S\d$/.test(label)) return t('common:SuperimpositionNShort', { superimposition: label.charAt(1) })
  return t('warpCalculatorTab:TargetLabel', { superimposition: label.charAt(3), eidolon: label.charAt(1) })
}

function updateTarget(form: UseFormReturnType<WarpRequest>, index: number, patch: Partial<WarpTarget>) {
  const targets = form.getValues().targets.map((target, targetIndex) => {
    if (targetIndex !== index) return target
    return { ...target, ...patch }
  })
  form.setFieldValue('targets', targets)
}

function removeTarget(form: UseFormReturnType<WarpRequest>, index: number) {
  const targets = form.getValues().targets.filter((_, targetIndex) => targetIndex !== index)
  if (targets.length > 0) {
    form.setFieldValue('targets', targets)
  }
}

function moveTarget(form: UseFormReturnType<WarpRequest>, activeId: string, overId: string) {
  const targets = [...form.getValues().targets]
  const fromIndex = targets.findIndex((target) => target.id === activeId)
  const toIndex = targets.findIndex((target) => target.id === overId)

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return

  const [target] = targets.splice(fromIndex, 1)
  targets.splice(toIndex, 0, target)
  form.setFieldValue('targets', targets)
}

export function WarpUnifiedTable(props: {
  form: UseFormReturnType<WarpRequest>
  targetResults: WarpTargetResult[]
  request: EnrichedWarpRequest
}) {
  const { form, targetResults, request } = props
  const canRemove = form.getValues().targets.length > 1
  const targetIds = targetResults.map((r) => r.target.id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    moveTarget(form, String(active.id), String(over.id))
  }

  const colStyles = { goal: { width: '25%' } }
  const tableStyle = { tableLayout: 'fixed' as const, borderCollapse: 'separate' as const, borderSpacing: 0 }

  const thead = (
    <Table.Thead>
      <Table.Tr>
        <Table.Th style={{ textAlign: 'center', ...colStyles.goal }}>Goal</Table.Th>
        <Table.Th style={{ textAlign: 'center' }}>
          <Flex justify='center' align='center' gap={4}>
            Chance with {localeNumberComma(request.warps)}
            <img style={{ height: 16 }} src={Assets.getPass()}/>
          </Flex>
        </Table.Th>
        <Table.Th style={{ textAlign: 'center' }}>
          <Flex justify='center' align='center' gap={4}>
            Avg
            <img style={{ height: 16 }} src={Assets.getPass()}/>
            needed
          </Flex>
        </Table.Th>
      </Table.Tr>
    </Table.Thead>
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={targetIds} strategy={verticalListSortingStrategy}>
        <Flex direction='column' gap={12} style={{ marginTop: 16 }}>
          {targetResults.map((targetResult, targetIndex) => (
            <SortableTargetGroup
              key={targetResult.target.id}
              id={targetResult.target.id}
              form={form}
              targetResult={targetResult}
              targetIndex={targetIndex}
              canRemove={canRemove}
              thead={targetIndex === 0 ? thead : undefined}
              colStyles={colStyles}
              tableStyle={tableStyle}
            />
          ))}

          <Flex gap={8} py={4}>
            <Button variant='subtle' size='xs' leftSection={<IconPlus size={14}/>} onClick={() => addCharGoal(form)}>
              Add character
            </Button>
            <Button variant='subtle' size='xs' leftSection={<IconPlus size={14}/>} onClick={() => addLcGoal(form)}>
              Add light cone
            </Button>
          </Flex>
        </Flex>
      </SortableContext>
    </DndContext>
  )
}

function SortableTargetGroup(props: {
  id: string
  form: UseFormReturnType<WarpRequest>
  targetResult: WarpTargetResult
  targetIndex: number
  canRemove: boolean
  thead?: ReactNode
  colStyles: { goal: { width: string } }
  tableStyle: CSSProperties
}) {
  const { id, form, targetResult, targetIndex, canRemove, thead, colStyles, tableStyle } = props
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: () => false,
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transform ? transition : undefined,
    opacity: isDragging ? 0.45 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Table className={classes.warpTable} style={tableStyle}>
        <colgroup>
          <col style={colStyles.goal}/>
          <col/>
          <col/>
        </colgroup>
        {thead}
        <Table.Tbody>
          <TargetSection
            form={form}
            targetResult={targetResult}
            targetIndex={targetIndex}
            canRemove={canRemove}
            dragHandleRef={setActivatorNodeRef}
            dragHandleProps={{ ...attributes, ...listeners }}
          />
        </Table.Tbody>
      </Table>
    </div>
  )
}

function TargetSection(props: {
  form: UseFormReturnType<WarpRequest>
  targetResult: WarpTargetResult
  targetIndex: number
  canRemove: boolean
  dragHandleRef?: (node: HTMLElement | null) => void
  dragHandleProps?: HTMLAttributes<HTMLElement>
}) {
  const { form, targetResult, targetIndex, canRemove, dragHandleRef, dragHandleProps } = props
  const target = targetResult.target
  const type = getGoalType(target)
  const milestones = Object.entries(targetResult.milestoneResults ?? {})
    .map(([label, result]) => ({ label, warps: result.warps, wins: result.wins }))

  return (
    <>
      <TargetHeaderRow
        form={form}
        target={target}
        targetIndex={targetIndex}
        type={type}
        canRemove={canRemove}
        dragHandleRef={dragHandleRef}
        dragHandleProps={dragHandleProps}
      />
      {milestones.map((milestone) => (
        <Table.Tr
          key={`${target.id}-${milestone.label}`}
          className={milestone.wins < chanceThreshold ? classes.warpRowDisabled : classes.warpRow}
        >
          <Table.Td className={classes.goalCell}>
            <Flex className={classes.goalBarOverlay} align='center'>
              {milestone.wins >= chanceThreshold && (
                <div
                  className={classes.goalBar}
                  style={{
                    width: `${milestone.wins * 100}%`,
                    backgroundColor: warpChanceColorScale(milestone.wins).hex(),
                  }}
                />
              )}
              <Flex className={classes.goalContent} justify='center' align='center'>
                <Badge color='#000000aa' className={classes.goalBadge} style={{ fontWeight: 'normal', fontSize: 12 }}>
                  {translateLabel(milestone.label)}
                </Badge>
              </Flex>
            </Flex>
          </Table.Td>
          <Table.Td style={{ textAlign: 'center' }}>
            {`${localeNumber_0(precisionRound(milestone.wins * 100, 1))}%`}
          </Table.Td>
          <Table.Td style={{ textAlign: 'center' }}>
            <Flex align='center' justify='center' gap={4}>
              {Math.ceil(milestone.warps)}
              <img style={{ height: 14 }} src={Assets.getPass()}/>
            </Flex>
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  )
}

function TargetHeaderRow(props: {
  form: UseFormReturnType<WarpRequest>
  target: WarpTarget
  targetIndex: number
  type: 'character' | 'lightcone'
  canRemove: boolean
  dragHandleRef?: (node: HTMLElement | null) => void
  dragHandleProps?: HTMLAttributes<HTMLElement>
}) {
  const { form, target, targetIndex, type, canRemove, dragHandleRef, dragHandleProps } = props
  const [selectOpen, setSelectOpen] = useState(false)
  const justClosedRef = useRef(false)
  const isChar = type === 'character'

  const tGameData = i18next.getFixedT(null, 'gameData')
  const charName = target.characterId ? (tGameData(`Characters.${target.characterId}.Name`) as string) : ''
  const signatureLcId = target.characterId ? getCharacterConfig(target.characterId)?.defaultLightCone ?? null : null
  const lcId = target.lightConeId ?? signatureLcId
  const characterConfig = target.characterId ? getCharacterConfig(target.characterId) : undefined
  const lcImageOffset = lcId ? getGameMetadata().lightCones[lcId]?.imageOffset ?? DEFAULT_LC_IMAGE_OFFSET : DEFAULT_LC_IMAGE_OFFSET

  const fromData = isChar ? EIDOLON_FROM_DATA : SUPERIMPOSITION_FROM_DATA
  const fromValue = isChar ? target.currentEidolonLevel : target.currentSuperimpositionLevel
  const toValue = isChar ? target.targetEidolonLevel : target.targetSuperimpositionLevel
  const toData = (isChar ? EIDOLON_TO_DATA : SUPERIMPOSITION_TO_DATA).map((item) => ({
    ...item,
    disabled: Number(item.value) <= fromValue,
  }))

  return (
    <Table.Tr className={unifiedClasses.headerRow}>
      <Table.Td
        className={unifiedClasses.goalCell}
        onClick={() => { if (!justClosedRef.current) setSelectOpen(true) }}
      >
        <div
          ref={dragHandleRef}
          className={unifiedClasses.dragHandle}
          {...dragHandleProps}
        >
          <IconGripVertical size={14}/>
        </div>
        {target.characterId && isChar && (
          <img
            src={Assets.getCharacterPreviewById(target.characterId)}
            className={unifiedClasses.previewImage}
            draggable={false}
            decoding='async'
            onLoad={showImageOnLoad}
            style={characterConfig?.display.gridPortraitOffset
              ? { marginTop: -(characterConfig.display.gridPortraitOffset * 0.5) }
              : undefined}
          />
        )}
        {!isChar && lcId && (() => {
          const containerW = 230
          const containerH = 64
          const { dy, scale } = computeLcTransform(lcImageOffset, containerW, containerH)
          return (
            <div className={unifiedClasses.previewImageLcWrap} style={{ width: containerW, height: containerH }}>
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
        })()}
        <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0, overflow: 'hidden' }}>
          {isChar ? (
            <CharacterSelect
              value={target.characterId}
              onChange={(characterId) => updateTarget(form, targetIndex, { characterId: characterId ?? null })}
              opened={selectOpen}
              onOpenChange={(open) => {
                setSelectOpen(open)
                if (!open) {
                  justClosedRef.current = true
                  setTimeout(() => { justClosedRef.current = false }, 150)
                }
              }}
            />
          ) : (
            <LightConeSelect
              value={lcId}
              characterId={target.characterId}
              onChange={(selectedLcId) => {
                const characterId = selectedLcId ? findCharacterByLightCone(selectedLcId) : null
                updateTarget(form, targetIndex, { lightConeId: selectedLcId ?? null, characterId })
              }}
              opened={selectOpen}
              onOpenChange={(open) => {
                setSelectOpen(open)
                if (!open) {
                  justClosedRef.current = true
                  setTimeout(() => { justClosedRef.current = false }, 150)
                }
              }}
            />
          )}
        </div>
      </Table.Td>

      <Table.Td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 10px' }}>
        <SegmentedControl
          size='sm'
          w='100%'
          data={fromData}
          value={String(fromValue)}
          onChange={(val) => {
            if (isChar) updateTarget(form, targetIndex, { currentEidolonLevel: Number(val) as EidolonLevel })
            else updateTarget(form, targetIndex, { currentSuperimpositionLevel: Number(val) as SuperimpositionLevel })
          }}
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
            onChange={(val) => {
              if (isChar) updateTarget(form, targetIndex, { targetEidolonLevel: Number(val) as EidolonLevel })
              else updateTarget(form, targetIndex, { targetSuperimpositionLevel: Number(val) as SuperimpositionLevel })
            }}
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
    </Table.Tr>
  )
}

function addCharGoal(form: UseFormReturnType<WarpRequest>) {
  const id = globalThis.crypto?.randomUUID?.() ?? `target-${Date.now()}`
  const targets = [
    ...form.getValues().targets,
    {
      ...DEFAULT_WARP_REQUEST.targets[0],
      id,
      targetEidolonLevel: EidolonLevel.E0,
      targetSuperimpositionLevel: SuperimpositionLevel.NONE,
      currentEidolonLevel: EidolonLevel.NONE,
      currentSuperimpositionLevel: SuperimpositionLevel.NONE,
      strategy: form.getValues().strategy,
    },
  ]
  form.setFieldValue('targets', targets)
}

function addLcGoal(form: UseFormReturnType<WarpRequest>) {
  const id = globalThis.crypto?.randomUUID?.() ?? `target-${Date.now()}`
  const targets = [
    ...form.getValues().targets,
    {
      ...DEFAULT_WARP_REQUEST.targets[0],
      id,
      targetEidolonLevel: EidolonLevel.NONE,
      targetSuperimpositionLevel: SuperimpositionLevel.S1,
      currentEidolonLevel: EidolonLevel.NONE,
      currentSuperimpositionLevel: SuperimpositionLevel.NONE,
      strategy: form.getValues().strategy,
    },
  ]
  form.setFieldValue('targets', targets)
}
