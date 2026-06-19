import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Alert,
  Button,
  Flex,
  Table,
} from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import { IconPlus } from '@tabler/icons-react'
import {
  HiddenSelectHost,
  useHiddenSelectTrigger,
} from 'lib/tabs/tabWarp/HiddenSelectTrigger'
import classes from 'lib/tabs/tabWarp/WarpCalculatorTab.module.css'
import {
  type EnrichedWarpRequest,
  isPremiumCharacter,
  isPremiumLightCone,
  type WarpRequest,
  type WarpTarget,
  type WarpTargetResult,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import {
  toMilestoneRows,
  WarpMilestoneRows,
  WarpTableHeader,
} from 'lib/tabs/tabWarp/WarpMilestoneTable'
import { TargetHeaderRow } from 'lib/tabs/tabWarp/WarpTargetHeaderCard'
import {
  addCharAndSignatureGoal,
  addCharGoal,
  addLcGoal,
  moveTarget,
} from 'lib/tabs/tabWarp/warpTargetMutations'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { LightConeSelect } from 'lib/ui/selectors/LightConeSelect'
import type {
  CharacterOptions,
  LcOptions,
} from 'lib/ui/selectors/optionGenerator'
import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react'
import {
  memo,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

import { Archer } from 'lib/conditionals/character/1000/Archer'
import { Saber } from 'lib/conditionals/character/1000/Saber'
import { Gilgamesh } from 'lib/conditionals/character/1500/Gilgamesh'
import { RinTohsaka } from 'lib/conditionals/character/1500/RinTohsaka'

const COLLAB_CHARACTER_IDS = new Set([Saber.id, Archer.id, RinTohsaka.id, Gilgamesh.id] as CharacterId[])
const COLLAB_LIGHT_CONE_IDS = new Set(
  [Saber.defaultLightCone, Archer.defaultLightCone, RinTohsaka.defaultLightCone, Gilgamesh.defaultLightCone] as LightConeId[],
)

const premiumCharacterFilter = (option: CharacterOptions[CharacterId]) => isPremiumCharacter(option.id)
const premiumLightConeFilter = (option: LcOptions[LightConeId]) => isPremiumLightCone(option.id)

const GOAL_COL_STYLE = { width: '25%' }
const TABLE_STYLE = { tableLayout: 'fixed' as const, borderCollapse: 'separate' as const, borderSpacing: 0 }

export function WarpUnifiedTable(props: {
  form: UseFormReturnType<WarpRequest>,
  targetResults: WarpTargetResult[],
  request: EnrichedWarpRequest,
}) {
  const { form, targetResults, request } = props
  const { t } = useTranslation('warpCalculatorTab', { keyPrefix: 'SectionTitles' })
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

  const thead = <WarpTableHeader request={request} goalColStyle={GOAL_COL_STYLE} />

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
              thead={targetIndex === 0 ? thead : undefined}
            />
          ))}

          <CollabBannerWarning targets={form.getValues().targets} />

          <Flex gap={8} py={4}>
            <Button variant='subtle' size='xs' leftSection={<IconPlus size={14} />} onClick={addCharAndSig.open}>
              {t('AddCharacterAndSignature') /* Add character and signature */}
            </Button>
            <Button variant='subtle' size='xs' leftSection={<IconPlus size={14} />} onClick={addChar.open}>
              {t('AddCharacter') /* Add character */}
            </Button>
            <Button variant='subtle' size='xs' leftSection={<IconPlus size={14} />} onClick={addLc.open}>
              {t('AddLightCone') /* Add light cone */}
            </Button>
            <HiddenSelectHost>
              <CharacterSelect
                value={null}
                onChange={(characterId) => {
                  if (characterId) addCharGoal(form, characterId)
                }}
                opened={addChar.opened}
                onOpenChange={addChar.onOpenChange}
                optionFilter={premiumCharacterFilter}
              />
              <LightConeSelect
                value={null}
                onChange={(lightConeId) => {
                  if (lightConeId) addLcGoal(form, lightConeId)
                }}
                opened={addLc.opened}
                onOpenChange={addLc.onOpenChange}
                optionFilter={premiumLightConeFilter}
              />
              <CharacterSelect
                value={null}
                onChange={(characterId) => {
                  if (characterId) addCharAndSignatureGoal(form, characterId)
                }}
                opened={addCharAndSig.opened}
                onOpenChange={addCharAndSig.onOpenChange}
                optionFilter={premiumCharacterFilter}
              />
            </HiddenSelectHost>
          </Flex>
        </Flex>
      </SortableContext>
    </DndContext>
  )
}

function SortableTargetGroup(props: {
  id: string,
  form: UseFormReturnType<WarpRequest>,
  targetResult: WarpTargetResult,
  targetIndex: number,
  thead?: ReactNode,
}) {
  const { id, form, targetResult, targetIndex, thead } = props
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges: () => false,
  })

  const dragHandleProps = useMemo(() => ({ ...attributes, ...listeners }), [attributes, listeners])

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transform ? transition : undefined,
    opacity: isDragging ? 0.45 : undefined,
    zIndex: isDragging ? 1 : undefined,
    position: 'relative',
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Table className={`${classes.warpTable} ${classes.warpTableNoStripe}`} style={TABLE_STYLE}>
        <colgroup>
          <col style={GOAL_COL_STYLE} />
          <col />
          <col />
        </colgroup>
        {thead}
        <Table.Tbody>
          <TargetSection
            form={form}
            targetResult={targetResult}
            targetIndex={targetIndex}
            dragHandleRef={setActivatorNodeRef}
            dragHandleProps={dragHandleProps}
          />
        </Table.Tbody>
      </Table>
    </div>
  )
}

function CollabBannerWarning({ targets }: { targets: WarpTarget[] }) {
  const hasCollab = targets.some((t) =>
    (t.characterId && COLLAB_CHARACTER_IDS.has(t.characterId))
    || (t.lightConeId && COLLAB_LIGHT_CONE_IDS.has(t.lightConeId))
  )

  if (!hasCollab) return null

  return (
    <Alert variant='light' color='blue' mt={4}>
      Collab banners have a separate pity counter from standard banners
    </Alert>
  )
}

const TargetSection = memo(function TargetSection(props: {
  form: UseFormReturnType<WarpRequest>,
  targetResult: WarpTargetResult,
  targetIndex: number,
  dragHandleRef?: (node: HTMLElement | null) => void,
  dragHandleProps?: HTMLAttributes<HTMLElement>,
}) {
  const { form, targetResult, targetIndex, dragHandleRef, dragHandleProps } = props
  const target = targetResult.target
  const milestones = toMilestoneRows(targetResult.milestoneResults)

  return (
    <>
      <TargetHeaderRow
        form={form}
        target={target}
        targetIndex={targetIndex}
        dragHandleRef={dragHandleRef}
        dragHandleProps={dragHandleProps}
      />
      <WarpMilestoneRows milestones={milestones} rowKeyPrefix={target.id} />
    </>
  )
})
