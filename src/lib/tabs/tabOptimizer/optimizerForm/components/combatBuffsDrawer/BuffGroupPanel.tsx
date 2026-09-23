import { CollisionPriority } from '@dnd-kit/abstract'
import { useSortable } from '@dnd-kit/react/sortable'
import {
  ActionIcon,
  Box,
  Checkbox,
  Group,
  Stack,
  TextInput,
} from '@mantine/core'
import {
  useDisclosure,
  useElementSize,
} from '@mantine/hooks'
import {
  IconCopy,
  IconTrashFilled,
} from '@tabler/icons-react'
import { type TFunction } from 'i18next'
import { BuffPanel } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/BuffPanel'
import { writeBuffToClipboard } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/clipboard'
import {
  memo,
  useCallback,
} from 'react'
import {
  type CombatBuffGroup,
  type CombatStatBuff,
} from 'types/form'
import { optimizerTabDefaultGap } from '../../grid/optimizerGridColumns'
import { DragHandle } from './DragHandle'

interface BuffGroupPanelProps {
  group: CombatBuffGroup
  removeBuff: (key: string) => void
  renameBuff: (id: string, name: string) => void
  t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>
  checked: boolean
  toggleSelection: (id: string) => void
  index: number
}
export const BuffGroupPanel = memo(function BuffGroupPanel({
  group,
  removeBuff,
  renameBuff,
  t,
  checked,
  toggleSelection,
  index,
}: BuffGroupPanelProps) {
  const remove = useCallback(() => removeBuff(group.id), [removeBuff, group.id])
  const copyClicked = useCallback(() => writeBuffToClipboard(group), [group])
  const [isOpen, { toggle }] = useDisclosure(false)
  const { ref, handleRef } = useSortable({
    id: group.id,
    index,
    group: 'root',
    type: 'group',
    accept: ['buff', 'group'],
    collisionPriority: CollisionPriority.Low,
  })
  return (
    <Stack
      style={{ borderColor: 'red', borderRadius: 4, borderWidth: 1, borderStyle: 'solid', padding: 4 }}
      ref={ref}
    >
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
        <Box
          onClick={toggle}
          style={{
            alignSelf: 'stretch',
            display: 'flex',
            cursor: 'pointer',
          }}
        >
          <Group gap='xs'>
            <DragHandle
              ref={handleRef}
              onClick={toggle}
            />
            <Checkbox
              checked={checked}
              onClick={(e) => {
                e.stopPropagation()
                toggleSelection(group.id)
              }}
            />
          </Group>
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
  )
})

const heightTransition = 'height 200ms cubic-bezier(0.4, 0, 0.2, 1)'
const opacityTransition = 'opacity 200ms ease-out'

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
  const { ref: fallbackRef, height: fallbackHeight } = useElementSize()
  const { ref: panelsRef, height: panelsHeight } = useElementSize()
  const { ref: previewRef, height: previewHeight } = useElementSize()
  const height = !group.buffs.length
    ? fallbackHeight
    : (isOpen
      ? panelsHeight
      : previewHeight)
  return (
    <div style={{ height, transition: heightTransition }}>
      <Stack
        ref={fallbackRef}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderStyle: 'dashed',
          borderColor: '#afafaf',
          borderWidth: 2,
          position: 'absolute',
          visibility: group.buffs.length === 0 ? 'visible' : 'hidden',
          opacity: group.buffs.length === 0 ? 1 : 0,
          transition: opacityTransition,
          width: 300,
        }}
      >
        drop buffs here
      </Stack>
      <Stack
        ref={panelsRef}
        gap={optimizerTabDefaultGap}
        style={{
          position: 'absolute',
          visibility: group.buffs.length && isOpen ? 'visible' : 'hidden',
          opacity: group.buffs.length && isOpen ? 1 : 0,
          transition: opacityTransition,
          width: 300,
        }}
      >
        {group.buffs.map((buff, idx) => {
          return (
            <BuffPanel
              key={buff.id}
              t={t}
              removeBuff={removeBuff}
              buff={buff}
              toggleSelection={toggleSelection}
              checked={!buff.disabled}
              index={idx}
              group={group.id}
            />
          )
        })}
      </Stack>
      <div
        style={{
          position: 'absolute',
          visibility: group.buffs.length && !isOpen ? 'visible' : 'hidden',
          opacity: group.buffs.length && !isOpen ? 1 : 0,
          transition: opacityTransition,
        }}
        ref={previewRef}
      >
        <BuffGroupPreview group={group} />
      </div>
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
// general idea, 1 line scrolling container containing the preview pills
// stat pill preview is stat + value
// modifier preview is targeted action + multiplier scaling + multiplier stat

// maybe stats can have a pill to render them more densely?

const StatBuffPreviewPill = memo(function StatBuffPreviewPill(buff: CombatStatBuff) {
})

function ActionModifierPreviewPill() {}
