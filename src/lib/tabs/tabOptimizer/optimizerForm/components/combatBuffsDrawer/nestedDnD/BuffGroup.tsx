import { attachInstruction, extractInstruction, Instruction } from "@atlaskit/pragmatic-drag-and-drop-hitbox/list-item"
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { combine } from '@atlaskit/pragmatic-drag-and-drop/utils/combine'
import { ViewTransition, Fragment, memo, useCallback, useEffect, useRef, useState } from "react"
import { CombatBuffGroup, CombatBuffType, CombatStatBuff } from "types/form"
import { DropIndicator } from "./DropIndicator"
import { optimizerTabDefaultGap } from "../../../grid/optimizerGridColumns"
import { useTranslation } from "react-i18next"
import { Stack, Group, TextInput, ActionIcon, Box, Checkbox, Space } from "@mantine/core"
import { useDisclosure, useElementSize } from "@mantine/hooks"
import { IconCopy, IconTrashFilled } from "@tabler/icons-react"
import { TFunction } from "i18next"
import { writeBuffToClipboard } from "../clipboard"
import { Buff } from "./Buff"

export function BuffGroup({ buff, removeBuff, renameBuff, toggleSelection }: BuffGroup.Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [operation, setOperation] = useState<Instruction['operation'] | null>(null)
  const { id, type } = buff
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const cleanup = combine(
      draggable({
        element,
        getInitialData: () => ({
          id,
          type
        }),
      }),
      dropTargetForElements({
        element,
        getData({ source, input, element }) {
          return attachInstruction(
            { id, type },
            {
              input,
              element,
              operations: {
                'reorder-before': 'available',
                'reorder-after': 'available',
                'combine': source.data.type === CombatBuffType.Group ? 'not-available' : 'available',
              }
            }
          )
        },
        canDrop({ source }) {
          return source.data.type !== CombatBuffType.Group
        },
        onDrag({ self, location }) {
          const isRelevant = location.current.dropTargets[0].element === self.element

          if (!isRelevant) return setOperation(null)

          const instruction = extractInstruction(self.data)
          setOperation(instruction?.operation ?? null)
        },
        onDragLeave() { setOperation(null) },
        onDrop() { setOperation(null) }
      }),
    )
    return cleanup
  })
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })
  return (
    <div ref={ref}>
      <DropIndicator gap={optimizerTabDefaultGap} position='upper' active={operation === 'reorder-before'} />
      <BuffGroupPanel
        group={buff}
        removeBuff={removeBuff}
        renameBuff={renameBuff}
        toggleSelection={toggleSelection}
        t={t}
      />
      <DropIndicator gap={optimizerTabDefaultGap} position='lower' active={operation === 'reorder-after'} />
    </div>
  )
}

export namespace BuffGroup {
  export type Props = {
    buff: CombatBuffGroup
  } & Pick<BuffGroupPanelProps, 'removeBuff' | 'renameBuff' | 'toggleSelection'>
}

interface BuffGroupPanelProps {
  group: CombatBuffGroup
  removeBuff: (key: string) => void
  renameBuff: (id: string, name: string) => void
  t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>
  toggleSelection: (id: string) => void
}
export const BuffGroupPanel = memo(function BuffGroupPanel({
  group,
  removeBuff,
  renameBuff,
  t,
  toggleSelection,
}: BuffGroupPanelProps) {
  const remove = useCallback(() => removeBuff(group.id), [removeBuff, group.id])
  const copyClicked = useCallback(() => writeBuffToClipboard(group), [group])
  const [isOpen, { toggle }] = useDisclosure(false)
  return (
    <Stack
      style={{ borderColor: 'red', borderRadius: 4, borderWidth: 1, borderStyle: 'solid', padding: 4 }}
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
            <Checkbox
              checked={!group.disabled}
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
    <div style={{ height }}>
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
          width: 300,
        }}
      >
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
      <div
        style={{
          position: 'absolute',
          visibility: group.buffs.length && !isOpen ? 'visible' : 'hidden',
          opacity: group.buffs.length && !isOpen ? 1 : 0,
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

function ActionModifierPreviewPill() { }