import { ActionIcon, Text } from '@mantine/core'
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconBolt, IconCircleMinus, IconCirclePlus, IconLayoutGridAdd, IconLayoutGridRemove, IconMinus, IconPencil, IconPlus, IconStar, IconTrash, IconTrendingUp, IconUserPlus, IconX } from '@tabler/icons-react'
import type { Intervention, InterventionType } from 'lib/tabs/tabAvVisualizer/types'
import type { ComponentType } from 'react'

type InterventionItemProps = {
  intervention: Intervention
  characters: Array<{ id: string; name: string }>
  highlighted?: boolean
  onEdit: () => void
  onDelete: () => void
  readOnly?: boolean   // observe mode: hides the edit/delete icons
}

// Type → icon + color: up/down represent speed up/down, left/right represent advance (earlier) / delay (later),
// matching the timeline's left-to-right direction
const TYPE_VISUAL: Record<InterventionType, { icon: ComponentType<{ size?: number; color?: string }>; color: string }> = {
  spd_up:       { icon: IconArrowUp,    color: 'var(--mantine-color-teal-5)' },
  spd_down:     { icon: IconArrowDown,  color: 'var(--mantine-color-red-5)' },
  av_advance:   { icon: IconArrowLeft,  color: 'var(--mantine-color-blue-5)' },
  av_delay:     { icon: IconArrowRight, color: 'var(--mantine-color-orange-5)' },
  energy_gain:  { icon: IconPlus,              color: 'var(--mantine-color-yellow-5)' },
  energy_loss:  { icon: IconMinus,             color: 'var(--mantine-color-orange-7)' },
  sp_gain:      { icon: IconCirclePlus,        color: 'var(--mantine-color-cyan-5)' },
  sp_loss:      { icon: IconCircleMinus,       color: 'var(--mantine-color-red-4)' },
  sp_cap_up:    { icon: IconLayoutGridAdd,     color: 'var(--mantine-color-indigo-4)' },
  sp_cap_down:  { icon: IconLayoutGridRemove,  color: 'var(--mantine-color-orange-6)' },
  stat_buff:    { icon: IconStar,              color: 'var(--mantine-color-violet-5)' },
  stat_debuff:  { icon: IconBolt,              color: 'var(--mantine-color-pink-5)' },
  // Config-only — never user-addable as a manual Intervention, but Record<InterventionType, ...> needs
  // an entry for type completeness.
  summon_companion: { icon: IconUserPlus,      color: 'var(--mantine-color-grape-5)' },
  energy_set_minimum: { icon: IconTrendingUp,  color: 'var(--mantine-color-yellow-7)' },
  clear_buff:   { icon: IconX,                 color: 'var(--mantine-color-gray-5)' },
}

export function InterventionItem({ intervention, characters, highlighted, onEdit, onDelete, readOnly }: InterventionItemProps) {
  const { icon: Icon, color } = TYPE_VISUAL[intervention.type]
  const unitStr = intervention.unit === 'percent' ? '%' : ''
  const targetStr = intervention.targets
    .map((id) => characters.find((c) => c.id === id)?.name ?? id)
    .join('、')

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 6px',
      borderRadius: 4,
      background: highlighted ? 'var(--mantine-color-dark-5)' : undefined,
      border: `1px solid ${highlighted ? 'var(--mantine-color-blue-5)' : 'transparent'}`,
    }}>
      {/* Type icon: circular background + directional arrow */}
      <div style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        flexShrink: 0,
        backgroundColor: `${color}26`,
        border: `1.5px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={12} color={color} />
      </div>

      <Text size='xs' fw={600} style={{ flexShrink: 0 }}>
        {intervention.value}{unitStr}
      </Text>

      {intervention.durationTurns > 0 && (
        <Text size='xs' c='dimmed' style={{ flexShrink: 0 }}>
          ×{intervention.durationTurns}
        </Text>
      )}

      <Text size='xs' c='dimmed' truncate style={{ flex: 1 }}>
        → {targetStr}
      </Text>

      {!readOnly && (
        <>
          <ActionIcon size='xs' variant='subtle' color='gray' onClick={onEdit}>
            <IconPencil size={11} />
          </ActionIcon>
          <ActionIcon size='xs' variant='subtle' color='red' onClick={onDelete}>
            <IconTrash size={11} />
          </ActionIcon>
        </>
      )}
    </div>
  )
}
