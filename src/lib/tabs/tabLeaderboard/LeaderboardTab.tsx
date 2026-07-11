import { UnstyledButton } from '@mantine/core'
import { IconChevronLeft } from '@tabler/icons-react'
import type { CharacterId } from 'types/character'
import { DefaultScoringProvider } from 'lib/hooks/useScoringMetadata'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { CharacterListPanel } from 'lib/tabs/tabLeaderboard/CharacterListPanel'
import { CollapsedCharacterStrip } from 'lib/tabs/tabLeaderboard/CollapsedCharacterStrip'
import { LeaderboardBanner } from 'lib/tabs/tabLeaderboard/LeaderboardBanner'
import { LeaderboardCharacterPreview } from 'lib/tabs/tabLeaderboard/LeaderboardCharacterPreview'
import { LeaderboardFilterControls } from 'lib/tabs/tabLeaderboard/LeaderboardFilterControls'
import { LeaderboardHeader } from 'lib/tabs/tabLeaderboard/LeaderboardHeader'
import classes from 'lib/tabs/tabLeaderboard/LeaderboardLayout.module.css'
import {
  expandCharacterList,
  initializeLeaderboardTab,
} from 'lib/tabs/tabLeaderboard/leaderboardTabController'
import { RankListPanel } from 'lib/tabs/tabLeaderboard/RankListPanel'
import { useLeaderboardTabStore } from 'lib/tabs/tabLeaderboard/useLeaderboardTabStore'
import {
  useContext,
  useEffect,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'

export function LeaderboardTab() {
  const { isActiveRef, addActivationListener } = useContext(TabVisibilityContext)
  const initializationStartedRef = useRef(false)

  useEffect(() => {
    const initializeOnce = () => {
      if (initializationStartedRef.current) return

      initializationStartedRef.current = true
      void initializeLeaderboardTab()
    }

    if (isActiveRef.current) initializeOnce()
    return addActivationListener(initializeOnce)
  }, [addActivationListener, isActiveRef])

  const characterListExpanded = useLeaderboardTabStore((s) => s.characterListExpanded)
  const selectedCharacterId = useLeaderboardTabStore((s) => s.selectedCharacterId)
  const { t: tGame } = useTranslation('gameData')

  const nameKey = selectedCharacterId?.startsWith('80') ? 'LongName' : 'Name'
  const characterName = selectedCharacterId ? tGame(`Characters.${selectedCharacterId as CharacterId}.${nameKey}`) : ''

  const browsingClass = characterListExpanded ? classes.panelVisible : classes.panelHidden
  const detailClass = characterListExpanded ? classes.panelHidden : classes.panelVisible

  return (
    <div className={classes.wrapper}>
      <LeaderboardHeader />
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
              <span className={classes.backUnifiedLabel}>{characterName}</span>
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
          <DefaultScoringProvider value={true}>
            <div className={classes.previewFrame}>
              <LeaderboardBanner />
              <LeaderboardCharacterPreview />
            </div>
          </DefaultScoringProvider>
        </div>
      </div>
    </div>
  )
}
