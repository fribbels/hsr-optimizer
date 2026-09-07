import {
  ActionIcon,
  Badge,
  Box,
  Checkbox,
  type FloatingPosition,
  Group,
  HoverCard,
  Stack,
  TextInput,
} from '@mantine/core'
import {
  IconCopy,
  IconTrashFilled,
} from '@tabler/icons-react'
import { type TFunction } from 'i18next'
import { labelToString } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import { Message } from 'lib/interactions/message'
import { getAKeyConfig } from 'lib/optimization/engine/config/keys'
import { writeBuffToClipboard } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/clipboard'
import { renderDamageTagPill } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/DamageTagSelect'
import { renderTargetTagPill } from 'lib/tabs/tabOptimizer/optimizerForm/components/combatBuffsDrawer/TargetTagSelect'
import {
  Children,
  memo,
  type PropsWithChildren,
  useCallback,
  useMemo,
} from 'react'
import {
  type CombatBuff,
  CombatBuffType,
  type CombatStatBuff,
} from 'types/form'

interface BuffPanelContentProps {
  id: string
  buff: CombatBuff
  renameBuff: (id: string, name: string) => void
  t: TFunction<'optimizerTab', 'ExpandedDataPanel.DamageTags'>
}

interface BuffPanelProps extends BuffPanelContentProps {
  checked: boolean
  toggleSelection: (id: string) => void
  removeBuff: (key: string) => void
}

export const BuffPanel = memo(function BuffPanel({
  id,
  buff,
  removeBuff,
  renameBuff,
  t,
  checked,
  toggleSelection,
}: BuffPanelProps) {
  const remove = useCallback(() => removeBuff(id), [removeBuff, id])

  const panelContent = useMemo(() => {
    switch (buff.type) {
      case CombatBuffType.StatBuff:
        return <StatBuffPanelContent id={id} buff={buff} renameBuff={renameBuff} t={t} />
      case CombatBuffType.ActionModifier:
        return <></>
    }
  }, [buff, id])

  return (
    <Group gap='xs' justify='space-between' style={{ borderColor: 'red', borderRadius: 4, borderWidth: 1, borderStyle: 'solid', padding: 4 }}>
      <Box
        style={{
          alignSelf: 'stretch',
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <Checkbox mt={7} checked={checked} onClick={() => toggleSelection(id)} />
      </Box>
      {panelContent}
      <Stack gap={2}>
        <ActionIcon aria-label='Copy buff' size={30} onClick={() => writeBuffToClipboard(buff)}>
          <IconCopy />
        </ActionIcon>
        <ActionIcon aria-label='Delete buff' onClick={remove} size={30}>
          <IconTrashFilled />
        </ActionIcon>
      </Stack>
    </Group>
  )
})

interface StatBuffPanelContentProps extends BuffPanelContentProps {
  buff: CombatStatBuff
}

function StatBuffPanelContent({
  id,
  buff,
  renameBuff,
  t,
}: StatBuffPanelContentProps) {
  const { label, flat } = getAKeyConfig(buff.statKey)
  const statLabel = labelToString(label)
  // TODO: refine visuals
  return (
    <Stack flex={1}>
      <TextInput value={buff.name} onChange={(e) => renameBuff(id, e.currentTarget.value)} placeholder='name this buff?' />
      <Group>
        <span>{statLabel}</span>
        <span>{`${buff.value}${flat ? '' : '%'}`}</span>
        {renderTargetTagPill(buff.targetTag, t, true)}
        <TagContainer>
          {buff.damageTags.map((tag) => renderDamageTagPill(tag, t, true))}
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
