import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getPreviewRelics, getShowcaseStats } from 'lib/characterPreview/characterPreviewController'
import { Stats } from 'lib/constants/constants'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { CharacterSlotCard } from 'lib/tabs/tabAvVisualizer/characterSlotCard/CharacterSlotCard'
import { SLOT_COLORS } from 'lib/tabs/tabAvVisualizer/constants'
import { ActionDisplayPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionDisplayPanel'
import { EditPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/EditPanel'
import { Timeline, type EnrichedSimEvent, type TimelineCharacter } from 'lib/tabs/tabAvVisualizer/timeline/Timeline'
import type { EditRequest } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import { useShallow } from 'zustand/react/shallow'

// Fixed height for the two side panels, matching the 2-row character slot grid (CharacterSlotCard is 220px
// tall, see CharacterSlotCard.module.css's .emptyCard) so panel content can't grow the whole row taller —
// it scrolls internally instead (each panel's own root sets height: '100%' + overflowY: 'auto').
const SIDE_PANEL_HEIGHT = 220 * 2 + 12

export function AvVisualizerTab() {
  const slots = useAVVisualTabStore((s) => s.savedSession.slots)
  const rowCount = useAVVisualTabStore((s) => s.savedSession.rowCount)
  const mocFirstRow = useAVVisualTabStore((s) => s.savedSession.mocFirstRow)
  const playheadAv = useAVVisualTabStore((s) => s.playheadAv)
  const interventions = useAVVisualTabStore((s) => s.savedSession.interventions)
  const charactersById = useCharacterStore((s) => s.charactersById)
  const relicsById = useRelicStore(useShallow((s) => s.relicsById))
  const { t } = useTranslation('gameData', { keyPrefix: 'Characters' })

  // Pending add/edit request, shared between ActionDisplayPanel (emits it) and EditPanel (consumes it)
  const [editRequest, setEditRequest] = useState<EditRequest | null>(null)

  // Clear any pending add/edit request whenever the Playhead moves — it's bound to whatever AV was active when
  // it was created, so it becomes stale (wrong target, or would submit at the wrong AV) once the Playhead leaves
  useEffect(() => {
    setEditRequest(null)
  }, [playheadAv])

  // Compute each slot's effective character speed (baseSpd)
  const baseSpdMap = useMemo(() =>
    slots.map((slot) => {
      if (!slot.characterId) return null
      const character = charactersById[slot.characterId as CharacterId]
      if (!character) return null
      const { displayRelics } = getPreviewRelics(ShowcaseSource.CHARACTER_TAB, character, relicsById, null)
      return getShowcaseStats(character, displayRelics, null)[Stats.SPD] ?? null
    }),
  [slots, charactersById, relicsById])

  // White-value speed: the character's base speed (no relics), used for percent-based speed buff math
  const whiteSpdMap = useMemo(() =>
    slots.map((slot) => {
      if (!slot.characterId) return null
      return getGameMetadata().characters[slot.characterId as CharacterId]?.stats[Stats.SPD] ?? null
    }),
  [slots])

  // Character list shared by Timeline and the two side panels: spdOverride takes priority, falling back to
  // baseSpdMap (panel speed); empty slots are skipped
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

  const totalAv = AvVisualTabController.getTotalAv(rowCount, mocFirstRow)

  // Run the simulation engine once here, shared by Timeline and ActionDisplayPanel
  const simEvents = useMemo(() => {
    const charMap = new Map(timelineCharacters.map((c) => [c.id, c]))
    return AvVisualTabController.simulate(timelineCharacters, interventions, totalAv).map((e): EnrichedSimEvent => ({
      ...e,
      color: charMap.get(e.characterId)?.color ?? '#888',
      characterName: charMap.get(e.characterId)?.name ?? e.characterId,
      slotIndex: charMap.get(e.characterId)?.slotIndex ?? 0,
    }))
  }, [timelineCharacters, interventions, totalAv])

  // Keyboard Playhead control: left/right arrow keys move it ±1 AV, ignored while typing in a form field
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return

      // Always lands on the next whole AV tick in that direction, even from a fractional position left behind
      // by a drag/click (floor+1 going right, ceil-1 going left — so a single press never skips a tick)
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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: 24,
      width: 1302, // Matches OptimizerTab.tsx's fixed content width
      background: 'var(--layer-1)',
      borderRadius: 8,
    }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
        {/* Character slots: 2x2 grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, max-content)',
          gap: 12,
        }}>
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

        {/* Action Display Panel: always shows the Playhead's current AV. Fixed height matching the 2x2 slot
        grid; content scrolls internally instead of growing the box (and the whole row) taller. */}
        <div style={{
          flex: 1,
          minWidth: 0,
          height: SIDE_PANEL_HEIGHT,
          background: 'var(--layer-2)',
          boxShadow: 'var(--shadow-card)',
          borderRadius: 6,
          padding: 12,
          overflow: 'hidden',
        }}>
          <ActionDisplayPanel
            characters={timelineCharacters}
            simEvents={simEvents}
            request={editRequest}
            onRequest={setEditRequest}
          />
        </div>

        {/* Edit Panel: idle until ActionDisplayPanel emits an add/edit request. Same fixed height as above. */}
        <div style={{
          flex: 1,
          minWidth: 0,
          height: SIDE_PANEL_HEIGHT,
          background: 'var(--layer-2)',
          boxShadow: 'var(--shadow-card)',
          borderRadius: 6,
          padding: 12,
          overflow: 'hidden',
        }}>
          <EditPanel
            request={editRequest}
            playheadAv={playheadAv}
            characters={timelineCharacters}
            onDone={() => setEditRequest(null)}
          />
        </div>
      </div>

      <Timeline interventions={interventions} rowCount={rowCount} simEvents={simEvents} />
    </div>
  )
}
