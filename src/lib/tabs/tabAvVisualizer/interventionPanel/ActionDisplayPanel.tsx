import { ActionIcon, Button, NumberInput, ScrollArea, Stack, Text, Tooltip } from '@mantine/core'
import { IconBolt, IconCheck, IconChevronRight, IconListDetails, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import { ActionOrderAvatar } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionOrderAvatar'
import { InterventionItem } from 'lib/tabs/tabAvVisualizer/interventionPanel/InterventionItem'
import type { ActionChoice, CharacterBattleState, Intervention, RightPanelContext, TurnKind } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { Fragment, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

type ActionEvent = {
  av: number
  characterId: string
  characterName: string
  color: string
  actionIndex: number
  turnKind: TurnKind
  actionChoice: ActionChoice | 'ult'
  stateBefore: Record<string, CharacterBattleState>
  currentTargets?: string[]
  ultInsertionId?: string
}

type ActionDisplayPanelProps = {
  characters: Array<{ id: string; name: string; color: string }>
  simEvents: ActionEvent[]
  activeContext: RightPanelContext
  onContextChange: (ctx: RightPanelContext) => void
}

function addZoneKey(beforeCharId?: string, beforeActionIndex?: number, afterCharId?: string, afterActionIndex?: number): string {
  if (beforeCharId) return `before:${beforeCharId}:${beforeActionIndex ?? 0}`
  if (afterCharId) return `after:${afterCharId}:${afterActionIndex ?? 0}`
  return 'flat'
}

export function ActionDisplayPanel({ characters, simEvents, activeContext, onContextChange }: ActionDisplayPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const playheadAv = useAVVisualTabStore((s) => s.playheadAv)

  // Highlight state derived from active context
  const editingId = activeContext.kind === 'intervention' && activeContext.request.mode === 'edit'
    ? activeContext.request.intervention.id
    : null
  const activeAddKey = activeContext.kind === 'intervention' && activeContext.request.mode === 'add'
    ? addZoneKey(activeContext.request.beforeCharId, activeContext.request.beforeActionIndex, activeContext.request.afterCharId, activeContext.request.afterActionIndex)
    : activeContext.kind === 'add-branch'
      ? (activeContext.afterUltId
        ? `after-ult:${activeContext.afterUltId}`
        : addZoneKey(activeContext.beforeCharId, activeContext.beforeActionIndex, activeContext.afterCharId, activeContext.afterActionIndex))
      : null
  const activeActionConfig = activeContext.kind === 'action-config'
    ? `${activeContext.characterId}:${activeContext.actionIndex}`
    : null
  const activeCharTurnKey = activeContext.kind === 'character-state'
    ? `${activeContext.characterId}:${activeContext.actionIndex ?? ''}:${activeContext.turnKind ?? ''}`
    : null

  // ---- AV mini-editor ----
  const [avEditing, setAvEditing] = useState(false)
  const [avEditValue, setAvEditValue] = useState(playheadAv)

  function confirmAvEdit() {
    AvVisualTabController.setPlayheadAv(avEditValue)
    setAvEditing(false)
  }

  const allInterventions = useAVVisualTabStore((s) => s.savedSession.interventions)
  const allUltInsertions = useAVVisualTabStore((s) => s.savedSession.ultInsertions)
  const currentInterventions = useMemo(
    () => allInterventions.filter((iv) => iv.triggerAv === playheadAv),
    [allInterventions, playheadAv],
  )

  const actionsAtAv = useMemo(
    () => simEvents.filter((e) => Math.abs(e.av - playheadAv) < 0.005),
    [simEvents, playheadAv],
  )

  const normalActionsAtAv = useMemo(() => actionsAtAv.filter((e) => e.turnKind !== 'ult'), [actionsAtAv])
  const ultActionsAtAv    = useMemo(() => actionsAtAv.filter((e) => e.turnKind === 'ult'),  [actionsAtAv])

  const actionCountPerChar = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of normalActionsAtAv) map.set(e.characterId, (map.get(e.characterId) ?? 0) + 1)
    return map
  }, [normalActionsAtAv])

  const isStructured = normalActionsAtAv.length > 0

  const afterMap = useMemo(() => {
    const map = new Map<string, Intervention[]>()
    for (const iv of currentInterventions) {
      if (!iv.afterCharId) continue
      const key = `${iv.afterCharId}:${iv.afterActionIndex ?? 0}`
      map.set(key, [...(map.get(key) ?? []), iv])
    }
    return map
  }, [currentInterventions])

  const beforeMap = useMemo(() => {
    const map = new Map<string, Intervention[]>()
    for (const iv of currentInterventions) {
      if (!iv.beforeCharId) continue
      const key = `${iv.beforeCharId}:${iv.beforeActionIndex ?? 0}`
      map.set(key, [...(map.get(key) ?? []), iv])
    }
    return map
  }, [currentInterventions])

  function renderItem(iv: Intervention) {
    return (
      <InterventionItem
        key={iv.id}
        intervention={iv}
        characters={characters}
        highlighted={editingId === iv.id}
        onEdit={() => onContextChange({ kind: 'intervention', request: { mode: 'edit', intervention: iv } })}
        onDelete={() => AvVisualTabController.removeIntervention(iv.id)}
      />
    )
  }

  function renderAddButton(onClick: () => void, zoneKey: string) {
    const isActive = zoneKey === activeAddKey
    return (
      <Button
        variant={isActive ? 'filled' : 'default'}
        color={isActive ? 'blue' : undefined}
        size='xs'
        onClick={onClick}
        fullWidth
        styles={{ root: { height: 26, paddingInline: 0 } }}
      >
        <IconPlus size={14} />
      </Button>
    )
  }

  function renderBehaviorRow(ev: ActionEvent) {
    const config = getBattleConfig(ev.characterId)
    const hasSkill = (config?.abilities.skill.length ?? 0) > 0
    const choiceKey = ev.actionChoice === 'ult' ? 'ActionNode.Basic' : ev.actionChoice === 'skill' ? 'ActionNode.Skill' : 'ActionNode.Basic'
    const targetName = ev.actionChoice === 'skill' && ev.currentTargets?.[0]
      ? (characters.find((c) => c.id === ev.currentTargets![0])?.name ?? ev.currentTargets[0])
      : null
    const isActive = activeActionConfig === `${ev.characterId}:${ev.actionIndex}`

    return (
      <div
        onClick={hasSkill ? () => onContextChange({ kind: 'action-config', characterId: ev.characterId, actionIndex: ev.actionIndex }) : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 8px', borderRadius: 4,
          cursor: hasSkill ? 'pointer' : 'default',
          background: isActive ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-dark-7)',
          border: `1px solid ${isActive ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dark-5)'}`,
        }}
      >
        <Text size='xs' fw={600}>{tAv(choiceKey as 'ActionNode.Basic' | 'ActionNode.Skill')}</Text>
        {targetName && (
          <Text size='xs' c='dimmed'>→ {targetName}</Text>
        )}
        {hasSkill && (
          <IconChevronRight size={12} color='var(--mantine-color-dimmed)' style={{ marginLeft: 'auto' }} />
        )}
      </div>
    )
  }

  function renderUltCard(ev: ActionEvent) {
    const isUltActive = activeCharTurnKey === `${ev.characterId}:${ev.actionIndex}:${ev.turnKind}`
    const isEffectsActive = activeContext.kind === 'ult-effects' && activeContext.casterId === ev.characterId
    return (
      <div
        key={`ult:${ev.characterId}:${ev.av}`}
        style={{
          border: `1.5px solid ${isUltActive ? 'var(--mantine-color-yellow-4)' : 'gold'}`,
          background: isUltActive ? 'rgba(255,215,0,0.08)' : 'transparent',
          borderRadius: 6, padding: '6px 8px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <Tooltip label={tAv('UltCard.Effects')} position='top' withinPortal>
          <ActionIcon
            size='xs'
            variant={isEffectsActive ? 'filled' : 'subtle'}
            color={isEffectsActive ? 'yellow' : 'gray'}
            onClick={() => onContextChange({ kind: 'ult-effects', casterId: ev.characterId, targets: ev.currentTargets })}
          >
            <IconListDetails size={12} />
          </ActionIcon>
        </Tooltip>
        <Text
          size='xs' fw={700} style={{ color: ev.color, flex: 1, cursor: 'pointer' }}
          onClick={() => onContextChange({ kind: 'character-state', characterId: ev.characterId, actionIndex: ev.actionIndex, turnKind: ev.turnKind, stateSnapshot: ev.stateBefore[ev.characterId] })}
        >
          {ev.characterName}
        </Text>
        {ev.ultInsertionId && (
          <ActionIcon
            size='xs'
            variant='subtle'
            color='gray'
            onClick={() => AvVisualTabController.removeUltInsertion(ev.ultInsertionId!)}
          >
            <IconTrash size={12} />
          </ActionIcon>
        )}
      </div>
    )
  }

  function renderList() {
    if (!isStructured) {
      return (
        <Stack gap='sm'>
          {ultActionsAtAv.map((ev) => {
            const ref = allUltInsertions.find((u) => u.id === ev.ultInsertionId)
            return (
              <Fragment key={`ult-wrap:${ev.characterId}:${ev.av}:${ev.actionIndex}`}>
                {renderUltCard(ev)}
                {ev.ultInsertionId && renderAddButton(
                  () => onContextChange({ kind: 'add-branch', triggerAv: playheadAv, afterUltId: ev.ultInsertionId, ultTimingReference: ref?.timing }),
                  `after-ult:${ev.ultInsertionId}`,
                )}
              </Fragment>
            )
          })}
          {currentInterventions.length > 0 && (
            <Stack gap={2}>{currentInterventions.map(renderItem)}</Stack>
          )}
          {renderAddButton(() => onContextChange({ kind: 'add-branch', triggerAv: playheadAv }), 'flat')}
        </Stack>
      )
    }

    return (
      <Stack gap='sm'>
        {actionsAtAv.map((ev) => {
          // Ult events: card + add button below (no before/after within the ult)
          if (ev.turnKind === 'ult') {
            const ref = allUltInsertions.find((u) => u.id === ev.ultInsertionId)
            return (
              <Fragment key={`ult:${ev.characterId}:${ev.av}`}>
                {renderUltCard(ev)}
                {ev.ultInsertionId && (
                  <div style={{ paddingLeft: 8, paddingRight: 8 }}>
                    {renderAddButton(
                      () => onContextChange({ kind: 'add-branch', triggerAv: playheadAv, afterUltId: ev.ultInsertionId, ultTimingReference: ref?.timing }),
                      `after-ult:${ev.ultInsertionId}`,
                    )}
                  </div>
                )}
              </Fragment>
            )
          }

          const totalForChar = actionCountPerChar.get(ev.characterId) ?? 1
          const showIndex = totalForChar > 1
          const beforeIvs = beforeMap.get(`${ev.characterId}:${ev.actionIndex}`) ?? []
          const afterIvs = afterMap.get(`${ev.characterId}:${ev.actionIndex}`) ?? []
          const isCharActive = activeCharTurnKey === `${ev.characterId}:${ev.actionIndex}:${ev.turnKind}`

          return (
            <Fragment key={`${ev.characterId}:${ev.actionIndex}`}>
              <div style={{
                border: `1px solid ${isCharActive ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dark-4)'}`,
                borderRadius: 6, padding: '6px 8px',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                {/* Character header — click avatar/name → character state panel */}
                <div
                  onClick={() => onContextChange({ kind: 'character-state', characterId: ev.characterId, actionIndex: ev.actionIndex, turnKind: ev.turnKind, stateSnapshot: ev.stateBefore[ev.characterId] })}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 2 }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: ev.color, flexShrink: 0 }} />
                  <Text size='xs' fw={700} style={{ color: ev.color }}>
                    {ev.characterName}{showIndex ? tAv('TurnSuffix', { n: ev.actionIndex + 1 }) : ''}
                  </Text>
                  <div style={{ flex: 1, height: 1, backgroundColor: ev.color, opacity: 0.35 }} />
                  <IconChevronRight size={12} color={ev.color} style={{ opacity: 0.6 }} />
                </div>

                {/* Behavior row: current action choice, click → ActionConfigPanel */}
                {renderBehaviorRow(ev)}

                {beforeIvs.map(renderItem)}
                {renderAddButton(
                  () => onContextChange({ kind: 'add-branch', triggerAv: playheadAv, beforeCharId: ev.characterId, beforeActionIndex: ev.actionIndex }),
                  addZoneKey(ev.characterId, ev.actionIndex, undefined, undefined),
                )}
              </div>

              <div style={{ paddingLeft: 8, paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {afterIvs.map(renderItem)}
                {renderAddButton(
                  () => {
                    const firstUltInSlot = allUltInsertions.find(
                      (u) => u.timing.type === 'after_action' && u.timing.charId === ev.characterId && u.timing.actionIndex === ev.actionIndex,
                    )
                    onContextChange({ kind: 'add-branch', triggerAv: playheadAv, afterCharId: ev.characterId, afterActionIndex: ev.actionIndex, insertBeforeUltId: firstUltInSlot?.id })
                  },
                  addZoneKey(undefined, undefined, ev.characterId, ev.actionIndex),
                )}
              </div>
            </Fragment>
          )
        })}
      </Stack>
    )
  }

  function renderAvHeader() {
    if (avEditing) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text size='sm' fw={600}>{tAv('AvLabel')}</Text>
          <NumberInput
            size='xs'
            value={avEditValue}
            onChange={(v) => setAvEditValue(typeof v === 'number' ? v : avEditValue)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmAvEdit() }}
            min={0}
            style={{ width: 90 }}
            autoFocus
          />
          <ActionIcon size='sm' variant='filled' color='blue' onClick={confirmAvEdit}>
            <IconCheck size={14} />
          </ActionIcon>
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Text size='sm' fw={600}>{tAv('AvLabel')} {playheadAv}</Text>
        <ActionIcon size='xs' variant='subtle' color='gray' onClick={() => { setAvEditValue(playheadAv); setAvEditing(true) }}>
          <IconPencil size={12} />
        </ActionIcon>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {renderAvHeader()}

      <ScrollArea type='scroll' scrollbarSize={8} scrollbars='y' style={{ flex: 1 }}>
        <Stack gap='sm'>
          {normalActionsAtAv.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {normalActionsAtAv.map((ev, i) => (
                <Fragment key={`${ev.characterId}:${ev.actionIndex}`}>
                  {i > 0 && <IconChevronRight size={16} color='var(--mantine-color-dimmed)' />}
                  <div
                    onClick={() => onContextChange({ kind: 'character-state', characterId: ev.characterId, actionIndex: ev.actionIndex, turnKind: ev.turnKind, stateSnapshot: ev.stateBefore[ev.characterId] })}
                    style={{ cursor: 'pointer' }}
                  >
                    <ActionOrderAvatar characterId={ev.characterId} characterName={ev.characterName} color={ev.color} />
                  </div>
                </Fragment>
              ))}
            </div>
          )}
          {renderList()}
        </Stack>
      </ScrollArea>
    </div>
  )
}
