import { Assets } from 'lib/rendering/assets'
import { OVERLAY_SCROLLBAR_OPTIONS } from 'lib/ui/selectors/selectConstants'
import { truncate10ths } from 'lib/utils/mathUtils'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import {
  useCallback,
  useRef,
} from 'react'
import { selectLeaderboardEntry } from 'lib/tabs/tabLeaderboard/leaderboardTabController'
import type { LeaderboardEntry } from 'lib/tabs/tabLeaderboard/leaderboardTabTypes'
import { LeaderboardTeamDisplay } from 'lib/tabs/tabLeaderboard/LeaderboardTeamDisplay'
import classes from 'lib/tabs/tabLeaderboard/RankListPanel.module.css'
import { useLeaderboardTabStore } from 'lib/tabs/tabLeaderboard/useLeaderboardTabStore'

const MEDAL_COLORS: Record<number, string> = {
  1: '#e0b420',
  2: '#b8b8b8',
  3: '#c08848',
}

const PODIUM_BACKGROUNDS: Record<number, string> = {
  1: 'rgba(224, 180, 32, 0.22)',
  2: 'rgba(184, 184, 184, 0.18)',
  3: 'rgba(192, 136, 72, 0.16)',
}

function rowColorBackground(rank: number): string | undefined {
  return PODIUM_BACKGROUNDS[rank]
}

const EIDOLON_COLORS: Record<number, string> = { 0: '#69f0ae', 1: '#81d4fa', 2: '#d4b0e0', 6: '#f2d49b' }
const EIDOLON_BORDER_ALPHA = '26'
const EIDOLON_FILL_ALPHA = '15'

function RankListEntry({ entry, isSelected }: {
  entry: LeaderboardEntry,
  isSelected: boolean,
}) {
  const medalColor = MEDAL_COLORS[entry.rank]
  const rowBackground = rowColorBackground(entry.rank)
  const rowColorKeep = isSelected && medalColor ? ` ${classes.rowColorKeep}` : ''
  const scorePercent = entry.score * 100
  const eidolon = entry.characterEidolon
  const eidolonLabel = `E${eidolon}`
  const lcId = entry.minifiedCharacter.q?.t ? String(entry.minifiedCharacter.q.t) : null
  const lcSuperimpose = entry.minifiedCharacter.q?.r ?? 1
  const colorKey = eidolon >= 6 ? 6 : eidolon >= 2 ? 2 : eidolon
  const ringColor = EIDOLON_COLORS[colorKey] ?? EIDOLON_COLORS[0]
  const borderColor = ringColor + EIDOLON_BORDER_ALPHA
  const fillColor = ringColor + EIDOLON_FILL_ALPHA

  return (
    <div
      className={`${classes.tableRow} ${isSelected ? classes.tableRowSelected : ''}${rowColorKeep}`}
      onClick={() => selectLeaderboardEntry(entry.buildId)}
      style={{ '--eidolon-ring': ringColor, '--eidolon-border': borderColor, '--eidolon-fill': fillColor, 'background': rowBackground } as React.CSSProperties}
    >
      <span className={classes.colRank}>
        {medalColor
          ? <span className={classes.rankBadge} style={{ background: medalColor, color: '#000' }}>{entry.rank}</span>
          : <span className={classes.rankNumber}>{entry.rank}</span>}
      </span>

      <span className={classes.colScore}>
        <span className={classes.scoreValue}>{truncate10ths(scorePercent).toFixed(1)}%</span>
      </span>

      <span className={classes.eidolonTag}>{eidolonLabel} S{lcSuperimpose}</span>

      <span className={classes.colLightCone}>
        {lcId && <img className={classes.lcIcon} src={Assets.getLightConeIconById(lcId)} />}
      </span>

      <span className={classes.colTeam}>
        <LeaderboardTeamDisplay teammates={entry.team} />
      </span>
    </div>
  )
}

export function RankListPanel() {
  const entries = useLeaderboardTabStore((s) => s.visibleEntries)
  const selectedBuildId = useLeaderboardTabStore((s) => s.selectedBuildId)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()

    const state = useLeaderboardTabStore.getState()
    const list = state.visibleEntries
    if (list.length === 0) return

    const currentIdx = state.selectedBuildId
      ? list.findIndex((entry) => entry.buildId === state.selectedBuildId)
      : -1

    const nextIdx = e.key === 'ArrowDown'
      ? Math.min(currentIdx + 1, list.length - 1)
      : Math.max(currentIdx - 1, 0)

    if (nextIdx === currentIdx) return

    selectLeaderboardEntry(list[nextIdx].buildId)
  }, [])

  const focusContainer = useCallback(() => containerRef.current?.focus({ preventScroll: true }), [])

  if (entries.length === 0) {
    return <div className={classes.container} />
  }

  return (
    <div className={classes.container} ref={containerRef} onKeyDown={handleKeyDown} onClick={focusContainer} tabIndex={0}>
      <OverlayScrollbarsComponent className={classes.list} options={OVERLAY_SCROLLBAR_OPTIONS} defer>
        {entries.map((entry) => (
          <RankListEntry
            key={entry.buildId}
            entry={entry}
            isSelected={entry.buildId === selectedBuildId}
          />
        ))}
      </OverlayScrollbarsComponent>
    </div>
  )
}
