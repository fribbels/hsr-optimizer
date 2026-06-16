import { Button, Switch } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { InterventionListPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/InterventionListPanel'
import { TimelineRow } from 'lib/tabs/tabAvVisualizer/timeline/TimelineRow'
import type { Intervention, SimEvent } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type TimelineCharacter = {
  id: string
  name: string
  spd: number
  baseSpd: number  // White value (no relics), used for percent-based speed buff math
  color: string
  slotIndex: number
}

// Sim event plus the display fields needed for rendering (color, character name, slotIndex), enriched once by
// Timeline and passed down to Row
export type EnrichedSimEvent = SimEvent & {
  color: string
  characterName: string
  slotIndex: number
}

// Context for opening the intervention list panel: recorded when an avatar marker or empty ruler space is clicked
export type MarkerClickContext = {
  triggerAv: number
  sourceCharId?: string  // From an ActionMarker click, used to pre-fill the triggering source
}

type TimelineProps = {
  characters: TimelineCharacter[]
  interventions: Intervention[]
  rowCount: number
}

export function Timeline({ characters, interventions, rowCount }: TimelineProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const mocFirstRow = useAVVisualTabStore((s) => s.mocFirstRow)
  const totalAv = AvVisualTabController.getTotalAv(rowCount, mocFirstRow)
  const [panelCtx, setPanelCtx] = useState<MarkerClickContext | null>(null)

  // Run the simulation engine to get all action events
  const simEvents = useMemo(() => {
    const charMap = new Map(characters.map((c) => [c.id, c]))
    return AvVisualTabController.simulate(characters, interventions, totalAv).map((e): EnrichedSimEvent => ({
      ...e,
      color: charMap.get(e.characterId)?.color ?? '#888',
      characterName: charMap.get(e.characterId)?.name ?? e.characterId,
      slotIndex: charMap.get(e.characterId)?.slotIndex ?? 0,
    }))
  }, [characters, interventions, totalAv])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {Array.from({ length: rowCount }, (_, i) => {
        const rowStart = AvVisualTabController.getRowStart(i, mocFirstRow)
        const rowSize = AvVisualTabController.getRowSize(i, mocFirstRow)
        const rowEnd = rowStart + rowSize
        return (
          <TimelineRow
            key={i}
            rowStart={rowStart}
            rowSize={rowSize}
            simEvents={simEvents.filter((e) => e.av >= rowStart && e.av < rowEnd)}
            interventions={interventions.filter((iv) => iv.triggerAv >= rowStart && iv.triggerAv < rowEnd)}
            onMarkerClick={setPanelCtx}
            onRulerClick={(av) => setPanelCtx({ triggerAv: av })}
            topRightOverlay={i === 0 ? (
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                borderRadius: 6,
                padding: '2px 8px',
              }}>
                <Switch
                  size='xs'
                  label={tAv('Timeline.MocToggle')}
                  checked={mocFirstRow}
                  onChange={(e) => AvVisualTabController.setMocFirstRow(e.currentTarget.checked)}
                />
              </div>
            ) : undefined}
          />
        )
      })}

      <Button
        variant='default'
        size='xs'
        leftSection={<IconPlus size={12} />}
        onClick={AvVisualTabController.addRow}
        style={{ marginTop: 4, alignSelf: 'flex-start' }}
      >
        {tAv('Timeline.AddRow')}
      </Button>

      {/* key changes with triggerAv+sourceCharId to ensure the form state resets when switching AV */}
      <InterventionListPanel
        key={panelCtx ? `${panelCtx.triggerAv}-${panelCtx.sourceCharId ?? ''}` : 'closed'}
        opened={panelCtx !== null}
        onClose={() => setPanelCtx(null)}
        triggerAv={panelCtx?.triggerAv ?? 0}
        initialSourceCharId={panelCtx?.sourceCharId}
        characters={characters}
        simEvents={simEvents}
      />
    </div>
  )
}
