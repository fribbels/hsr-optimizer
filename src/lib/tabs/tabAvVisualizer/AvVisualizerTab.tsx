import { ActionIcon, Text, Tooltip } from '@mantine/core'
import { IconTrash, IconX } from '@tabler/icons-react'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getPreviewRelics, getShowcaseStats } from 'lib/characterPreview/characterPreviewController'
import { Stats } from 'lib/constants/constants'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { CharacterSlotCard } from 'lib/tabs/tabAvVisualizer/characterSlotCard/CharacterSlotCard'
import { SLOT_COLORS } from 'lib/tabs/tabAvVisualizer/constants'
import { Timeline, type TimelineCharacter } from 'lib/tabs/tabAvVisualizer/timeline/Timeline'
import type { Intervention } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import { useShallow } from 'zustand/react/shallow'

export function AvVisualizerTab() {
  const slots = useAVVisualTabStore((s) => s.savedSession.slots)
  const rowCount = useAVVisualTabStore((s) => s.rowCount)
  const interventions = useAVVisualTabStore((s) => s.interventions)
  const charactersById = useCharacterStore((s) => s.charactersById)
  const relicsById = useRelicStore(useShallow((s) => s.relicsById))
  const { t } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const { t: tAv } = useTranslation('avVisualizerTab')

  // 为每个槽位计算角色实际速度（baseSpd）
  const baseSpdMap = useMemo(() =>
    slots.map((slot) => {
      if (!slot.characterId) return null
      const character = charactersById[slot.characterId as CharacterId]
      if (!character) return null
      const { displayRelics } = getPreviewRelics(ShowcaseSource.CHARACTER_TAB, character, relicsById, null)
      return getShowcaseStats(character, displayRelics, null)[Stats.SPD] ?? null
    }),
  [slots, charactersById, relicsById])

  // 白值速度：角色基础速度（不含遗器），用于百分比速度 buff 计算
  const whiteSpdMap = useMemo(() =>
    slots.map((slot) => {
      if (!slot.characterId) return null
      return getGameMetadata().characters[slot.characterId as CharacterId]?.stats[Stats.SPD] ?? null
    }),
  [slots])

  // 传给 Timeline 的角色列表：spdOverride 优先，其次 baseSpdMap（面板速度），空槽跳过
  const timelineCharacters = useMemo(() =>
    slots
      .map((slot, i) => {
        if (!slot.characterId) return null
        const effectiveSpd = slot.spdOverride ?? baseSpdMap[i]
        if (!effectiveSpd) return null
        const entry: TimelineCharacter = {
          id: slot.characterId,
          name: t(`${slot.characterId}.Name`),
          spd: effectiveSpd,
          baseSpd: whiteSpdMap[i] ?? effectiveSpd,
          color: SLOT_COLORS[i],
          slotIndex: i,
        }
        return entry
      })
      .filter((c): c is TimelineCharacter => c !== null),
  [slots, baseSpdMap, whiteSpdMap, t])

  // 干预列表条目用的角色名映射（characterId → 显示名）
  const characterNameMap = useMemo(() => {
    const map = new Map<string, string>()
    slots.forEach((slot) => {
      if (slot.characterId) {
        map.set(slot.characterId, t(`${slot.characterId}.Name`))
      }
    })
    return map
  }, [slots, t])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24, width: '100%' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {slots.map((slot, i) => (
            <CharacterSlotCard
              key={i}
              slotIndex={i}
              slot={slot}
              characterName={slot.characterId ? t(`${slot.characterId}.Name`) : null}
              baseSpd={baseSpdMap[i]}
            />
          ))}
        </div>
        <div style={{
          flex: 1,
          alignSelf: 'stretch',
          background: 'var(--layer-1)',
          borderRadius: 6,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* 标题栏 */}
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Text size='xs' fw={600} c='dimmed'>{tAv('Sidebar.Title')}</Text>
            {interventions.length > 0 && (
              <Tooltip label={tAv('Sidebar.ClearAll')} withArrow>
                <ActionIcon
                  variant='subtle'
                  color='gray'
                  size='xs'
                  onClick={AvVisualTabController.clearInterventions}
                >
                  <IconX size={12} />
                </ActionIcon>
              </Tooltip>
            )}
          </div>

          {/* 干预条目 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            {interventions.length === 0 ? (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: 'var(--mantine-color-dimmed)',
                userSelect: 'none',
              }}>
                {tAv('Sidebar.EmptyHint')}
              </div>
            ) : (
              interventions.map((iv) => (
                <InterventionListItem key={iv.id} intervention={iv} characterNames={characterNameMap} />
              ))
            )}
          </div>
        </div>
      </div>

      <Timeline characters={timelineCharacters} interventions={interventions} rowCount={rowCount} />
    </div>
  )
}

function InterventionListItem({
  intervention,
  characterNames,
}: {
  intervention: Intervention
  characterNames: Map<string, string>
}) {
  const { t: tAv } = useTranslation('avVisualizerTab')

  // 字面量 key 调用，避免动态 Record 查找导致 t() 严格联合类型报错
  function typeLabel(type: Intervention['type']): string {
    switch (type) {
      case 'spd_up': return tAv('Types.SpdUp')
      case 'spd_down': return tAv('Types.SpdDown')
      case 'av_advance': return tAv('Types.AvAdvance')
      case 'av_delay': return tAv('Types.AvDelay')
    }
  }

  const unitStr = intervention.unit === 'percent' ? '%' : ''
  const durationStr = intervention.durationTurns > 0 ? tAv('Sidebar.DurationSuffix', { n: intervention.durationTurns }) : ''
  const targetStr = intervention.targets
    .map((id) => characterNames.get(id) ?? id)
    .join('、')

  // 显示该干预绑定的角色与时机（行动期间 / 行动结束瞬间），含第几次行动（>1 次时才标注）
  function buildTimingLabel(charId: string, actionIndex: number | undefined, suffix: string): string {
    const name = characterNames.get(charId) ?? charId
    const idxLabel = actionIndex !== undefined && actionIndex > 0 ? tAv('TurnSuffix', { n: actionIndex + 1 }) : ''
    return `${name}${idxLabel} ${suffix}`
  }
  const timingLabel = intervention.afterCharId
    ? buildTimingLabel(intervention.afterCharId, intervention.afterActionIndex, tAv('Sidebar.TimingAfter'))
    : intervention.beforeCharId
      ? buildTimingLabel(intervention.beforeCharId, intervention.beforeActionIndex, tAv('Sidebar.TimingBefore'))
      : null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 12px',
      fontSize: 11,
      gap: 8,
    }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Text size='xs' c='dimmed' truncate>
          AV {intervention.triggerAv.toFixed(1)}
          {timingLabel ? ` [${timingLabel}]` : ''}
          {' · '}
          {typeLabel(intervention.type)} {intervention.value}{unitStr}{durationStr}
          {' → '}
          {targetStr}
        </Text>
      </div>
      <ActionIcon
        variant='subtle'
        color='gray'
        size='xs'
        onClick={() => AvVisualTabController.removeIntervention(intervention.id)}
      >
        <IconTrash size={11} />
      </ActionIcon>
    </div>
  )
}
