import type { TFunction } from 'i18next'
import {
  TIMELINE_MIN_SCORE,
  TimelineEventType,
} from 'leaderboard/timeline/timelineTypes'
import type { TimelineEvent } from 'leaderboard/timeline/timelineTypes'
import { Assets } from 'lib/rendering/assets'
import classes from 'lib/tabs/tabLeaderboard/LeaderboardHeader.module.css'
import { selectLeaderboardBuild } from 'lib/tabs/tabLeaderboard/leaderboardTabController'
import { percentageToLocaleString } from 'lib/utils/i18nUtils'
import { truncate10ths } from 'lib/utils/mathUtils'
import { useTranslation } from 'react-i18next'

const MAX_FEED_ENTRIES = 100
const MS_PER_HOUR = 1000 * 60 * 60

type TimelineTFunction = TFunction<'leaderboardTab', 'Timeline'>

function formatRelativeTime(dateString: string, t: TimelineTFunction): string {
  const diffMs = Date.now() - new Date(dateString).getTime()
  if (diffMs < 0) return t('HoursAgo', { count: 0 })

  const hours = Math.floor(diffMs / MS_PER_HOUR)
  if (hours < 1) return t('HoursAgo', { count: 1 })
  if (hours < 24) return t('HoursAgo', { count: hours })

  return t('DaysAgo', { count: Math.floor(hours / 24) })
}

function renderRank(event: TimelineEvent) {
  const style = event.type === TimelineEventType.NEW_CHARACTER
    ? classes.cellNewLabel
    : classes.cellGreen
  return <span className={style}># {event.rank}</span>
}

function renderScoreDelta(event: TimelineEvent, t: TimelineTFunction) {
  if (event.type === TimelineEventType.NEW_CHARACTER) {
    return <span className={classes.cellNewLabel}>{t('New')}</span>
  }
  const clampedPrevious = Math.max(event.previousScore, TIMELINE_MIN_SCORE)
  const delta = (event.score - clampedPrevious) * 100
  return <span className={classes.cellGreen}>+{percentageToLocaleString(delta, 1)}</span>
}

function handleRowClick(event: TimelineEvent) {
  selectLeaderboardBuild(event.buildId, {
    characterId: event.characterId,
    configType: event.configType,
  })
}

export function TimelineFeed({ events }: { events: TimelineEvent[] }) {
  const { t: tGame } = useTranslation('gameData')
  const { t } = useTranslation('leaderboardTab', { keyPrefix: 'Timeline' })
  const displayed = events.slice(0, MAX_FEED_ENTRIES)

  if (displayed.length === 0) return null

  return (
    <div className={classes.feedContainer}>
      <span className={classes.feedHeader}>{t('Header')}</span>
      <div className={classes.feedGrid}>
        {displayed.map((event) => {
          const characterId = event.characterId
          const nameKey = characterId.startsWith('80') ? 'LongName' : 'Name'
          const name = tGame(`Characters.${characterId}.${nameKey}`)
          const scorePercent = percentageToLocaleString(truncate10ths(event.score * 100), 1)

          return (
            <div
              key={`${event.candidateId}#${event.configType}#${event.type}#${event.date}`}
              className={classes.feedRow}
              onClick={() => handleRowClick(event)}
            >
              <span className={classes.cellTime}>{formatRelativeTime(event.date, t)}</span>
              <span className={classes.cellDivider} />
              <span className={classes.cellRankDelta}>{renderRank(event)}</span>
              <img
                src={Assets.getCharacterAvatarById(characterId)}
                className={classes.cellAvatar}
              />
              <span className={classes.cellName}>{name}</span>
              <span className={classes.cellScore}>{scorePercent}</span>
              <span className={classes.cellScoreDelta}>{renderScoreDelta(event, t)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
