import { ActionIcon, Text } from '@mantine/core'
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconPencil, IconTrash } from '@tabler/icons-react'
import type { Intervention, InterventionType } from 'lib/tabs/tabAvVisualizer/types'
import type { ComponentType } from 'react'

type InterventionItemProps = {
  intervention: Intervention
  characters: Array<{ id: string; name: string }>
  highlighted?: boolean
  onEdit: () => void
  onDelete: () => void
}

// 类型 → 图标 + 颜色：上下表示加速/减速，左右表示拉条（更早）/推条（更晚），与时间轴方向一致
const TYPE_VISUAL: Record<InterventionType, { icon: ComponentType<{ size?: number; color?: string }>; color: string }> = {
  spd_up: { icon: IconArrowUp, color: 'var(--mantine-color-teal-5)' },
  spd_down: { icon: IconArrowDown, color: 'var(--mantine-color-red-5)' },
  av_advance: { icon: IconArrowLeft, color: 'var(--mantine-color-blue-5)' },
  av_delay: { icon: IconArrowRight, color: 'var(--mantine-color-orange-5)' },
}

export function InterventionItem({ intervention, characters, highlighted, onEdit, onDelete }: InterventionItemProps) {
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
    }}>
      {/* 类型图标：圆形背景 + 方向箭头 */}
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

      <ActionIcon size='xs' variant='subtle' color='gray' onClick={onEdit}>
        <IconPencil size={11} />
      </ActionIcon>
      <ActionIcon size='xs' variant='subtle' color='red' onClick={onDelete}>
        <IconTrash size={11} />
      </ActionIcon>
    </div>
  )
}
