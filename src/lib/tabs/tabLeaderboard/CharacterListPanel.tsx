import {
  Chip,
  Loader,
  TextInput,
} from '@mantine/core'
import { configTypeToPublic } from 'leaderboard/shared/configTypeMapping'
import { Assets } from 'lib/rendering/assets'
import classes from 'lib/tabs/tabLeaderboard/CharacterListPanel.module.css'
import {
  IS_LOCALHOST,
  getCharacterLeaderboardConfigTypes,
  isCharacterLeaderboardEnabled,
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
import type { CharacterId } from 'types/character'
import { ScoringConfigType } from 'types/metadata'

function abbreviateCount(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}K`
  return String(n)
}


const CONFIG_TABS = [
  { type: ScoringConfigType.DPS, label: 'DPS' },
  { type: ScoringConfigType.BUFFER, label: 'Support' },
  { type: ScoringConfigType.HEAL, label: 'Heal' },
  { type: ScoringConfigType.SHIELD, label: 'Shield' },
]

type CharacterRow = {
  id: CharacterId
  name: string
  topScore: number
  entryCount: number
  publicEntryCount: number
}

function ActiveRow({ row, index, selectedId, selectedType }: {
  row: CharacterRow
  index: number
  selectedId: string | null
  selectedType: ScoringConfigType | null
}) {
  return (
    <div
      className={`${classes.row} ${row.id === selectedId ? classes.selected : ''}`}
      onClick={() => selectLeaderboardCharacter(row.id, selectedType ? { configType: configTypeToPublic(selectedType) } : undefined)}
    >
      <span className={classes.rank}>{index + 1}</span>
      <span className={classes.nameCell}>
        <img src={Assets.getCharacterAvatarById(row.id)} className={classes.avatar} />
        <span className={classes.name}>{row.name}</span>
      </span>
      <span className={classes.score}>{row.topScore > 0 ? `${truncate10ths(row.topScore * 100).toFixed(1)}%` : '—'}</span>
      <span className={classes.count}>{row.entryCount > 0 ? `${abbreviateCount(row.publicEntryCount)} / ${abbreviateCount(row.entryCount)}` : '—'}</span>
    </div>
  )
}


function GrowingRow({ row, selectedId, selectedType }: {
  row: CharacterRow
  selectedId: string | null
  selectedType: ScoringConfigType | null
}) {
  return (
    <div
      className={`${classes.row} ${classes.growingRow} ${IS_LOCALHOST ? classes.growingRowClickable : ''} ${IS_LOCALHOST && row.id === selectedId ? classes.selected : ''}`}
      onClick={IS_LOCALHOST ? () => selectLeaderboardCharacter(row.id, selectedType ? { configType: configTypeToPublic(selectedType) } : undefined) : undefined}
    >
      <span className={classes.rank}>—</span>
      <span className={classes.nameCell}>
        <img src={Assets.getCharacterAvatarById(row.id)} className={`${classes.avatar} ${classes.growingAvatar}`} />
        <span className={classes.name}>{row.name}</span>
      </span>
      <span className={classes.score}>—</span>
      <span className={classes.count}>{row.entryCount > 0 ? abbreviateCount(row.entryCount) : '—'}</span>
    </div>
  )
}

export function CharacterListPanel() {
  const loading = useLeaderboardTabStore((s) => s.loading)
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

  const { activeRows, growingRows } = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const all = characters
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

    const active: CharacterRow[] = []
    const growing: CharacterRow[] = []

    for (const row of all) {
      if (isCharacterLeaderboardEnabled(row.id)) {
        active.push(row)
      } else {
        growing.push(row)
      }
    }

    active.sort((a, b) => b.topScore - a.topScore)
    growing.sort((a, b) => b.entryCount - a.entryCount)

    return { activeRows: active, growingRows: growing }
  }, [characters, search, selectedType, topScores, totalEntries, t])

  return (
    <div className={classes.container}>
      <div className={classes.toolbar}>
        <TextInput
          className={classes.search}
          variant='unstyled'
          placeholder='Search characters'
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
        {activeRows.map((row, index) => (
          <ActiveRow key={row.id} row={row} index={index} selectedId={selectedId} selectedType={selectedType} />
        ))}
        {activeRows.length === 0 && growingRows.length === 0 && (
          <div className={classes.empty}>
            {loading ? <Loader size='lg' /> : 'No matching characters'}
          </div>
        )}
        {growingRows.length > 0 && (
          <>
            <div className={classes.growingDivider}>
              <span>Insufficient data</span>
            </div>
            {growingRows.map((row) => (
              <GrowingRow key={row.id} row={row} selectedId={selectedId} selectedType={selectedType} />
            ))}
          </>
        )}
      </OverlayScrollbarsComponent>
    </div>
  )
}
