import { ActionIcon, Button, NumberInput, ScrollArea, Stack, Text } from '@mantine/core'
import { IconCheck, IconChevronRight, IconPencil, IconPlus } from '@tabler/icons-react'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { ActionOrderAvatar } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionOrderAvatar'
import { InterventionItem } from 'lib/tabs/tabAvVisualizer/interventionPanel/InterventionItem'
import type { EditRequest, Intervention } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { Fragment, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

// A subset of EnrichedSimEvent (avoids a circular import)
type ActionEvent = {
  av: number
  characterId: string
  characterName: string
  color: string
  actionIndex: number
}

type ActionDisplayPanelProps = {
  characters: Array<{ id: string; name: string; color: string }>
  simEvents: ActionEvent[]
  request: EditRequest | null         // Current EditPanel request (add or edit), for highlighting its source
  onRequest: (request: EditRequest) => void
}

// Canonical key for an "add" zone, used to compare against the active request and highlight the matching + button
function addZoneKey(beforeCharId?: string, beforeActionIndex?: number, afterCharId?: string, afterActionIndex?: number): string {
  if (beforeCharId) return `before:${beforeCharId}:${beforeActionIndex ?? 0}`
  if (afterCharId) return `after:${afterCharId}:${afterActionIndex ?? 0}`
  return 'flat'
}

// Always-on panel: shows the action order + during-action / end-of-action-instant intervention lists for
// whatever AV the Playhead is currently on. Replaces the left half of the old InterventionListPanel modal.
export function ActionDisplayPanel({ characters, simEvents, request, onRequest }: ActionDisplayPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const playheadAv = useAVVisualTabStore((s) => s.playheadAv)

  // Derived from the EditPanel's current request, used to highlight its source (the intervention being edited,
  // or the + button the current "add" originated from)
  const editingId = request?.mode === 'edit' ? request.intervention.id : null
  const activeAddKey = request?.mode === 'add'
    ? addZoneKey(request.beforeCharId, request.beforeActionIndex, request.afterCharId, request.afterActionIndex)
    : null

  // ---- AV mini-editor (click ✏ to type an exact AV to jump to; the Playhead is the source of truth) ----
  const [avEditing, setAvEditing] = useState(false)
  const [avEditValue, setAvEditValue] = useState(playheadAv)

  function confirmAvEdit() {
    AvVisualTabController.setPlayheadAv(avEditValue)
    setAvEditing(false)
  }

  const allInterventions = useAVVisualTabStore((s) => s.savedSession.interventions)
  const currentInterventions = useMemo(
    () => allInterventions.filter((iv) => iv.triggerAv === playheadAv),
    [allInterventions, playheadAv],
  )

  // All actions at this AV, ordered by (characterId, actionIndex) (not deduplicated)
  const actionsAtAv = useMemo(
    () => simEvents.filter((e) => Math.abs(e.av - playheadAv) < 0.005),
    [simEvents, playheadAv],
  )

  // Total number of actions per characterId at this AV (used to decide whether to show a turn-number suffix)
  const actionCountPerChar = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of actionsAtAv) map.set(e.characterId, (map.get(e.characterId) ?? 0) + 1)
    return map
  }, [actionsAtAv])

  const isStructured = actionsAtAv.length > 0

  // End-of-action interventions: grouped by (afterCharId, afterActionIndex)
  const afterMap = useMemo(() => {
    const map = new Map<string, Intervention[]>()
    for (const iv of currentInterventions) {
      if (!iv.afterCharId) continue
      const key = `${iv.afterCharId}:${iv.afterActionIndex ?? 0}`
      const list = map.get(key) ?? []
      list.push(iv)
      map.set(key, list)
    }
    return map
  }, [currentInterventions])

  // During-action interventions: grouped by (beforeCharId, beforeActionIndex), symmetric to afterMap
  const beforeMap = useMemo(() => {
    const map = new Map<string, Intervention[]>()
    for (const iv of currentInterventions) {
      if (!iv.beforeCharId) continue
      const key = `${iv.beforeCharId}:${iv.beforeActionIndex ?? 0}`
      const list = map.get(key) ?? []
      list.push(iv)
      map.set(key, list)
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
        onEdit={() => onRequest({ mode: 'edit', intervention: iv })}
        onDelete={() => AvVisualTabController.removeIntervention(iv.id)}
      />
    )
  }

  // Add button: sized to match an InterventionItem row, with the + centered rather than a thin little icon.
  // Highlighted (filled blue) when it's the zone the EditPanel's current "add" request originated from.
  function renderIconAdd(onClick: () => void, zoneKey: string) {
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

  function renderList() {
    if (!isStructured) {
      return (
        <Stack gap='sm'>
          {currentInterventions.length > 0 && (
            <Stack gap={2}>{currentInterventions.map(renderItem)}</Stack>
          )}
          {renderIconAdd(() => onRequest({ mode: 'add' }), 'flat')}
        </Stack>
      )
    }

    return (
      <Stack gap='sm'>
        {actionsAtAv.map((ev) => {
          const totalForChar = actionCountPerChar.get(ev.characterId) ?? 1
          const showIndex = totalForChar > 1
          const beforeIvs = beforeMap.get(`${ev.characterId}:${ev.actionIndex}`) ?? []
          const afterIvs = afterMap.get(`${ev.characterId}:${ev.actionIndex}`) ?? []

          return (
            <Fragment key={`${ev.characterId}:${ev.actionIndex}`}>
              {/* Container: character header (with turn number) + during-action zone — identical structure for every action */}
              <div style={{
                border: '1px solid var(--mantine-color-dark-4)',
                borderRadius: 6, padding: '6px 8px',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    backgroundColor: ev.color, flexShrink: 0,
                  }} />
                  <Text size='xs' fw={700} style={{ color: ev.color }}>
                    {ev.characterName}{showIndex ? tAv('TurnSuffix', { n: ev.actionIndex + 1 }) : ''}
                  </Text>
                  <div style={{ flex: 1, height: 1, backgroundColor: ev.color, opacity: 0.35 }} />
                </div>
                {beforeIvs.map(renderItem)}
                {renderIconAdd(
                  () => onRequest({ mode: 'add', beforeCharId: ev.characterId, beforeActionIndex: ev.actionIndex }),
                  addZoneKey(ev.characterId, ev.actionIndex, undefined, undefined),
                )}
              </div>

              {/* Outside the container: end-of-action-instant zone — left/right inset matches the container's
              8px padding so item/button widths line up */}
              <div style={{ paddingLeft: 8, paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {afterIvs.map(renderItem)}
                {renderIconAdd(
                  () => onRequest({ mode: 'add', afterCharId: ev.characterId, afterActionIndex: ev.actionIndex }),
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
        <ActionIcon
          size='xs'
          variant='subtle'
          color='gray'
          onClick={() => { setAvEditValue(playheadAv); setAvEditing(true) }}
        >
          <IconPencil size={12} />
        </ActionIcon>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* AV header stays fixed; only the action-order row + list scroll below it */}
      {renderAvHeader()}

      <ScrollArea type='scroll' scrollbarSize={8} scrollbars='y' style={{ flex: 1 }}>
        <Stack gap='sm'>
          {/* Action-order row: shows avatars at this AV in action order; the same character acting multiple times shows multiple avatars */}
          {actionsAtAv.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {actionsAtAv.map((ev, i) => (
                <Fragment key={`${ev.characterId}:${ev.actionIndex}`}>
                  {i > 0 && <IconChevronRight size={16} color='var(--mantine-color-dimmed)' />}
                  <ActionOrderAvatar characterId={ev.characterId} characterName={ev.characterName} color={ev.color} />
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
