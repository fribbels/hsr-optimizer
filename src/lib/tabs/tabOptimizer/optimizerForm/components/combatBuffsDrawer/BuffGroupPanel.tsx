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
  useResizeObserver,
} from '@mantine/hooks'
import {
  IconCopy,
  IconTrashFilled,
} from '@tabler/icons-react'
import { type TFunction } from 'i18next'
import { BuffPanel } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/BuffPanel'
import { writeBuffToClipboard } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/clipboard'
import { useCombatBuffStore } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/useCombatBuffsStore'
import {
  memo,
  useCallback,
} from 'react'
import {
  type CombatBuff,
  type CombatBuffGroup,
  type CombatStatBuff,
} from 'types/form'
import { optimizerTabDefaultGap } from '../../grid/optimizerGridColumns'

interface BuffGroupPanelProps {
  id: string
  group: CombatBuffGroup
  buffs: Map<string, CombatBuff>
  removeBuff: (key: string) => void
  renameBuff: (id: string, name: string) => void
  t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>
  checked: boolean
  toggleSelection: (id: string) => void
}
export const BuffGroupPanel = memo(function BuffGroupPanel({
  id,
  group,
  buffs,
  removeBuff,
  renameBuff,
  t,
  checked,
  toggleSelection,
}: BuffGroupPanelProps) {
  const remove = useCallback(() => removeBuff(id), [removeBuff, id])
  const copyClicked = useCallback(() => writeBuffToClipboard(group, buffs), [group])
  const [isOpen, { toggle }] = useDisclosure(false)
  return (
    <Group
      gap='xs'
      justify='space-between'
      style={{ borderColor: 'red', borderRadius: 4, borderWidth: 1, borderStyle: 'solid', padding: 4 }}
    >
      <Box
        onClick={toggle}
        style={{
          alignSelf: 'stretch',
          display: 'flex',
          alignItems: 'flex-start',
          cursor: 'pointer',
        }}
      >
        <Checkbox
          mt={7}
          checked={checked}
          onClick={(e) => {
            e.stopPropagation()
            toggleSelection(id)
          }}
        />
      </Box>
      <Stack flex={1}>
        <TextInput value={group.name} onChange={(e) => renameBuff(id, e.currentTarget.value)} placeholder='name this group?' />
        <BuffGroupContent
          group={group}
          isOpen={isOpen}
          buffs={buffs}
          t={t}
          renameBuff={renameBuff}
          removeBuff={removeBuff}
          toggleSelection={toggleSelection}
        />
      </Stack>
      <Stack gap={2} style={{ alignSelf: 'flex-start' }}>
        <ActionIcon aria-label='Copy group' size={30} onClick={copyClicked}>
          <IconCopy />
        </ActionIcon>
        <ActionIcon aria-label='Delete group' onClick={remove} size={30}>
          <IconTrashFilled />
        </ActionIcon>
      </Stack>
    </Group>
  )
})

const heightTransition = 'height 200ms cubic-bezier(0.4, 0, 0.2, 1)'
const opacityTransition = 'opacity 100ms ease-out'

interface BuffGroupContentProps {
  isOpen: boolean
  group: CombatBuffGroup
  buffs: ReadonlyMap<string, CombatBuff>
  removeBuff: (key: string) => void
  renameBuff: (id: string, name: string) => void
  t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>
  toggleSelection: (id: string) => void
}
function BuffGroupContent({
  isOpen,
  group,
  buffs,
  removeBuff,
  renameBuff,
  t,
  toggleSelection,
}: BuffGroupContentProps) {
  const [previewRef, previewRect] = useResizeObserver()
  const [panelsRef, panelsRect] = useResizeObserver()

  const preview = (
    <BuffGroupPreview
      buffs={buffs}
      group={group}
    />
  )

  const panels = (
    <Stack gap={optimizerTabDefaultGap}>
      {group.buffs.map((id) => {
        const buff = buffs.get(id)!
        return (
          <BuffPanel
            key={id}
            id={id}
            t={t}
            renameBuff={renameBuff}
            removeBuff={removeBuff}
            buff={buff}
            toggleSelection={toggleSelection}
            checked={!buff.disabled}
          />
        )
      })}
    </Stack>
  )

  const height = isOpen ? panelsRect.height : previewRect.height

  return (
    <div style={{ position: 'relative' }}>
      {/* Invisible measurement layer */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <div ref={previewRef}>{preview}</div>
        <div ref={panelsRef}>{panels}</div>
      </div>

      {/* Visible animated layer */}
      <div
        style={{
          height,
          display: 'grid',
          overflow: 'hidden',
          transition: heightTransition,
        }}
      >
        <div
          style={{
            gridArea: '1 / 1',
            opacity: isOpen ? 0 : 1,
            pointerEvents: isOpen ? 'none' : 'auto',
            transition: opacityTransition,
          }}
        >
          {preview}
        </div>

        <div
          style={{
            gridArea: '1 / 1',
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
            transition: opacityTransition,
          }}
        >
          {panels}
        </div>
      </div>
    </div>
  )
}

// TODO: implement
interface PreviewProps {
  group: CombatBuffGroup
  buffs: ReadonlyMap<string, CombatBuff>
}
function BuffGroupPreview({
  group,
  buffs,
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
