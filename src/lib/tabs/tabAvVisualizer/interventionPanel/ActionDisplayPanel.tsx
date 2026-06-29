import { ActionIcon, Button, NumberInput, ScrollArea, Stack, Switch, Text, Tooltip } from '@mantine/core'
import { IconBolt, IconCheck, IconChevronRight, IconListDetails, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import { ActionOrderAvatar } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionOrderAvatar'
import { InterventionItem } from 'lib/tabs/tabAvVisualizer/interventionPanel/InterventionItem'
import type { ActionChoice, CharacterBattleState, Intervention, RightPanelContext, TurnKind } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { truncate100ths } from 'lib/utils/mathUtils'
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
  hitCount?: number
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

  // Observe mode (default): hides add-buttons and edit/delete affordances so this panel is purely a
  // read-only view of what happened, without the clutter of every insertion point. Viewing-only actions
  // (character-state clicks, AV seeking) stay enabled regardless.
  const [editMode, setEditMode] = useState(false)

  // ---- AV mini-editor ----
  const [avEditing, setAvEditing] = useState(false)
  const [avEditValue, setAvEditValue] = useState(playheadAv)

  function confirmAvEdit() {
    AvVisualTabController.setPlayheadAv(avEditValue)
    setAvEditing(false)
  }

  const allInterventions = useAVVisualTabStore((s) => s.savedSession.interventions)
  const allUltInsertions = useAVVisualTabStore((s) => s.savedSession.ultInsertions)
  // Bucketed to 2 decimals rather than exact equality — an intervention created by dragging/clicking the
  // ruler lands on a continuous floating-point AV (e.g. 9.9999997), so typing/seeking to a clean value
  // like 10 in the AV input below would otherwise never match it.
  const currentInterventions = useMemo(
    () => allInterventions.filter((iv) => truncate100ths(iv.triggerAv) === truncate100ths(playheadAv)),
    [allInterventions, playheadAv],
  )

  const actionsAtAv = useMemo(
    () => simEvents.filter((e) => Math.abs(e.av - playheadAv) < 0.005),
    [simEvents, playheadAv],
  )

  const normalActionsAtAv = useMemo(() => actionsAtAv.filter((e) => e.turnKind !== 'ult'), [actionsAtAv])
  const ultActionsAtAv    = useMemo(() => actionsAtAv.filter((e) => e.turnKind === 'ult'),  [actionsAtAv])

  // during_action ults resolve before the action they're bound to (see simulateBattle.ts), so they're
  // rendered nested inside that action's box instead of as a separate top-level card — keyed by the
  // (characterId, actionIndex) of the action they precede. A slot can hold more than one (e.g. two
  // characters' ults both inserted "during" the same action) — stored as a list, in the same order the
  // engine actually fires them (simEvents is already in simulation order), not just the last one.
  const duringUltByCharAction = useMemo(() => {
    const map = new Map<string, ActionEvent[]>()
    for (const ev of ultActionsAtAv) {
      const insertion = allUltInsertions.find((u) => u.id === ev.ultInsertionId)
      if (insertion?.timing.type !== 'during_action') continue
      const key = `${insertion.timing.charId}:${insertion.timing.actionIndex}`
      map.set(key, [...(map.get(key) ?? []), ev])
    }
    return map
  }, [ultActionsAtAv, allUltInsertions])

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
        readOnly={!editMode}
        onEdit={() => onContextChange({ kind: 'intervention', request: { mode: 'edit', intervention: iv } })}
        onDelete={() => AvVisualTabController.removeIntervention(iv.id)}
      />
    )
  }

  function renderAddButton(onClick: () => void, zoneKey: string) {
    if (!editMode) return null
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
    // A dynamic (AbilityResolver) skill counts as "having a skill" too — Array.isArray guards against
    // reading a function's declared-parameter count as if it were a template array's length.
    const skillAbility = config?.abilities.skill
    const hasSkill = skillAbility !== undefined && (Array.isArray(skillAbility) ? skillAbility.length > 0 : true)
    // A basic whose caster held a basicVariants-gating buff right before this action means that variant
    // matched (e.g. Trailblazer-Remembrance's 史诗-enhanced basic, Saber's Ult-granted enhanced basic) —
    // label it as such instead of the plain "Basic ATK" text. Checked directly against the held buff
    // (not hitCount) so this works even when a variant's hitCount happens to equal the base one (e.g.
    // Saber: both are 1-hit).
    const isEnhancedBasic = ev.actionChoice === 'basic' && !!config?.basicVariants?.some((v) =>
      ev.stateBefore[ev.characterId]?.activeInterventions?.some((b) => b.effectId === v.requiresEffectId))
    const choiceKey = ev.actionChoice === 'skill'
      ? 'ActionNode.Skill'
      : isEnhancedBasic ? 'ActionNode.BasicEnhanced' : 'ActionNode.Basic'
    const targetName = ev.actionChoice === 'skill' && ev.currentTargets?.[0]
      ? (characters.find((c) => c.id === ev.currentTargets![0])?.name ?? ev.currentTargets[0])
      : null
    const isActive = activeActionConfig === `${ev.characterId}:${ev.actionIndex}`
    const isClickable = hasSkill && editMode

    return (
      <div
        onClick={isClickable ? () => onContextChange({ kind: 'action-config', characterId: ev.characterId, actionIndex: ev.actionIndex, hitCount: ev.hitCount, stateSnapshot: ev.stateBefore[ev.characterId] }) : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 8px', borderRadius: 4,
          cursor: isClickable ? 'pointer' : 'default',
          background: isActive ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-dark-7)',
          border: `1px solid ${isActive ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dark-5)'}`,
        }}
      >
        <Text size='xs' fw={600}>{tAv(choiceKey as 'ActionNode.Basic' | 'ActionNode.Skill' | 'ActionNode.BasicEnhanced')}</Text>
        {targetName && (
          <Text size='xs' c='dimmed'>→ {targetName}</Text>
        )}
        {isClickable && (
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
            // during_action ults are rendered nested inside the action box they precede (below),
            // not as a separate top-level card — skip them here.
            const insertion = allUltInsertions.find((u) => u.id === ev.ultInsertionId)
            if (insertion?.timing.type === 'during_action') return null

            return (
              <Fragment key={`ult:${ev.characterId}:${ev.av}`}>
                {renderUltCard(ev)}
                {ev.ultInsertionId && (
                  <div style={{ paddingLeft: 8, paddingRight: 8 }}>
                    {renderAddButton(
                      () => onContextChange({ kind: 'add-branch', triggerAv: playheadAv, afterUltId: ev.ultInsertionId, ultTimingReference: insertion?.timing }),
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

                {/* during_action ults: resolve before this action's basic/skill, so they're shown here,
                ahead of the behavior row. A slot can hold more than one (e.g. two different characters'
                ults both inserted "during" this same action) — each gets its own add-button right
                before it (including the first), so there's always exactly one "+" between any two
                renderable items here, never two in a row. The slot right before the action itself
                (beforeIvs' add-button below) already covers "append after the last ult", so it isn't
                repeated here. */}
                {duringUltByCharAction.get(`${ev.characterId}:${ev.actionIndex}`)?.map((duringUlt) => (
                  <Fragment key={`during-ult:${duringUlt.ultInsertionId}`}>
                    {duringUlt.ultInsertionId && renderAddButton(
                      () => onContextChange({
                        kind: 'add-branch', triggerAv: playheadAv,
                        beforeCharId: ev.characterId, beforeActionIndex: ev.actionIndex,
                        insertBeforeUltId: duringUlt.ultInsertionId,
                      }),
                      `before-ult:${duringUlt.ultInsertionId}`,
                    )}
                    {renderUltCard(duringUlt)}
                  </Fragment>
                ))}

                {beforeIvs.map(renderItem)}
                {renderAddButton(
                  () => onContextChange({ kind: 'add-branch', triggerAv: playheadAv, beforeCharId: ev.characterId, beforeActionIndex: ev.actionIndex }),
                  addZoneKey(ev.characterId, ev.actionIndex, undefined, undefined),
                )}

                {/* Behavior row: current action choice, click → ActionConfigPanel. Placed last — it
                resolves after everything above (during_action ult, before-interventions) within this turn. */}
                {renderBehaviorRow(ev)}
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
        {/* 2-decimal truncation, not the 1-decimal formatAvNumber used for energy/stats — this needs to
            match the intervention bucket granularity (truncate100ths) so the displayed AV can actually
            distinguish which 0.01 bucket the playhead is currently in. */}
        <Text size='sm' fw={600}>{tAv('AvLabel')} {truncate100ths(playheadAv).toFixed(2)}</Text>
        <ActionIcon size='xs' variant='subtle' color='gray' onClick={() => { setAvEditValue(playheadAv); setAvEditing(true) }}>
          <IconPencil size={12} />
        </ActionIcon>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {renderAvHeader()}
        <Switch
          size='xs'
          label={tAv('ActionDisplayPanel.EditModeLabel')}
          checked={editMode}
          onChange={(e) => setEditMode(e.currentTarget.checked)}
        />
      </div>

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
