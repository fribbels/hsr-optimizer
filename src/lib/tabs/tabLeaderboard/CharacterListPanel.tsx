import {
  Chip,
  TextInput,
} from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import classes from 'lib/tabs/tabLeaderboard/CharacterListPanel.module.css'
import {
  getCharacterLeaderboardConfigTypes,
} from 'lib/tabs/tabLeaderboard/leaderboardCharacterHelpers'
import { getPublicEntryCount } from 'lib/tabs/tabLeaderboard/leaderboardDataLoader'
import { selectLeaderboardCharacter } from 'lib/tabs/tabLeaderboard/leaderboardTabController'
import { useLeaderboardTabStore } from 'lib/tabs/tabLeaderboard/useLeaderboardTabStore'
import { OVERLAY_SCROLLBAR_OPTIONS } from 'lib/ui/selectors/selectConstants'
import { truncate10ths } from 'lib/utils/mathUtils'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import {
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { ScoringConfigType } from 'types/metadata'

function abbreviateCount(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(n)
}

const CONFIG_TABS = [
  { type: ScoringConfigType.DPS, label: 'DPS' },
  { type: ScoringConfigType.BUFFER, label: 'Support' },
  { type: ScoringConfigType.HEAL, label: 'Heal' },
  { type: ScoringConfigType.SHIELD, label: 'Shield' },
]

export function CharacterListPanel() {
  const characters = useLeaderboardTabStore((s) => s.availableCharacters)
  const selectedId = useLeaderboardTabStore((s) => s.selectedCharacterId)
  const topScores = useLeaderboardTabStore((s) => s.topScores)
  const totalEntries = useLeaderboardTabStore((s) => s.totalEntries)
  const { t } = useTranslation('gameData')
  const [activeType, setActiveType] = useState<ScoringConfigType | null>(null)
  const [search, setSearch] = useState('')

  const tabCounts = useMemo(() => {
    return CONFIG_TABS.map((tab) => ({
      ...tab,
      count: characters.filter((id) => getCharacterLeaderboardConfigTypes(id).includes(tab.type)).length,
    })).filter((tab) => tab.count > 0)
  }, [characters])

  const selectedType = activeType != null && tabCounts.some((tab) => tab.type === activeType)
    ? activeType
    : null

  const rows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return characters
      .filter((id) => selectedType == null || getCharacterLeaderboardConfigTypes(id).includes(selectedType))
      .map((id) => {
        const topScore = topScores[id] ?? 0
        const entryCount = totalEntries[id] ?? 0

        return {
          id,
          name: t(`Characters.${id}.${id.startsWith('80') ? 'LongName' : 'Name'}`),
          topScore,
          entryCount,
          publicEntryCount: getPublicEntryCount(id),
        }
      })
      .filter((row) => normalizedSearch.length === 0 || row.name.toLowerCase().includes(normalizedSearch))
      .sort((a, b) => b.topScore - a.topScore)
  }, [characters, search, selectedType, topScores, totalEntries, t])

  return (
    <div className={classes.container}>
      <div className={classes.toolbar}>
        <TextInput
          className={classes.search}
          variant='unstyled'
          placeholder='Search'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className={classes.tabs}>
          {tabCounts.map((tab) => (
            <Chip
              key={tab.type}
              checked={tab.type === selectedType}
              onChange={() => setActiveType(activeType === tab.type ? null : tab.type)}
            >
              {tab.label} ({tab.count})
            </Chip>
          ))}
        </div>
      </div>

      <div className={classes.header}>
        <span className={classes.rankHeader}>#</span>
        <span>Character</span>
        <span className={classes.scoreHeader}>Top %</span>
        <span className={classes.countHeader}>Entries</span>
      </div>

      <OverlayScrollbarsComponent className={classes.list} options={OVERLAY_SCROLLBAR_OPTIONS} defer>
        {rows.map((row, index) => (
          <div
            key={row.id}
            className={`${classes.row} ${row.id === selectedId ? classes.selected : ''}`}
            onClick={() => selectLeaderboardCharacter(row.id)}
          >
            <span className={classes.rank}>{index + 1}</span>
            <span className={classes.nameCell}>
              <img src={Assets.getCharacterAvatarById(row.id)} className={classes.avatar} />
              <span className={classes.name}>{row.name}</span>
            </span>
            <span className={classes.score}>{row.topScore > 0 ? `${truncate10ths(row.topScore * 100).toFixed(1)}%` : '—'}</span>
            <span className={classes.count}>{row.entryCount > 0 ? `${abbreviateCount(row.publicEntryCount)} / ${abbreviateCount(row.entryCount)}` : '—'}</span>
          </div>
        ))}
        {rows.length === 0 && <div className={classes.empty}>No matching characters</div>}
      </OverlayScrollbarsComponent>
    </div>
  )
}
