import { Button } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getPreviewRelics, getShowcaseStats } from 'lib/characterPreview/characterPreviewController'
import { Stats } from 'lib/constants/constants'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import { CharacterSlotCard } from 'lib/tabs/tabAvVisualizer/characterSlotCard/CharacterSlotCard'
import { GlobalActionsPanel } from 'lib/tabs/tabAvVisualizer/GlobalActionsPanel'
import { ActionConfigPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionConfigPanel'
import { ActionDisplayPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionDisplayPanel'
import { SpBar } from 'lib/tabs/tabAvVisualizer/interventionPanel/SpBar'
import { AddBranchPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/AddBranchPanel'
import { CharacterStatePanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/CharacterStatePanel'
import { EnergyOverviewPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/EnergyOverviewPanel'
import { InterventionEditPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/InterventionEditPanel'
import { UltCasterPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/UltCasterPanel'
import { UltEffectsPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/UltEffectsPanel'
import { Timeline, type EnrichedSimEvent } from 'lib/tabs/tabAvVisualizer/timeline/Timeline'
import type { ActiveIntervention, BattleEntity, RightPanelContext } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import { useShallow } from 'zustand/react/shallow'

// Fixed height for the two side panels, matching the 2-row character slot grid (CharacterSlotCard is 256px
// tall, see CharacterSlotCard.module.css's .emptyCard) so panel content can't grow the whole row taller —
// it scrolls internally instead (each panel's own root sets height: '100%' + overflowY: 'auto').
const SIDE_PANEL_HEIGHT = 256 * 2 + 12

const IDLE_CONTEXT: RightPanelContext = { kind: 'idle' }

export function AvVisualizerTab() {
  const slots = useAVVisualTabStore((s) => s.savedSession.slots)
  // Every Wave-scoped field (rows/interventions/overrides/Ult insertions/MoC toggle) is read off the
  // CURRENT Wave — switching Waves transparently swaps all of this out, see useAVVisualTabStore's Wave.
  const currentWaveIndex = useAVVisualTabStore((s) => s.savedSession.currentWaveIndex)
  const waveCount = useAVVisualTabStore((s) => s.savedSession.waves.length)
  const rowCount = useAVVisualTabStore((s) => s.savedSession.waves[s.savedSession.currentWaveIndex].rowCount)
  const mocFirstRow = useAVVisualTabStore((s) => s.savedSession.waves[s.savedSession.currentWaveIndex].mocFirstRow)
  const playheadAv = useAVVisualTabStore((s) => s.playheadAv)
  const interventions = useAVVisualTabStore((s) => s.savedSession.waves[s.savedSession.currentWaveIndex].interventions)
  const actionOverrides = useAVVisualTabStore((s) => s.savedSession.waves[s.savedSession.currentWaveIndex].actionOverrides)
  const ultInsertions = useAVVisualTabStore((s) => s.savedSession.waves[s.savedSession.currentWaveIndex].ultInsertions)
  const charactersById = useCharacterStore((s) => s.charactersById)
  const relicsById = useRelicStore(useShallow((s) => s.relicsById))
  const { t } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const { t: tAv } = useTranslation('avVisualizerTab')

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

  // ERR bonus fraction (e.g. 0.185 for +18.5%) from the character's current build; 0 (no character / no
  // bonus / unreadable) when there's nothing to compute from — unlike SPD there's no in-game "white value"
  // for ERR, base is always 0% before relics.
  const baseErrMap = useMemo(() =>
    slots.map((slot) => {
      if (!slot.characterId) return 0
      const character = charactersById[slot.characterId as CharacterId]
      if (!character) return 0
      const { displayRelics } = getPreviewRelics(ShowcaseSource.CHARACTER_TAB, character, relicsById, null)
      return getShowcaseStats(character, displayRelics, null)[Stats.ERR] ?? 0
    }),
  [slots, charactersById, relicsById])

  // Real Crit DMG (fraction) from the character's current build — companions with no gear of their own
  // (e.g. Mimi) copy this 1:1 at summon time (BattleEntity.cd), used by effects that scale off the
  // caster's own CD (InterventionTemplate's casterStatScaling).
  const baseCdMap = useMemo(() =>
    slots.map((slot) => {
      if (!slot.characterId) return 0
      const character = charactersById[slot.characterId as CharacterId]
      if (!character) return 0
      const { displayRelics } = getPreviewRelics(ShowcaseSource.CHARACTER_TAB, character, relicsById, null)
      return getShowcaseStats(character, displayRelics, null)[Stats.CD] ?? 0
    }),
  [slots, charactersById, relicsById])

  // The character's real Eidolon level (0-6); slot.eidolonOverride takes priority when manually set.
  const baseEidolonMap = useMemo(() =>
    slots.map((slot) => {
      if (!slot.characterId) return 0
      return charactersById[slot.characterId as CharacterId]?.form.characterEidolon ?? 0
    }),
  [slots, charactersById])

  const timelineCharacters = useMemo(() => {
    const result: BattleEntity[] = []
    slots.forEach((slot, i) => {
      if (!slot.characterId) return
      const effectiveSpd = slot.spdOverride ?? baseSpdMap[i]
      if (!effectiveSpd) return
      const eidolon = slot.eidolonOverride ?? baseEidolonMap[i]
      result.push({
        id: slot.characterId,
        type: 'character',
        name: t(`${slot.characterId as CharacterId}.Name`),
        spd: effectiveSpd,
        baseSpd: whiteSpdMap[i] ?? effectiveSpd,
        err: slot.errOverride ?? baseErrMap[i],
        eidolon,
        cd: baseCdMap[i],
        color: AvVisualTabController.getCharacterColor(slot.characterId, undefined, i),
        slotIndex: i,
      })

      // A character's companion (memosprite/summon/marker): always added here, even when
      // presentFromStart is false — this array doubles as the display/enrichment lookup table (name,
      // color, slotIndex, entityType for Timeline/panels), so a dynamically-summoned companion needs an
      // entry here too, well before she's actually summoned, so the Timeline can reserve her lane from
      // the start and so her BattleEvents (once she is summoned) enrich correctly instead of silently
      // falling back to "character"/slot 0. Whether she's actually handed to the engine as an initial
      // entity is decided separately, in simulationEntities below.
      const companion = getBattleConfig(slot.characterId, eidolon)?.companion
      if (!companion) return
      // ERR/CD (and every other non-SPD non-HP stat) matches the owner exactly per spec — only SPD/HP
      // differ for a memosprite. Eidolon doesn't carry over: the companion's own kit (if any) isn't
      // eidolon-gated the same way the owner's is.
      result.push({
        id: companion.characterId,
        type: companion.type,
        ownerId: slot.characterId,
        name: t(`${companion.characterId as CharacterId}.Name`, { defaultValue: companion.characterId }),
        spd: companion.baseSpd,
        baseSpd: companion.baseSpd,
        err: slot.errOverride ?? baseErrMap[i],
        eidolon: 0,
        cd: baseCdMap[i],
        color: AvVisualTabController.getCharacterColor(companion.characterId, slot.characterId, i),
        slotIndex: i,
      })
    })
    return result
  }, [slots, baseSpdMap, whiteSpdMap, baseErrMap, baseCdMap, baseEidolonMap, t])

  // The subset actually handed to the engine as initial entities — a companion with
  // presentFromStart:false is excluded here (the engine creates it mid-battle via 'summon_companion'
  // instead, see simulateBattle.ts's summonCompanion()), even though it's still in timelineCharacters
  // above for display/enrichment purposes.
  const simulationEntities = useMemo(() =>
    timelineCharacters.filter((c) =>
      !c.ownerId || getBattleConfig(c.ownerId)?.companion?.presentFromStart !== false),
  [timelineCharacters])

  // Whether any selected character has a companion at all (memosprite/summon/marker), regardless of
  // whether it's actually been summoned yet — drives whether the Timeline reserves a companion lane on
  // every row from the start, so the layout doesn't jump the moment one is dynamically summoned.
  const hasCompanions = useMemo(() =>
    timelineCharacters.some((c) => c.type !== 'character'),
  [timelineCharacters])

  const totalAv = AvVisualTabController.getTotalAv(rowCount, mocFirstRow)

  const [simEvents, energyTimeline, initialActiveInterventions] = useMemo(() => {
    const charMap = new Map(timelineCharacters.map((c) => [c.id, c]))
    const overrideMap = new Map(
      actionOverrides.map((o) => [`${o.characterId}:${o.actionIndex}`, o]),
    )
    const result = AvVisualTabController.simulate(simulationEntities, interventions, totalAv)
    const enriched = result.events.map((e): EnrichedSimEvent => ({
      ...e,
      color:          charMap.get(e.characterId)?.color     ?? '#888',
      characterName:  charMap.get(e.characterId)?.name      ?? e.characterId,
      slotIndex:      charMap.get(e.characterId)?.slotIndex ?? 0,
      entityType:     charMap.get(e.characterId)?.type      ?? 'character',
      currentTargets: overrideMap.get(`${e.characterId}:${e.actionIndex}`)?.targets,
    }))
    return [enriched, result.energyTimeline, result.initialActiveInterventions] as const
  }, [timelineCharacters, simulationEntities, interventions, totalAv, actionOverrides, ultInsertions])

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

  // Mirrors energyAtPlayhead but for buffs — needed by character-specific energy bars (e.g. SaberEnergyBar
  // reading Reactor Core stacks) in panels that otherwise only track raw energy numbers, not buff state.
  // Coarser than energyAtPlayhead: only updates once per action (BattleEvent.stateAfter), not at every
  // manually-added-intervention checkpoint — fine for this purpose, unlike energy this isn't expected to
  // change off-action.
  const activeInterventionsAtPlayhead = useMemo(() => {
    // Seeded with onBattleStart's result (av=0, before any action ever happens) — without this, a
    // character's battle-start-granted buffs (e.g. Saber's Reactor Core from her talent/technique)
    // wouldn't show up at all until their own first action produces a BattleEvent to read from.
    const map = new Map<string, ActiveIntervention[]>(Object.entries(initialActiveInterventions))
    for (const ev of simEvents) {
      if (ev.av > playheadAv + 0.005) break
      for (const [charId, state] of Object.entries(ev.stateAfter)) {
        if (state.activeInterventions) map.set(charId, state.activeInterventions)
      }
    }
    return map
  }, [simEvents, playheadAv, initialActiveInterventions])

  // When adding a new ult right after an already-inserted one (same timing anchor, stacked in sequence —
  // see ActionDisplayPanel's "add" button under an ult card), the prior ult's own resulting event (not
  // the normal action it's anchored to) is what reflects "state once that prior ult has resolved". Shared
  // by both energy and buff lookups below so neither shows stale pre-prior-ult data.
  const priorUltEvent = useMemo(() => {
    if (rightPanelContext.kind !== 'ult-caster' || !rightPanelContext.insertAfterId) return undefined
    return simEvents.find((e) => e.turnKind === 'ult' && e.ultInsertionId === rightPanelContext.insertAfterId)
  }, [rightPanelContext, simEvents])

  // UltCasterPanel needs energy as of the specific insertion point, not the coarse per-AV checkpoint
  // energyAtPlayhead provides (which reflects the whole action's effects, basic/skill included).
  // during_action should show energy before this action's basic/skill resolves; after_action after.
  const ultCasterEnergyMap = useMemo(() => {
    if (rightPanelContext.kind !== 'ult-caster') return energyAtPlayhead
    if (priorUltEvent) return new Map(Object.entries(priorUltEvent.stateAfter).map(([id, s]) => [id, s.energy]))
    const { timing } = rightPanelContext
    if (timing.type === 'at_av') return energyAtPlayhead

    const match = simEvents.find((e) =>
      e.characterId === timing.charId && e.actionIndex === timing.actionIndex && e.turnKind !== 'ult'
    )
    if (!match) return energyAtPlayhead

    const snapshot = timing.type === 'during_action' ? match.stateBefore : match.stateAfter
    return new Map(Object.entries(snapshot).map(([id, s]) => [id, s.energy]))
  }, [rightPanelContext, simEvents, energyAtPlayhead, priorUltEvent])

  // Same prior-ult override for the buff data UltCasterPanel's character-specific energy bars need.
  const ultCasterActiveInterventionsMap = useMemo(() => {
    if (priorUltEvent) {
      return new Map(Object.entries(priorUltEvent.stateAfter).map(([id, s]) => [id, s.activeInterventions]))
    }
    return activeInterventionsAtPlayhead
  }, [priorUltEvent, activeInterventionsAtPlayhead])

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
          hitCount={ctx.hitCount}
          stateSnapshot={ctx.stateSnapshot}
        />
      )
    }
    if (ctx.kind === 'character-state') {
      // No actionIndex means this came from clicking an avatar in the idle energy overview rather than a
      // specific historical action — i.e. it's tracking the live Playhead, not a frozen snapshot. That's
      // also the only case with no stateSnapshot of its own, so both fallbacks (energy/buffs) and the
      // back button below key off the same actionIndex check.
      const isLivePlayheadView = ctx.actionIndex === undefined
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {isLivePlayheadView && (
            <Button
              size='xs'
              variant='subtle'
              color='gray'
              leftSection={<IconArrowLeft size={14} />}
              onClick={() => setRightPanelContext(IDLE_CONTEXT)}
              style={{ alignSelf: 'flex-start' }}
            >
              {tAv('Panel.Back')}
            </Button>
          )}
          <div style={{ flex: 1, minHeight: 0 }}>
            <CharacterStatePanel
              characterId={ctx.characterId}
              characters={timelineCharacters}
              energy={ctx.stateSnapshot?.energy ?? energyAtPlayhead.get(ctx.characterId)}
              activeInterventions={ctx.stateSnapshot?.activeInterventions ?? (isLivePlayheadView ? activeInterventionsAtPlayhead.get(ctx.characterId) : undefined)}
            />
          </div>
        </div>
      )
    }
    if (ctx.kind === 'ult-effects' || ctx.kind === 'extra-effects') {
      return (
        <UltEffectsPanel
          casterId={ctx.casterId}
          targets={ctx.targets}
          characters={timelineCharacters}
          kind={ctx.kind === 'extra-effects' ? 'extra' : 'ult'}
        />
      )
    }
    if (ctx.kind === 'ult-caster') {
      return (
        <UltCasterPanel
          timing={ctx.timing}
          insertAfterId={ctx.insertAfterId}
          insertBeforeUltId={ctx.insertBeforeUltId}
          afterItemId={ctx.afterItemId}
          characters={timelineCharacters}
          energyAtPlayhead={ultCasterEnergyMap}
          activeInterventionsAtPlayhead={ultCasterActiveInterventionsMap}
          onDone={() => setRightPanelContext(IDLE_CONTEXT)}
        />
      )
    }
    return (
      <EnergyOverviewPanel
        characters={timelineCharacters}
        energyAtPlayhead={energyAtPlayhead}
        activeInterventionsAtPlayhead={activeInterventionsAtPlayhead}
        onContextChange={setRightPanelContext}
      />
    )
  }

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
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
                baseErr={baseErrMap[i]}
                baseEidolon={baseEidolonMap[i]}
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

        <Timeline interventions={interventions} rowCount={rowCount} simEvents={simEvents} hasCompanions={hasCompanions} />
      </div>

      {/* Sticky sidebar for whole-session operations (export/import for now) — stays in view as the
          page scrolls past the (potentially tall) Timeline below it, same idea as OptimizerSidebar. */}
      <div style={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
        <GlobalActionsPanel
          energyAtPlayhead={energyAtPlayhead}
          activeInterventionsAtPlayhead={activeInterventionsAtPlayhead}
          teamSpAtPlayhead={teamSpAtPlayhead}
        />
      </div>
    </div>
  )
}
