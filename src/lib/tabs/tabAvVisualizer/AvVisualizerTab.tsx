import { Text } from '@mantine/core'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getPreviewRelics, getShowcaseStats } from 'lib/characterPreview/characterPreviewController'
import { Stats } from 'lib/constants/constants'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { CharacterSlotCard } from 'lib/tabs/tabAvVisualizer/characterSlotCard/CharacterSlotCard'
import { SLOT_COLORS } from 'lib/tabs/tabAvVisualizer/constants'
import { ActionConfigPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionConfigPanel'
import { ActionDisplayPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionDisplayPanel'
import { SpBar } from 'lib/tabs/tabAvVisualizer/interventionPanel/SpBar'
import { AddBranchPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/AddBranchPanel'
import { CharacterStatePanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/CharacterStatePanel'
import { InterventionEditPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/InterventionEditPanel'
import { UltCasterPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/UltCasterPanel'
import { UltEffectsPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/UltEffectsPanel'
import { Timeline, type EnrichedSimEvent } from 'lib/tabs/tabAvVisualizer/timeline/Timeline'
import type { BattleEntity, RightPanelContext } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import { useShallow } from 'zustand/react/shallow'

// Fixed height for the two side panels, matching the 2-row character slot grid (CharacterSlotCard is 220px
// tall, see CharacterSlotCard.module.css's .emptyCard) so panel content can't grow the whole row taller —
// it scrolls internally instead (each panel's own root sets height: '100%' + overflowY: 'auto').
const SIDE_PANEL_HEIGHT = 220 * 2 + 12

const IDLE_CONTEXT: RightPanelContext = { kind: 'idle' }

export function AvVisualizerTab() {
  const slots = useAVVisualTabStore((s) => s.savedSession.slots)
  const rowCount = useAVVisualTabStore((s) => s.savedSession.rowCount)
  const mocFirstRow = useAVVisualTabStore((s) => s.savedSession.mocFirstRow)
  const playheadAv = useAVVisualTabStore((s) => s.playheadAv)
  const interventions = useAVVisualTabStore((s) => s.savedSession.interventions)
  const actionOverrides = useAVVisualTabStore((s) => s.savedSession.actionOverrides)
  const ultInsertions = useAVVisualTabStore((s) => s.savedSession.ultInsertions)
  const charactersById = useCharacterStore((s) => s.charactersById)
  const relicsById = useRelicStore(useShallow((s) => s.relicsById))
  const { t } = useTranslation('gameData', { keyPrefix: 'Characters' })

  // Which panel to show on the right side; resets to idle whenever the Playhead moves
  const [rightPanelContext, setRightPanelContext] = useState<RightPanelContext>(IDLE_CONTEXT)

  useEffect(() => {
    setRightPanelContext(IDLE_CONTEXT)
  }, [playheadAv])

  const baseSpdMap = useMemo(() =>
    slots.map((slot) => {
      if (!slot.characterId) return null
      const character = charactersById[slot.characterId as CharacterId]
      if (!character) return null
      const { displayRelics } = getPreviewRelics(ShowcaseSource.CHARACTER_TAB, character, relicsById, null)
      return getShowcaseStats(character, displayRelics, null)[Stats.SPD] ?? null
    }),
  [slots, charactersById, relicsById])

  const whiteSpdMap = useMemo(() =>
    slots.map((slot) => {
      if (!slot.characterId) return null
      return getGameMetadata().characters[slot.characterId as CharacterId]?.stats[Stats.SPD] ?? null
    }),
  [slots])

  const timelineCharacters = useMemo(() =>
    slots
      .map((slot, i) => {
        if (!slot.characterId) return null
        const effectiveSpd = slot.spdOverride ?? baseSpdMap[i]
        if (!effectiveSpd) return null
        const entry: BattleEntity = {
          id: slot.characterId,
          type: 'character',
          name: t(`${slot.characterId as CharacterId}.Name`),
          spd: effectiveSpd,
          baseSpd: whiteSpdMap[i] ?? effectiveSpd,
          color: SLOT_COLORS[i],
          slotIndex: i,
        }
        return entry
      })
      .filter((c): c is BattleEntity => c !== null),
  [slots, baseSpdMap, whiteSpdMap, t])

  const totalAv = AvVisualTabController.getTotalAv(rowCount, mocFirstRow)

  const [simEvents, energyTimeline] = useMemo(() => {
    const charMap = new Map(timelineCharacters.map((c) => [c.id, c]))
    const overrideMap = new Map(
      actionOverrides.map((o) => [`${o.characterId}:${o.actionIndex}`, o]),
    )
    const result = AvVisualTabController.simulate(timelineCharacters, interventions, totalAv)
    const enriched = result.events.map((e): EnrichedSimEvent => ({
      ...e,
      color:          charMap.get(e.characterId)?.color     ?? '#888',
      characterName:  charMap.get(e.characterId)?.name      ?? e.characterId,
      slotIndex:      charMap.get(e.characterId)?.slotIndex ?? 0,
      currentTargets: overrideMap.get(`${e.characterId}:${e.actionIndex}`)?.targets,
    }))
    return [enriched, result.energyTimeline] as const
  }, [timelineCharacters, interventions, totalAv, actionOverrides, ultInsertions])

  const teamSpAtPlayhead = useMemo(() => {
    let last = { sp: 3, spMax: 5 }
    for (const ev of simEvents) {
      if (ev.av > playheadAv + 0.005) break
      last = ev.teamStateAfter
    }
    return last
  }, [simEvents, playheadAv])

  const energyAtPlayhead = useMemo(() => {
    const map = new Map<string, number>()
    for (const checkpoint of energyTimeline) {
      if (checkpoint.av > playheadAv + 0.005) break  // energyTimeline is sorted by av ascending
      for (const [charId, energy] of Object.entries(checkpoint.energyMap)) {
        map.set(charId, energy)
      }
    }
    return map
  }, [energyTimeline, playheadAv])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        AvVisualTabController.setPlayheadAv(Math.min(totalAv - 1, Math.floor(playheadAv) + 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        AvVisualTabController.setPlayheadAv(Math.max(0, Math.ceil(playheadAv) - 1))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playheadAv, totalAv])

  function renderRightPanel() {
    const ctx = rightPanelContext
    if (ctx.kind === 'add-branch') {
      return <AddBranchPanel context={ctx} onContextChange={setRightPanelContext} />
    }
    if (ctx.kind === 'intervention') {
      return (
        <InterventionEditPanel
          request={ctx.request}
          playheadAv={playheadAv}
          characters={timelineCharacters}
          onDone={() => setRightPanelContext(IDLE_CONTEXT)}
        />
      )
    }
    if (ctx.kind === 'action-config') {
      return (
        <ActionConfigPanel
          characterId={ctx.characterId}
          actionIndex={ctx.actionIndex}
          characters={timelineCharacters}
        />
      )
    }
    if (ctx.kind === 'character-state') {
      return (
        <CharacterStatePanel
          characterId={ctx.characterId}
          characters={timelineCharacters}
          energy={ctx.stateSnapshot?.energy ?? energyAtPlayhead.get(ctx.characterId)}
          activeInterventions={ctx.stateSnapshot?.activeInterventions}
        />
      )
    }
    if (ctx.kind === 'ult-effects') {
      return (
        <UltEffectsPanel
          casterId={ctx.casterId}
          targets={ctx.targets}
          characters={timelineCharacters}
        />
      )
    }
    if (ctx.kind === 'ult-caster') {
      return (
        <UltCasterPanel
          timing={ctx.timing}
          insertAfterId={ctx.insertAfterId}
          insertBeforeUltId={ctx.insertBeforeUltId}
          characters={timelineCharacters}
          energyAtPlayhead={energyAtPlayhead}
          onDone={() => setRightPanelContext(IDLE_CONTEXT)}
        />
      )
    }
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 16 }}>
        <Text size='xs' c='dimmed'>{t('Panel.EmptyHint' as never)}</Text>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: 24,
      width: 1302,
      background: 'var(--layer-1)',
      borderRadius: 8,
    }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        {/* Character slots: 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', gap: 12 }}>
          {slots.map((slot, i) => (
            <CharacterSlotCard
              key={i}
              slotIndex={i}
              slot={slot}
              characterName={slot.characterId ? t(`${slot.characterId as CharacterId}.Name`) : null}
              baseSpd={baseSpdMap[i]}
            />
          ))}
        </div>

        {/* Action Display Panel */}
        <div style={{
          flex: 1, minWidth: 0, height: SIDE_PANEL_HEIGHT,
          background: 'var(--layer-2)', boxShadow: 'var(--shadow-card)',
          borderRadius: 6, padding: 12, overflow: 'hidden',
        }}>
          <ActionDisplayPanel
            characters={timelineCharacters}
            simEvents={simEvents}
            activeContext={rightPanelContext}
            onContextChange={setRightPanelContext}
          />
        </div>

        {/* Right column: SP bar + context panel */}
        <div style={{ flex: 1, minWidth: 0, height: SIDE_PANEL_HEIGHT, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            height: 36, flexShrink: 0,
            background: 'var(--layer-2)', boxShadow: 'var(--shadow-card)',
            borderRadius: 6, padding: '0 12px',
          }}>
            <SpBar sp={teamSpAtPlayhead.sp} spMax={teamSpAtPlayhead.spMax} />
          </div>
          <div style={{
            flex: 1, minWidth: 0,
            background: 'var(--layer-2)', boxShadow: 'var(--shadow-card)',
            borderRadius: 6, padding: 12, overflow: 'hidden',
          }}>
            {renderRightPanel()}
          </div>
        </div>
      </div>

      <Timeline interventions={interventions} rowCount={rowCount} simEvents={simEvents} />
    </div>
  )
}
