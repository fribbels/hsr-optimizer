import { Button, Switch } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { TimelineRow } from 'lib/tabs/tabAvVisualizer/timeline/TimelineRow'
import type { BattleEntity, BattleEvent, Intervention } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { useTranslation } from 'react-i18next'

// BattleEvent plus the display fields needed for rendering. Computed once in AvVisualizerTab
// (shared with ActionDisplayPanel) and passed down to Timeline / Row.
export type EnrichedSimEvent = BattleEvent & {
  color: string
  characterName: string
  slotIndex: number
  entityType: BattleEntity['type']
  currentTargets?: string[]   // Selected single_ally targets for this action's override (if any)
}

// Re-export so callers that previously imported TimelineCharacter can migrate to BattleEntity.
export type { BattleEntity }

type TimelineProps = {
  interventions: Intervention[]
  rowCount: number
  simEvents: EnrichedSimEvent[]
  // Whether any selected character has a companion at all (memosprite/summon/marker), regardless of
  // whether it's been summoned yet — a structural fact from the team composition, not derived from
  // simEvents, so the lane reserves space on every row from the start instead of only once a companion's
  // first event actually appears (which would otherwise shift the layout the moment one is summoned).
  hasCompanions: boolean
}

export function Timeline({ interventions, rowCount, simEvents, hasCompanions }: TimelineProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const mocFirstRow = useAVVisualTabStore((s) => s.savedSession.mocFirstRow)
  const playheadAv = useAVVisualTabStore((s) => s.playheadAv)

  // memosprite/summon/marker entities don't fit into the 4-slot character avatar stack — they're
  // rendered in a separate companion lane within each row instead (see TimelineRow).
  const characterEvents = simEvents.filter((e) => e.entityType === 'character')
  const companionEvents = simEvents.filter((e) => e.entityType !== 'character')

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
            simEvents={characterEvents.filter((e) => e.av >= rowStart && e.av < rowEnd)}
            companionEvents={hasCompanions ? companionEvents.filter((e) => e.av >= rowStart && e.av < rowEnd) : undefined}
            interventions={interventions.filter((iv) => iv.triggerAv >= rowStart && iv.triggerAv < rowEnd)}
            onSeek={AvVisualTabController.setPlayheadAv}
            playheadAv={playheadAv}
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
    </div>
  )
}
