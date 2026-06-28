import { TimelineEventType } from 'leaderboard/timeline/timelineTypes'
import type { TimelineEvent } from 'leaderboard/timeline/timelineTypes'
import { Assets } from 'lib/rendering/assets'
import classes from 'lib/tabs/tabLeaderboard/LeaderboardHeader.module.css'
import { getBuildIndex } from 'lib/tabs/tabLeaderboard/leaderboardDataLoader'
import { selectLeaderboardCharacter } from 'lib/tabs/tabLeaderboard/leaderboardTabController'
import { useTranslation } from 'react-i18next'

const MAX_FEED_ENTRIES = 8
const MS_PER_HOUR = 1000 * 60 * 60

function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime()
  if (diffMs < 0) return '0h'

  const hours = Math.floor(diffMs / MS_PER_HOUR)
  if (hours < 1) return '<1h'
  if (hours < 24) return `${hours}h`

  return `${Math.floor(hours / 24)}d`
}

function renderRankDelta(event: TimelineEvent) {
  if (event.type === TimelineEventType.NEW_CHARACTER) {
    return <span className={classes.cellNewLabel}>new</span>
  }
  const delta = event.previousRank - event.rank
  if (delta > 0) {
    return <span className={classes.cellGreen}>&#9650; {delta}</span>
  }
  return <span className={classes.cellDash}>&mdash;</span>
}

function renderScoreDelta(event: TimelineEvent) {
  if (event.type === TimelineEventType.NEW_CHARACTER) {
    return <span className={classes.cellNewLabel}>new</span>
  }
  const delta = (event.score - event.previousScore) * 100
  return <span className={classes.cellGreen}>+{delta.toFixed(1)}%</span>
}

function handleRowClick(event: TimelineEvent) {
  const index = getBuildIndex()
  const match = index?.get(event.buildId)
  if (match) {
    selectLeaderboardCharacter(match.characterId, {
      configType: match.configType,
      teamId: match.teamId,
      buildId: event.buildId,
    })
  }
}

export function TimelineFeed({ events }: { events: TimelineEvent[] }) {
  const { t: tGame } = useTranslation('gameData')
  const displayed = events.slice(0, MAX_FEED_ENTRIES)

  if (displayed.length === 0) return null

  return (
    <div className={classes.feedContainer}>
      <span className={classes.feedHeader}>New Bests</span>
      <div className={classes.feedGrid}>
        {displayed.map((event) => {
          const characterId = event.characterId
          const nameKey = characterId.startsWith('80') ? 'LongName' : 'Name'
          const name = tGame(`Characters.${characterId}.${nameKey}`)
          const scorePercent = (event.score * 100).toFixed(1)

          return (
            <div key={`${characterId}#${event.type}#${event.date}`} className={classes.feedRow} onClick={() => handleRowClick(event)}>
              <span className={classes.cellTime}>{formatRelativeTime(event.date)}</span>
              <span className={classes.cellDivider} />
              <span className={classes.cellRankDelta}>{renderRankDelta(event)}</span>
              <img
                src={Assets.getCharacterAvatarById(characterId)}
                className={classes.cellAvatar}
              />
              <span className={classes.cellName}>{name}</span>
              <span className={classes.cellScore}>{scorePercent}%</span>
              <span className={classes.cellScoreDelta}>{renderScoreDelta(event)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
