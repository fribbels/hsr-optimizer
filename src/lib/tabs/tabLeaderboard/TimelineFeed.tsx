import { TimelineEventType } from 'leaderboard/timeline/timelineTypes'
import type { TimelineEvent, TimelineNewBestEvent } from 'leaderboard/timeline/timelineTypes'
import { Assets } from 'lib/rendering/assets'
import classes from 'lib/tabs/tabLeaderboard/LeaderboardHeader.module.css'
import { useTranslation } from 'react-i18next'

const MAX_FEED_ENTRIES = 8

function formatRelativeTime(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 24) return `${Math.max(1, hours)}h`

  const days = Math.floor(hours / 24)
  return `${days}d`
}

function isNewBest(event: TimelineEvent): event is TimelineNewBestEvent {
  return event.type === TimelineEventType.NEW_BEST
}

function RankDeltaCell({ event }: { event: TimelineEvent }) {
  if (!isNewBest(event)) {
    return <span className={classes.cellNewLabel}>new</span>
  }

  const delta = event.previousRank - event.rank
  if (delta > 0) {
    return <span className={classes.cellGreen}>&#9650; {delta}</span>
  }

  return <span className={classes.cellDash}>&mdash;</span>
}

function ScoreDeltaCell({ event }: { event: TimelineEvent }) {
  if (!isNewBest(event)) {
    return <span className={classes.cellNewLabel}>new</span>
  }

  const delta = (event.score - event.previousScore) * 100
  return <span className={classes.cellGreen}>+{delta.toFixed(1)}%</span>
}

export function TimelineFeed({ events }: { events: TimelineEvent[] }) {
  const { t: tGame } = useTranslation('gameData')
  const displayed = events.slice(0, MAX_FEED_ENTRIES)

  if (displayed.length === 0) return null

  return (
    <div className={classes.feedContainer}>
      <span className={classes.feedHeader}>Timeline</span>
      <div className={classes.feedGrid}>
        {displayed.map((event) => {
          const characterId = event.characterId
          const nameKey = characterId.startsWith('80') ? 'LongName' : 'Name'
          const name = tGame(`Characters.${characterId}.${nameKey}`)
          const scorePercent = (event.score * 100).toFixed(1)

          return (
            <div key={`${characterId}#${event.date}`} className={classes.feedRow}>
              <span className={classes.cellTime}>{formatRelativeTime(event.date)}</span>
              <span className={classes.cellDivider} />
              <span className={classes.cellRankDelta}><RankDeltaCell event={event} /></span>
              <img
                src={Assets.getCharacterAvatarById(characterId)}
                className={classes.cellAvatar}
              />
              <span className={classes.cellName}>{name}</span>
              <span className={classes.cellScore}>{scorePercent}%</span>
              <span className={classes.cellScoreDelta}><ScoreDeltaCell event={event} /></span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
