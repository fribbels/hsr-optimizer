import { LeaderboardConfigType } from 'leaderboard/shared/configTypeMapping'
import { LEADERBOARD_FILTER_ALL } from 'leaderboard/shared/eidolonConfig'
import { LEADERBOARD_DISPLAY_TOP_N } from 'lib/tabs/tabLeaderboard/deriveVisibleEntries'
import { Assets } from 'lib/rendering/assets'
import { loadCharacterData } from 'lib/tabs/tabLeaderboard/leaderboardDataLoader'
import classes from 'lib/tabs/tabLeaderboard/LeaderboardHeader.module.css'
import { selectLeaderboardCharacter } from 'lib/tabs/tabLeaderboard/leaderboardTabController'
import {
  type LoadedLeaderboardCharacter,
  lookupUserLeaderboardRanks,
  type UserLeaderboardRank,
} from 'lib/tabs/tabLeaderboard/leaderboardUidLookup'
import { useLeaderboardTabStore } from 'lib/tabs/tabLeaderboard/useLeaderboardTabStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { truncate10ths } from 'lib/utils/mathUtils'
import { validateUuid } from 'lib/utils/miscUtils'
import {
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

const CONFIG_LABELS: Record<LeaderboardConfigType, string> = {
  [LeaderboardConfigType.DPS]: 'DPS',
  [LeaderboardConfigType.SUPPORT]: 'Support',
  [LeaderboardConfigType.HEAL]: 'Heal',
  [LeaderboardConfigType.SHIELD]: 'Shield',
}

enum UserRanksStatus {
  NO_UID = 'NO_UID',
  INVALID_UID = 'INVALID_UID',
  LOADING = 'LOADING',
  READY = 'READY',
  UNAVAILABLE = 'UNAVAILABLE',
}

type UserRanksState =
  | { status: UserRanksStatus.NO_UID }
  | { status: UserRanksStatus.INVALID_UID }
  | { status: UserRanksStatus.LOADING }
  | { status: UserRanksStatus.READY, ranks: UserLeaderboardRank[] }
  | { status: UserRanksStatus.UNAVAILABLE }

function selectRank(rank: UserLeaderboardRank) {
  selectLeaderboardCharacter(rank.characterId, {
    configType: rank.configType,
    teamId: LEADERBOARD_FILTER_ALL,
    buildId: rank.buildId,
  })
}

function statusMessage(state: UserRanksState): string | null {
  switch (state.status) {
    case UserRanksStatus.NO_UID:
      return 'No saved UID found.'
    case UserRanksStatus.INVALID_UID:
      return 'The saved UID is invalid.'
    case UserRanksStatus.LOADING:
      return 'Finding your leaderboard ranks...'
    case UserRanksStatus.UNAVAILABLE:
      return 'Ranks are temporarily unavailable.'
    case UserRanksStatus.READY:
      return state.ranks.length === 0 ? `No current top ${LEADERBOARD_DISPLAY_TOP_N} ranks.` : null
  }
}

export function LeaderboardUserRanksCard() {
  const scorerId = useShowcaseTabStore((state) => state.savedSession.scorerId)
  const { availableCharacters, loading } = useLeaderboardTabStore(useShallow((state) => ({
    availableCharacters: state.availableCharacters,
    loading: state.loading,
  })))
  const [state, setState] = useState<UserRanksState>({ status: UserRanksStatus.LOADING })
  const { t: tGame } = useTranslation('gameData')

  useEffect(() => {
    if (!scorerId) {
      setState({ status: UserRanksStatus.NO_UID })
      return
    }

    const uid = validateUuid(scorerId)
    if (!uid) {
      setState({ status: UserRanksStatus.INVALID_UID })
      return
    }

    if (loading) {
      setState({ status: UserRanksStatus.LOADING })
      return
    }

    const loadedCharacters: LoadedLeaderboardCharacter[] = []
    for (const characterId of availableCharacters) {
      const characterData = loadCharacterData(characterId)
      if (characterData) loadedCharacters.push({ characterId, characterData })
    }
    if (loadedCharacters.length === 0) {
      setState({ status: UserRanksStatus.UNAVAILABLE })
      return
    }

    let cancelled = false
    setState({ status: UserRanksStatus.LOADING })
    void lookupUserLeaderboardRanks(uid, loadedCharacters)
      .then((ranks) => {
        if (!cancelled) setState({ status: UserRanksStatus.READY, ranks })
      })
      .catch(() => {
        if (!cancelled) setState({ status: UserRanksStatus.UNAVAILABLE })
      })

    return () => {
      cancelled = true
    }
  }, [availableCharacters, loading, scorerId])

  const message = statusMessage(state)

  return (
    <div className={classes.rankContainer}>
      <div className={classes.rankHeaderRow}>
        <span className={classes.feedHeader}>Your Ranks</span>
        <span className={classes.rankScope}>All Teams</span>
      </div>

      {message && <div className={classes.rankState}>{message}</div>}

      {state.status === UserRanksStatus.READY && state.ranks.length > 0 && (
        <div className={classes.rankGrid}>
          {state.ranks.map((rank) => {
            const nameKey = rank.characterId.startsWith('80') ? 'LongName' : 'Name'
            const name = tGame(`Characters.${rank.characterId}.${nameKey}`)

            return (
              <button
                type='button'
                key={`${rank.characterId}#${rank.configType}`}
                className={classes.rankRow}
                onClick={() => selectRank(rank)}
                title={`${name} ${CONFIG_LABELS[rank.configType]} rank ${rank.rank}`}
              >
                <img
                  src={Assets.getCharacterAvatarById(rank.characterId)}
                  className={classes.rankAvatar}
                  alt=''
                />
                <span className={classes.rankName}>{name}</span>
                <span className={classes.rankConfig}>{CONFIG_LABELS[rank.configType]}</span>
                <span className={classes.rankNumber}>#{rank.rank}</span>
                <span className={classes.rankScore}>{truncate10ths(rank.score * 100).toFixed(1)}%</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
