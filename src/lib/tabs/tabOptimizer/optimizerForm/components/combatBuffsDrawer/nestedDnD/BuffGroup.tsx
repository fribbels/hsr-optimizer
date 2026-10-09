import {
  attachInstruction,
  extractInstruction,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item'
import type { Instruction } from '@atlaskit/pragmatic-drag-and-drop-hitbox/list-item'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/utils/combine'
import {
  ActionIcon,
  Box,
  Checkbox,
  Collapse,
  Group,
  Paper,
  Stack,
  TextInput,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconCopy,
  IconTrashFilled,
} from '@tabler/icons-react'
import type { TFunction } from 'i18next'
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  ViewTransition,
} from 'react'
import { useTranslation } from 'react-i18next'
import { CombatBuffType } from 'types/form'
import type { CombatBuffGroup } from 'types/form'
import { optimizerTabDefaultGap } from '../../../grid/optimizerGridColumns'
import { writeBuffToClipboard } from '../clipboard'
import { Buff } from './Buff'
import classes from './BuffGroup.module.css'
import { CombineIndicator } from './CombineIndicator'
import { DropIndicator } from './DropIndicator'

export function BuffGroup({ buff, removeBuff, renameBuff, toggleSelection }: BuffGroup.Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [operation, setOperation] = useState<Instruction['operation'] | null>(null)
  const [isOpen, { open, toggle }] = useDisclosure(false)
  const combineHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastInstruction = useRef<Instruction | null>(null)
  const { id, type } = buff
  const clearCombineHoverTimer = useCallback(() => {
    if (combineHoverTimer.current !== null) {
      clearTimeout(combineHoverTimer.current)
      combineHoverTimer.current = null
    }
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const cleanup = combine(
      draggable({
        element,
        getInitialData: () => ({
          id,
          type,
        }),
      }),
      dropTargetForElements({
        element,
        getData({ source, input, element }) {
          const data = attachInstruction(
            { id, type },
            {
              input,
              element,
              operations: {
                'reorder-before': 'available',
                'reorder-after': 'available',
                'combine': source.data.type === CombatBuffType.Group ? 'not-available' : 'available',
              },
            },
          )
          lastInstruction.current = extractInstruction(data)
          return data
        },
        getIsSticky({ input, element }) {
          const bounds = element.getBoundingClientRect()
          const instruction = lastInstruction.current
          return (instruction?.operation === 'reorder-before' && input.clientY <= bounds.top)
            || (instruction?.operation === 'reorder-after' && input.clientY >= bounds.bottom)
        },
        canDrop({ source }) {
          return source.data.type !== CombatBuffType.Group
        },
        onDrag({ self, location }) {
          const isRelevant = location.current.dropTargets[0].element === self.element

          if (!isRelevant) {
            clearCombineHoverTimer()
            return setOperation(null)
          }

          const instruction = extractInstruction(self.data)
          const nextOperation = instruction?.operation ?? null
          setOperation(nextOperation)

          if (nextOperation === 'combine') {
            if (combineHoverTimer.current === null) {
              combineHoverTimer.current = setTimeout(() => {
                combineHoverTimer.current = null
                open()
              }, 400)
            }
          } else {
            clearCombineHoverTimer()
          }
        },
        onDragLeave() {
          clearCombineHoverTimer()
          setOperation(null)
        },
        onDrop() {
          clearCombineHoverTimer()
          setOperation(null)
        },
      }),
    )
    return () => {
      cleanup()
      clearCombineHoverTimer()
    }
  }, [clearCombineHoverTimer, id, open, type])
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })
  return (
    <div ref={ref} className={classes.dropTarget} data-buff-group-id={id}>
      <DropIndicator gap={optimizerTabDefaultGap} position='upper' active={operation === 'reorder-before'} />
      <CombineIndicator active={operation === 'combine'}>
        <BuffGroupPanel
          group={buff}
          removeBuff={removeBuff}
          renameBuff={renameBuff}
          toggleSelection={toggleSelection}
          t={t}
          isOpen={isOpen}
          toggleOpen={toggle}
        />
      </CombineIndicator>
      <DropIndicator gap={optimizerTabDefaultGap} position='lower' active={operation === 'reorder-after'} />
    </div>
  )
}

export namespace BuffGroup {
  export type Props = {
    buff: CombatBuffGroup,
  } & Pick<BuffGroupPanelProps, 'removeBuff' | 'renameBuff' | 'toggleSelection'>
}

interface BuffGroupPanelProps {
  group: CombatBuffGroup
  isOpen: boolean
  toggleOpen: () => void
  removeBuff: (key: string) => void
  renameBuff: (id: string, name: string) => void
  t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>
  toggleSelection: (id: string) => void
}
export const BuffGroupPanel = memo(function BuffGroupPanel({
  group,
  isOpen,
  toggleOpen,
  removeBuff,
  renameBuff,
  t,
  toggleSelection,
}: BuffGroupPanelProps) {
  const remove = useCallback(() => removeBuff(group.id), [removeBuff, group.id])
  const copyClicked = useCallback(() => writeBuffToClipboard(group), [group])
  return (
    <Paper withBorder radius='sm' p={4} shadow='xs'>
      <Stack>
        <Group>
          <TextInput
            flex={1}
            value={group.name}
            onChange={(e) => renameBuff(group.id, e.currentTarget.value)}
            placeholder='name this group?'
          />
          <Group gap='2'>
            <ActionIcon aria-label='Copy group' size={30} onClick={copyClicked}>
              <IconCopy />
            </ActionIcon>
            <ActionIcon aria-label='Delete group' onClick={remove} size={30}>
              <IconTrashFilled />
            </ActionIcon>
          </Group>
        </Group>
        <Group>
          <Box className={classes.collapseToggle} onClick={toggleOpen}>
            <Checkbox
              checked={!group.disabled}
              onClick={(e) => {
                e.stopPropagation()
                toggleSelection(group.id)
              }}
            />
          </Box>
          <BuffGroupContent
            group={group}
            isOpen={isOpen}
            t={t}
            removeBuff={removeBuff}
            toggleSelection={toggleSelection}
          />
        </Group>
      </Stack>
    </Paper>
  )
})

interface BuffGroupContentProps {
  isOpen: boolean
  group: CombatBuffGroup
  removeBuff: (key: string) => void
  t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>
  toggleSelection: (id: string) => void
}
function BuffGroupContent({
  isOpen,
  group,
  removeBuff,
  t,
  toggleSelection,
}: BuffGroupContentProps) {
  if (!group.buffs.length) {
    return (
      <Paper className={classes.emptyDropHint} radius='sm'>
        drop buffs here
      </Paper>
    )
  }

  return (
    <div className={classes.groupContent}>
      {!isOpen && (
        <div className={classes.groupPreview}>
          <BuffGroupPreview group={group} />
        </div>
      )}
      <Collapse
        expanded={isOpen}
        keepMounted={false}
        transitionDuration={200}
        animateOpacity={false}
        className={classes.collapseLayer}
      >
        <Stack gap={optimizerTabDefaultGap}>
          {group.buffs.map((buff) => {
            return (
              <ViewTransition key={buff.id} name={`buff-${buff.id}`}>
                <Buff
                  key={buff.id}
                  removeBuff={removeBuff}
                  buff={buff}
                  toggleSelection={toggleSelection}
                  parent={group.id}
                />
              </ViewTransition>
            )
          })}
        </Stack>
      </Collapse>
    </div>
  )
}

// TODO: implement
interface PreviewProps {
  group: CombatBuffGroup
}
function BuffGroupPreview({
  group,
}: PreviewProps) {
  return <span>{group.buffs.length} buffs</span>
}
