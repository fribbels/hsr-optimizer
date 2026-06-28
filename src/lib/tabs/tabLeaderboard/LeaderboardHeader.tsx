import { Assets } from 'lib/rendering/assets'
import { AppPages } from 'lib/tabs/navigation/constants'
import { navigateTo } from 'lib/tabs/navigation/utils'
import classes from 'lib/tabs/tabLeaderboard/LeaderboardHeader.module.css'
import { TimelineFeed } from 'lib/tabs/tabLeaderboard/TimelineFeed'
import { useLeaderboardTabStore } from 'lib/tabs/tabLeaderboard/useLeaderboardTabStore'

function goToShowcase() {
  navigateTo(AppPages.SHOWCASE)
}

export function LeaderboardHeader() {
  const timelineEvents = useLeaderboardTabStore((s) => s.timelineEvents)

  return (
    <div className={classes.header}>
      <div className={classes.background}>
        <img
          src={Assets.getLeaderboardCardBg()}
          className={classes.backgroundImage}
        />
      </div>

      <div className={classes.overlay} />

      <div className={classes.content}>
        <div className={classes.titleColumn}>
          <span className={classes.title}>Leaderboard</span>
          <span className={classes.subtitle}>
            Rankings based on Showcase tab builds, new scores refreshed daily.
          </span>
          <button type="button" className={classes.showcaseButton} onClick={goToShowcase}>
            Go to Showcase &rarr;
          </button>
        </div>

        {timelineEvents.length > 0 && (
          <div className={classes.glassPanel}>
            <TimelineFeed events={timelineEvents} />
          </div>
        )}
      </div>
    </div>
  )
}
