import { UnstyledButton } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons-react'
import { CharacterListPanel } from 'lib/tabs/tabLeaderboard/CharacterListPanel'
import { CollapsedCharacterStrip } from 'lib/tabs/tabLeaderboard/CollapsedCharacterStrip'
import { LeaderboardCharacterPreview } from 'lib/tabs/tabLeaderboard/LeaderboardCharacterPreview'
import {
  expandCharacterList,
  initializeLeaderboardTab,
} from 'lib/tabs/tabLeaderboard/leaderboardTabController'
import { RankListPanel } from 'lib/tabs/tabLeaderboard/RankListPanel'
import { useLeaderboardTabStore } from 'lib/tabs/tabLeaderboard/useLeaderboardTabStore'
import { useEffect } from 'react'
import { LeaderboardBanner } from './heroVariants/LeaderboardBanner'
import { LeaderboardFilterControls } from './LeaderboardFilterControls'
import classes from './LeaderboardLayout.module.css'

export function LeaderboardTab() {
  useEffect(() => {
    void initializeLeaderboardTab()
  }, [])

  const characterListExpanded = useLeaderboardTabStore((s) => s.characterListExpanded)

  const browsingClass = characterListExpanded ? classes.panelVisible : classes.panelHidden
  const detailClass = characterListExpanded ? classes.panelHidden : classes.panelVisible

  return (
    <div className={classes.wrapper}>
      <div className={classes.mainContent}>
        <div className={classes.sidebar}>
          <div className={`${classes.panel} ${classes.panelBrowsing} ${browsingClass}`}>
            <CharacterListPanel />
          </div>
          <div className={`${classes.panel} ${classes.panelDetail} ${detailClass}`}>
            <UnstyledButton className={classes.backUnified} onClick={expandCharacterList}>
              <span className={classes.backUnifiedArrow}>
                <IconChevronLeft size={16} />
              </span>
            </UnstyledButton>

            <div className={classes.toolbarSlot}>
              <LeaderboardFilterControls />
            </div>

            <div className={classes.rankView}>
              <div className={classes.stripColumn}>
                <CollapsedCharacterStrip />
              </div>
              <div className={classes.rankColumn}>
                <RankListPanel />
              </div>
            </div>
          </div>
        </div>

        <div className={classes.previewColumn}>
          <div className={classes.previewFrame}>
            <LeaderboardBanner />
            <LeaderboardCharacterPreview />
          </div>
        </div>
      </div>
    </div>
  )
}
