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
  Badge,
  Box,
  Checkbox,
  Group,
  HoverCard,
  Paper,
  Stack,
} from '@mantine/core'
import type { FloatingPosition } from '@mantine/core'
import {
  IconCopy,
  IconTrashFilled,
} from '@tabler/icons-react'
import type { TFunction } from 'i18next'
import { labelToString } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { getAKeyConfig } from 'lib/optimization/engine/config/keys'
import {
  Children,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  PropsWithChildren,
  ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import { CombatBuffType } from 'types/form'
import type {
  CombatBuff,
  CombatStatBuff,
} from 'types/form'
import { optimizerTabDefaultGap } from '../../../grid/optimizerGridColumns'
import { writeBuffToClipboard } from '../clipboard'
import { renderDamageTagPill } from '../DamageTagSelect'
import { renderElementTagPill } from '../ElementTagSelect'
import { renderTargetTagPill } from '../TargetTagSelect'
import classes from './Buff.module.css'
import { CombineIndicator } from './CombineIndicator'
import { DropIndicator } from './DropIndicator'

export function Buff({ buff, parent, toggleSelection, removeBuff }: Buff.Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [operation, setOperation] = useState<Instruction['operation'] | null>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const cleanup = combine(
      draggable({
        element,
        getInitialData: () => ({
          id: buff.id,
          type: buff.type,
          parent,
        }),
      }),
      dropTargetForElements({
        element,
        getIsSticky({ input, element }) {
          if (parent === undefined) return true
          const parentGroup = element.closest<HTMLElement>('[data-buff-group-id]')
          if (!parentGroup) return false
          const bounds = parentGroup.getBoundingClientRect()
          return input.clientX >= bounds.left
            && input.clientX <= bounds.right
            && input.clientY >= bounds.top
            && input.clientY <= bounds.bottom
        },
        getData({ input, source, element }) {
          return attachInstruction(
            { id: buff.id, type: buff.type, parent },
            {
              input,
              element,
              operations: {
                'reorder-before': 'available',
                'reorder-after': 'available',
                'combine': (parent === undefined && source.data.type !== CombatBuffType.Group) ? 'available' : 'not-available',
              },
            },
          )
        },
        canDrop({ source }) {
          return source.data.type !== CombatBuffType.Group || parent === undefined
        },
        onDrag({ self, location }) {
          const isRelevant = location.current.dropTargets[0].element === self.element

          if (!isRelevant) return setOperation(null)

          const instruction = extractInstruction(self.data)
          setOperation(instruction?.operation ?? null)
        },
        onDragLeave() {
          setOperation(null)
        },
        onDrop() {
          setOperation(null)
        },
      }),
    )
    return cleanup
  })
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <DropIndicator gap={optimizerTabDefaultGap} position='upper' active={operation === 'reorder-before'} />
      <CombineIndicator active={operation === 'combine'}>
        <BuffPanel
          buff={buff}
          toggleSelection={toggleSelection}
          removeBuff={removeBuff}
          t={t}
        />
      </CombineIndicator>
      <DropIndicator gap={optimizerTabDefaultGap} position='lower' active={operation === 'reorder-after'} />
    </div>
  )
}

export namespace Buff {
  export type Props = {
    buff: CombatBuff,
    parent?: string,
  } & Pick<BuffPanelProps, 'toggleSelection' | 'removeBuff'>
}

interface BuffPanelContentProps {
  buff: CombatBuff
  t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>
}

interface BuffPanelProps extends BuffPanelContentProps {
  toggleSelection: (id: string) => void
  removeBuff: (key: string) => void
}

export const BuffPanel = memo(function BuffPanel({
  buff,
  removeBuff,
  t,
  toggleSelection,
}: BuffPanelProps) {
  const remove = useCallback(() => removeBuff(buff.id), [removeBuff, buff.id])

  const actionGroup = (
    <Group gap={2}>
      <ActionIcon aria-label='Copy buff' size={30} onClick={() => writeBuffToClipboard(buff)}>
        <IconCopy />
      </ActionIcon>
      <ActionIcon aria-label='Delete buff' onClick={remove} size={30}>
        <IconTrashFilled />
      </ActionIcon>
    </Group>
  )

  const panelContent = useMemo(() => {
    switch (buff.type) {
      case CombatBuffType.StatBuff:
        return <StatBuffPanelContent buff={buff} t={t} actionGroup={actionGroup} />
      case CombatBuffType.ActionModifier:
        return <></>
    }
  }, [buff])

  return (
    <Paper withBorder radius='sm' p={4} shadow='xs'>
      <Group gap='xs' justify='space-between'>
        <Box className={classes.checkboxSlot}>
          <Checkbox mt={7} checked={!buff.disabled} onClick={() => toggleSelection(buff.id)} />
        </Box>
        {panelContent}
      </Group>
    </Paper>
  )
})

interface StatBuffPanelContentProps extends BuffPanelContentProps {
  buff: CombatStatBuff
  actionGroup: ReactNode
}

function StatBuffPanelContent({
  buff,
  t,
  actionGroup,
}: StatBuffPanelContentProps) {
  const { label, flat } = getAKeyConfig(buff.statKey)
  const statLabel = labelToString(label)
  // TODO: refine visuals
  return (
    <Stack flex={1}>
      <Group justify='space-between'>
        <Group ml={5} gap={5}>
          <span>{statLabel}:</span>
          <span>{`${buff.value}${flat ? '' : '%'}`}</span>
        </Group>
        {actionGroup}
      </Group>
      <Group gap={4}>
        {renderTargetTagPill(buff.targetTag, t, true)}
        <TagContainer>
          {buff.damageTags.map((tag) => renderDamageTagPill(tag, t, true))}
        </TagContainer>
        <TagContainer>
          {buff.elementTags.map((tag) => renderElementTagPill(tag, t, true))}
        </TagContainer>
      </Group>
    </Stack>
  )
}

interface TagContainerProps extends PropsWithChildren {
  popoverPosition?: FloatingPosition
}

function TagContainer({ children, popoverPosition }: TagContainerProps) {
  const [first, ...rest] = Children.toArray(children)
  if (!first) return null
  const target = (
    <Group gap={4} wrap='nowrap'>
      {first}

      {rest.length && (
        <Badge
          size='xs'
          variant='light'
          color='gray'
          px={5}
        >
          +{rest.length}
        </Badge>
      )}
    </Group>
  )
  if (!rest.length) return target
  return (
    <HoverCard
      width='max-content'
      position={popoverPosition}
      withArrow
      shadow='md'
    >
      <HoverCard.Target>
        {target}
      </HoverCard.Target>
      <HoverCard.Dropdown p='xs'>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 4,
            justifyItems: 'center',
          }}
        >
          {rest}
        </Box>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}
