import { closestCenter, DndContext, type DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconPlus } from '@tabler/icons-react'
import { Button, Flex, Table } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import { type EnrichedWarpRequest, type WarpRequest, type WarpTargetResult } from 'lib/tabs/tabWarp/warpCalculatorTypes'
import { HiddenSelectHost, useHiddenSelectTrigger } from 'lib/tabs/tabWarp/HiddenSelectTrigger'
import { toMilestoneRows, WarpMilestoneRows, WarpTableHeader } from 'lib/tabs/tabWarp/WarpMilestoneTable'
import { TargetHeaderRow } from 'lib/tabs/tabWarp/WarpTargetHeaderCard'
import { addCharAndSignatureGoal, addCharGoal, addLcGoal, moveTarget } from 'lib/tabs/tabWarp/warpTargetMutations'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { LightConeSelect } from 'lib/ui/selectors/LightConeSelect'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './WarpCalculatorTab.module.css'

export function WarpUnifiedTable(props: {
  form: UseFormReturnType<WarpRequest>
  targetResults: WarpTargetResult[]
  request: EnrichedWarpRequest
}) {
  const { form, targetResults, request } = props
  const { t } = useTranslation('warpCalculatorTab', { keyPrefix: 'SectionTitles' })
  const canRemove = form.getValues().targets.length > 1
  const targetIds = targetResults.map((r) => r.target.id)
  const addChar = useHiddenSelectTrigger()
  const addLc = useHiddenSelectTrigger()
  const addCharAndSig = useHiddenSelectTrigger()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    moveTarget(form, String(active.id), String(over.id))
  }

  const colStyles = { goal: { width: '25%' } }
  const tableStyle = { tableLayout: 'fixed' as const, borderCollapse: 'separate' as const, borderSpacing: 0 }

  const thead = <WarpTableHeader request={request} goalColStyle={colStyles.goal}/>

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
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
            <Button variant='subtle' size='xs' leftSection={<IconPlus size={14}/>} onClick={addCharAndSig.open}>
              {t('AddCharacterAndSignature')/* Add character and signature */}
            </Button>
            <Button variant='subtle' size='xs' leftSection={<IconPlus size={14}/>} onClick={addChar.open}>
              {t('AddCharacter')/* Add character */}
            </Button>
            <Button variant='subtle' size='xs' leftSection={<IconPlus size={14}/>} onClick={addLc.open}>
              {t('AddLightCone')/* Add light cone */}
            </Button>
            <HiddenSelectHost>
              <CharacterSelect
                value={null}
                onChange={(characterId) => { if (characterId) addCharGoal(form, characterId) }}
                opened={addChar.opened}
                onOpenChange={addChar.onOpenChange}
              />
              <LightConeSelect
                value={null}
                onChange={(lightConeId) => { if (lightConeId) addLcGoal(form, lightConeId) }}
                opened={addLc.opened}
                onOpenChange={addLc.onOpenChange}
              />
              <CharacterSelect
                value={null}
                onChange={(characterId) => { if (characterId) addCharAndSignatureGoal(form, characterId) }}
                opened={addCharAndSig.opened}
                onOpenChange={addCharAndSig.onOpenChange}
              />
            </HiddenSelectHost>
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

  const dragHandleProps = useMemo(() => ({ ...attributes, ...listeners }), [attributes, listeners])

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
          <MemoizedTargetSection
            form={form}
            targetResult={targetResult}
            targetIndex={targetIndex}
            canRemove={canRemove}
            dragHandleRef={setActivatorNodeRef}
            dragHandleProps={dragHandleProps}
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
  const milestones = toMilestoneRows(targetResult.milestoneResults)

  return (
    <>
      <TargetHeaderRow
        form={form}
        target={target}
        targetIndex={targetIndex}
        canRemove={canRemove}
        dragHandleRef={dragHandleRef}
        dragHandleProps={dragHandleProps}
      />
      <WarpMilestoneRows milestones={milestones} rowKeyPrefix={target.id}/>
    </>
  )
}

const MemoizedTargetSection = memo(TargetSection)
