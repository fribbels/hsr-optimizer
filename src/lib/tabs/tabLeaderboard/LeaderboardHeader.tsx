import { Assets } from 'lib/rendering/assets'
import { AppPages } from 'lib/tabs/navigation/constants'
import { navigateTo } from 'lib/tabs/navigation/utils'
import classes from 'lib/tabs/tabLeaderboard/LeaderboardHeader.module.css'
import { LeaderboardUserRanksCard } from 'lib/tabs/tabLeaderboard/LeaderboardUserRanksCard'
import { TimelineFeed } from 'lib/tabs/tabLeaderboard/TimelineFeed'
import { useLeaderboardTabStore } from 'lib/tabs/tabLeaderboard/useLeaderboardTabStore'
import { useTranslation } from 'react-i18next'

function goToShowcase() {
  navigateTo(AppPages.SHOWCASE)
}

export function LeaderboardHeader() {
  const timelineEvents = useLeaderboardTabStore((s) => s.timelineEvents)
  const { t } = useTranslation('leaderboardTab', { keyPrefix: 'Header' })

  return (
    <div className={classes.header}>
      <div className={classes.background}>
        <img
          src={Assets.getLeaderboardHeaderBg()}
          className={classes.backgroundImage}
        />
      </div>

      <div className={classes.overlay} />

      <div className={classes.content}>
        <div className={classes.titleColumn}>
          <span className={classes.title}>{t('Title')}</span>
          <span className={classes.subtitle}>{t('Subtitle')}</span>
          <button type='button' className={classes.showcaseButton} onClick={goToShowcase}>
            {t('ShowcaseButton')}
          </button>
        </div>

        <LeaderboardUserRanksCard />

        {timelineEvents.length > 0 && (
          <div className={classes.glassPanel}>
            <TimelineFeed events={timelineEvents} />
          </div>
        )}
      </div>
    </div>
  )
}
