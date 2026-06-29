import { ActionIcon, Button, NumberInput, ScrollArea, Stack, Switch, Text, Tooltip } from '@mantine/core'
import { IconCheck, IconChevronRight, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import { Assets } from 'lib/rendering/assets'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import { mergeChainedOrder } from 'lib/tabs/tabAvVisualizer/chainOrder'
import { ActionOrderAvatar } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionOrderAvatar'
import { InterventionItem } from 'lib/tabs/tabAvVisualizer/interventionPanel/InterventionItem'
import type { ActionChoice, CharacterBattleState, Intervention, RightPanelContext, TurnKind, UltInsertion } from 'lib/tabs/tabAvVisualizer/types'
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

// One slot in a merged before/after sequence (see buildMergedDisplay) — either a Ult (rendered as its own
// card) or a manually-added Intervention, in the exact order simulateBattle.ts itself resolves them in.
type MergedDisplayItem =
  | { kind: 'ult'; id: string; afterItemId?: string; ev: ActionEvent }
  | { kind: 'intervention'; id: string; afterItemId?: string; iv: Intervention }

type ActionDisplayPanelProps = {
  characters: Array<{ id: string; name: string; color: string }>
  simEvents: ActionEvent[]
  activeContext: RightPanelContext
  onContextChange: (ctx: RightPanelContext) => void
}

// Precise key for one specific "+" slot in a before/after chain (see buildMergedDisplay) — encodes the
// anchor (before/after this action) plus exactly which gap in the chain, via the id of whatever
// immediately precedes it (or 'start' for the very first gap, which has no preceding item). Without the
// afterItemId component, every "+" sharing the same action would collapse onto the same key — which is
// exactly the bug this fixes: the leading "+" (no preceding item) used to fall back to a key that
// happened to collide with the trailing "+" at the same action.
function chainAddZoneKey(anchorKind: 'before' | 'after', charId: string, actionIndex: number, afterItemId?: string): string {
  return `chain-${anchorKind}:${charId}:${actionIndex}:${afterItemId ?? 'start'}`
}

// Mirrors how an add-branch-like context (RightPanelContext's 'add-branch' kind, or EditRequest's 'add'
// mode) maps onto a "+" button's own zoneKey — beforeCharId/afterCharId set means it's one of the chain
// buttons above (always use chainAddZoneKey, regardless of whether afterUltId also happens to be set,
// e.g. because the preceding chain item happens to be a Ult); afterUltId alone (no before/afterCharId at
// all) means a standalone Ult card's own single button; neither means the flat/idle add button.
function deriveAddZoneKey(
  beforeCharId?: string, beforeActionIndex?: number,
  afterCharId?: string, afterActionIndex?: number,
  afterItemId?: string, afterUltId?: string,
): string {
  if (beforeCharId !== undefined) return chainAddZoneKey('before', beforeCharId, beforeActionIndex ?? 0, afterItemId)
  if (afterCharId !== undefined) return chainAddZoneKey('after', afterCharId, afterActionIndex ?? 0, afterItemId)
  if (afterUltId) return `after-ult:${afterUltId}`
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
    ? deriveAddZoneKey(
        activeContext.request.beforeCharId, activeContext.request.beforeActionIndex,
        activeContext.request.afterCharId, activeContext.request.afterActionIndex,
        activeContext.request.afterItemId, undefined,
      )
    : activeContext.kind === 'add-branch'
      ? deriveAddZoneKey(
          activeContext.beforeCharId, activeContext.beforeActionIndex,
          activeContext.afterCharId, activeContext.afterActionIndex,
          activeContext.afterItemId, activeContext.afterUltId,
        )
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

  const allInterventions = useAVVisualTabStore((s) => s.savedSession.waves[s.savedSession.currentWaveIndex].interventions)
  const allUltInsertions = useAVVisualTabStore((s) => s.savedSession.waves[s.savedSession.currentWaveIndex].ultInsertions)
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

  // Precise turnKind check (not just "!== 'ult'") — extraAttack events should count as neither a normal
  // action (for actionCountPerChar's multi-action badge) nor toggle isStructured by themselves alone.
  const normalActionsAtAv = useMemo(() => actionsAtAv.filter((e) => e.turnKind === 'normal'), [actionsAtAv])
  const ultActionsAtAv    = useMemo(() => actionsAtAv.filter((e) => e.turnKind === 'ult'),  [actionsAtAv])
  const extraActionsAtAv  = useMemo(() => actionsAtAv.filter((e) => e.turnKind === 'extra'), [actionsAtAv])

  // Order-preview strip at the top: every event at this AV gets its own slot, in actual resolution
  // order — a character's own Ult/extraAttack is NOT merged onto their separate normal-action slot (each
  // occurrence is its own position in the sequence). The only difference is *how* a slot renders: a
  // Ult/extraAttack slot always shows that character's own avatar with the matching overlay badge (see
  // ActionOrderAvatar) — never a generic icon-only marker — so it reads as "this character's Ult", not
  // an anonymous Ult.
  const orderPreviewEntries = useMemo(() => actionsAtAv.map((ev) => ({
    ...ev,
    hasUltOverlay: ev.turnKind === 'ult',
    hasExtraOverlay: ev.turnKind === 'extra',
  })), [actionsAtAv])

  // Raw UltInsertion records (not ActionEvents) grouped by the action they're bound to — needed alongside
  // currentInterventions to build the true merged display order (see buildMergedDisplay), since
  // afterItemId chaining can splice an Intervention in between two Ults at this anchor.
  const duringUltInsertionsByCharAction = useMemo(() => {
    const map = new Map<string, UltInsertion[]>()
    for (const u of allUltInsertions) {
      if (u.timing.type !== 'during_action') continue
      const key = `${u.timing.charId}:${u.timing.actionIndex}`
      map.set(key, [...(map.get(key) ?? []), u])
    }
    return map
  }, [allUltInsertions])

  const afterUltInsertionsByCharAction = useMemo(() => {
    const map = new Map<string, UltInsertion[]>()
    for (const u of allUltInsertions) {
      if (u.timing.type !== 'after_action') continue
      const key = `${u.timing.charId}:${u.timing.actionIndex}`
      map.set(key, [...(map.get(key) ?? []), u])
    }
    return map
  }, [allUltInsertions])

  // Lets buildMergedDisplay go from "this Ult insertion resolved" to the ActionEvent that carries its
  // display data (color, characterName, etc) — an insertion with no matching event here never actually
  // fired (e.g. insufficient energy), so it's excluded from the merged display entirely.
  const ultEventByInsertionId = useMemo(() => {
    const map = new Map<string, ActionEvent>()
    for (const ev of ultActionsAtAv) if (ev.ultInsertionId) map.set(ev.ultInsertionId, ev)
    return map
  }, [ultActionsAtAv])

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

  // Interventions with neither beforeCharId nor afterCharId — not bound to any character's action, so
  // they'd otherwise have no display slot at all in the structured view below (only the at_av Ult cards,
  // which render via actionsAtAv since they're true BattleEvents, would be visible). Shown as their own
  // section so they're not silently invisible just because they share this AV with a normal action.
  const flatInterventions = useMemo(
    () => currentInterventions.filter((iv) => !iv.beforeCharId && !iv.afterCharId),
    [currentInterventions],
  )

  // Merges a character action's before/after Interventions with the Ults sharing that same anchor into
  // the exact order simulateBattle.ts itself resolves them in (see mergeChainedOrder) — so the panel shows
  // (and lets you precisely insert into) the true sequence, not just "all interventions, then all Ults".
  function buildMergedDisplay(ivsHere: Intervention[], ultsHere: UltInsertion[]): MergedDisplayItem[] {
    const liveUlts = ultsHere.filter((u) => ultEventByInsertionId.has(u.id))
    const toEntry = (iv: Intervention): MergedDisplayItem => ({ kind: 'intervention', id: iv.id, afterItemId: iv.afterItemId, iv })
    const toUltEntry = (u: UltInsertion): MergedDisplayItem => ({ kind: 'ult', id: u.id, afterItemId: u.afterItemId, ev: ultEventByInsertionId.get(u.id)! })
    return mergeChainedOrder(
      [...ivsHere.filter((iv) => !iv.afterItemId).map(toEntry), ...liveUlts.filter((u) => !u.afterItemId).map(toUltEntry)],
      [...ivsHere.filter((iv) => iv.afterItemId).map(toEntry), ...liveUlts.filter((u) => u.afterItemId).map(toUltEntry)],
    )
  }

  // When the item right before a "+" is itself a Ult, the add-branch context needs afterUltId set (not
  // just afterItemId) — UltCasterPanel's stale-state fix (see priorUltEvent in AvVisualizerTab.tsx) keys
  // specifically off afterUltId/insertAfterId to find that Ult's own post-resolution state as the energy/
  // buff baseline, instead of falling back to this AV's very first state (before that Ult ever fired).
  // The id of whatever item (Ult OR Intervention — both now produce a chainSnapshots entry, see
  // simulateBattle.ts) sits immediately before this slot, used as RightPanelContext's insertAfterId so
  // UltCasterPanel can look up that item's own post-resolution state as its energy/buff baseline instead
  // of falling back to this AV's very first state.
  function precedingAnchorId(items: MergedDisplayItem[], i: number): string | undefined {
    return i > 0 ? items[i - 1].id : undefined
  }

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

  // Shared by Ult and extraAttack — both are "this character's own thing happened here" cards rather
  // than a normal action (no basic/skill choice, no before/after insertion points of their own).
  // extraAttack additionally has no delete affordance (it's not something the user manually inserted,
  // unlike a Ult — see TurnKind/extraAttack's own doc comments for why it has no turn of its own at all).
  function renderSpecialCard(ev: ActionEvent, kind: 'ult' | 'extra') {
    const isActive = activeCharTurnKey === `${ev.characterId}:${ev.actionIndex}:${ev.turnKind}`
    const effectsContextKind = kind === 'ult' ? 'ult-effects' as const : 'extra-effects' as const
    const isEffectsActive = activeContext.kind === effectsContextKind && activeContext.casterId === ev.characterId
    const iconSrc = kind === 'ult' ? Assets.getUltIcon() : Assets.getExtraAttackIcon()
    return (
      <div
        key={`${kind}:${ev.characterId}:${ev.av}`}
        style={{
          border: `1.5px solid ${ev.color}`,
          background: isActive ? `${ev.color}1a` : 'transparent',
          borderRadius: 6, padding: '6px 8px',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <Tooltip label={tAv('UltCard.Effects')} position='top' withinPortal>
          <ActionIcon
            size='xs'
            variant='subtle'
            style={isEffectsActive ? { backgroundColor: `${ev.color}33` } : undefined}
            onClick={() => onContextChange(
              kind === 'ult'
                ? { kind: 'ult-effects', casterId: ev.characterId, targets: ev.currentTargets }
                : { kind: 'extra-effects', casterId: ev.characterId, targets: ev.currentTargets },
            )}
          >
            <img src={iconSrc} draggable={false} style={{ width: 12, height: 12, userSelect: 'none' }} />
          </ActionIcon>
        </Tooltip>
        <Text
          size='xs' fw={700} style={{ color: ev.color, flex: 1, cursor: 'pointer' }}
          onClick={() => onContextChange({ kind: 'character-state', characterId: ev.characterId, actionIndex: ev.actionIndex, turnKind: ev.turnKind, stateSnapshot: ev.stateBefore[ev.characterId] })}
        >
          {ev.characterName}
        </Text>
        {kind === 'ult' && ev.ultInsertionId && (
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
                {renderSpecialCard(ev, 'ult')}
                {ev.ultInsertionId && renderAddButton(
                  () => onContextChange({ kind: 'add-branch', triggerAv: playheadAv, afterUltId: ev.ultInsertionId, ultTimingReference: ref?.timing, afterItemId: ev.ultInsertionId }),
                  `after-ult:${ev.ultInsertionId}`,
                )}
              </Fragment>
            )
          })}
          {extraActionsAtAv.map((ev) => renderSpecialCard(ev, 'extra'))}
          {currentInterventions.length > 0 && (
            <Stack gap={2}>{currentInterventions.map(renderItem)}</Stack>
          )}
          {renderAddButton(() => onContextChange({ kind: 'add-branch', triggerAv: playheadAv }), 'flat')}
        </Stack>
      )
    }

    return (
      <Stack gap='sm'>
        {flatInterventions.length > 0 && (
          <Stack gap={2}>{flatInterventions.map(renderItem)}</Stack>
        )}

        {actionsAtAv.map((ev) => {
          // Ult events: during_action and after_action ults are both rendered nested under the action
          // they're bound to (below) instead of as separate top-level cards here — only at_av ults (bound
          // to no specific action) keep their own top-level card.
          if (ev.turnKind === 'ult') {
            const insertion = allUltInsertions.find((u) => u.id === ev.ultInsertionId)
            if (insertion?.timing.type === 'during_action' || insertion?.timing.type === 'after_action') return null

            return (
              <Fragment key={`ult:${ev.characterId}:${ev.av}`}>
                {renderSpecialCard(ev, 'ult')}
                {ev.ultInsertionId && (
                  <div style={{ paddingLeft: 8, paddingRight: 8 }}>
                    {renderAddButton(
                      () => onContextChange({ kind: 'add-branch', triggerAv: playheadAv, afterUltId: ev.ultInsertionId, ultTimingReference: insertion?.timing, afterItemId: ev.ultInsertionId }),
                      `after-ult:${ev.ultInsertionId}`,
                    )}
                  </div>
                )}
              </Fragment>
            )
          }

          // extraAttack: card only — no add-button before or after it. It has no turn of its own at all
          // (see TurnKind/extraAttack's own doc comments), triggers tightly bound to whatever condition
          // fired it, so there's no meaningful insertion point immediately around it either.
          if (ev.turnKind === 'extra') {
            return <Fragment key={`extra:${ev.characterId}:${ev.av}`}>{renderSpecialCard(ev, 'extra')}</Fragment>
          }

          const totalForChar = actionCountPerChar.get(ev.characterId) ?? 1
          const showIndex = totalForChar > 1
          const beforeIvs = beforeMap.get(`${ev.characterId}:${ev.actionIndex}`) ?? []
          const afterIvs = afterMap.get(`${ev.characterId}:${ev.actionIndex}`) ?? []
          const isCharActive = activeCharTurnKey === `${ev.characterId}:${ev.actionIndex}:${ev.turnKind}`
          // True resolved order — interleaves Ults and manually-added Interventions sharing this same
          // anchor exactly the way simulateBattle.ts itself resolves them (see buildMergedDisplay), so a
          // "+" between any two adjacent items here always inserts precisely at that point (afterItemId
          // = the item right before it, or undefined for the very first slot).
          const mergedDuring = buildMergedDisplay(beforeIvs, duringUltInsertionsByCharAction.get(`${ev.characterId}:${ev.actionIndex}`) ?? [])
          const mergedAfter  = buildMergedDisplay(afterIvs,  afterUltInsertionsByCharAction.get(`${ev.characterId}:${ev.actionIndex}`) ?? [])

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

                {/* during_action Ults + before-Interventions: resolve before this action's basic/skill, in
                their true merged order — a "+" before each item (including the first), so there's always
                exactly one between any two renderable items here, never two in a row. */}
                {mergedDuring.map((item, i) => (
                  <Fragment key={`during:${item.id}`}>
                    {renderAddButton(
                      () => onContextChange({
                        kind: 'add-branch', triggerAv: playheadAv,
                        beforeCharId: ev.characterId, beforeActionIndex: ev.actionIndex,
                        afterItemId: i > 0 ? mergedDuring[i - 1].id : undefined,
                        afterUltId: precedingAnchorId(mergedDuring, i),
                      }),
                      chainAddZoneKey('before', ev.characterId, ev.actionIndex, i > 0 ? mergedDuring[i - 1].id : undefined),
                    )}
                    {item.kind === 'ult' ? renderSpecialCard(item.ev, 'ult') : renderItem(item.iv)}
                  </Fragment>
                ))}
                {renderAddButton(
                  () => onContextChange({
                    kind: 'add-branch', triggerAv: playheadAv,
                    beforeCharId: ev.characterId, beforeActionIndex: ev.actionIndex,
                    afterItemId: mergedDuring.length > 0 ? mergedDuring[mergedDuring.length - 1].id : undefined,
                    afterUltId: precedingAnchorId(mergedDuring, mergedDuring.length),
                  }),
                  chainAddZoneKey('before', ev.characterId, ev.actionIndex, mergedDuring.length > 0 ? mergedDuring[mergedDuring.length - 1].id : undefined),
                )}

                {/* Behavior row: current action choice, click → ActionConfigPanel. Placed last — it
                resolves after everything above (during_action ult, before-interventions) within this turn. */}
                {renderBehaviorRow(ev)}
              </div>

              {/* after_action Ults + after-Interventions: same merged-order treatment as the during_action
              zone above, just below the action's own box instead of inside it. */}
              <div style={{ paddingLeft: 8, paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {mergedAfter.map((item, i) => (
                  <Fragment key={`after:${item.id}`}>
                    {renderAddButton(
                      () => onContextChange({
                        kind: 'add-branch', triggerAv: playheadAv,
                        afterCharId: ev.characterId, afterActionIndex: ev.actionIndex,
                        afterItemId: i > 0 ? mergedAfter[i - 1].id : undefined,
                        afterUltId: precedingAnchorId(mergedAfter, i),
                      }),
                      chainAddZoneKey('after', ev.characterId, ev.actionIndex, i > 0 ? mergedAfter[i - 1].id : undefined),
                    )}
                    {item.kind === 'ult' ? renderSpecialCard(item.ev, 'ult') : renderItem(item.iv)}
                  </Fragment>
                ))}
                {renderAddButton(
                  () => onContextChange({
                    kind: 'add-branch', triggerAv: playheadAv,
                    afterCharId: ev.characterId, afterActionIndex: ev.actionIndex,
                    afterItemId: mergedAfter.length > 0 ? mergedAfter[mergedAfter.length - 1].id : undefined,
                    afterUltId: precedingAnchorId(mergedAfter, mergedAfter.length),
                  }),
                  chainAddZoneKey('after', ev.characterId, ev.actionIndex, mergedAfter.length > 0 ? mergedAfter[mergedAfter.length - 1].id : undefined),
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
          {orderPreviewEntries.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {orderPreviewEntries.map((ev, i) => (
                <Fragment key={`${ev.characterId}:${ev.actionIndex}:${ev.turnKind}`}>
                  {i > 0 && <IconChevronRight size={16} color='var(--mantine-color-dimmed)' />}
                  <div
                    onClick={() => onContextChange({ kind: 'character-state', characterId: ev.characterId, actionIndex: ev.actionIndex, turnKind: ev.turnKind, stateSnapshot: ev.stateBefore[ev.characterId] })}
                    style={{ cursor: 'pointer' }}
                  >
                    <ActionOrderAvatar
                      characterId={ev.characterId}
                      characterName={ev.characterName}
                      color={ev.color}
                      hasUltOverlay={ev.hasUltOverlay}
                      hasExtraOverlay={ev.hasExtraOverlay}
                    />
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
