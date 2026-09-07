import {
  Popover,
  SegmentedControl,
  UnstyledButton,
} from '@mantine/core'
import { IconChevronDown } from '@tabler/icons-react'
import {
  EIDOLON_GROUPS,
  EIDOLON_TIERS,
  LEADERBOARD_FILTER_ALL,
  type LeaderboardEidolonFilter,
} from 'leaderboard/shared/eidolonConfig'
import type { PublicTeamMeta } from 'leaderboard/shared/types'
import { Assets } from 'lib/rendering/assets'
import classes from 'lib/tabs/tabLeaderboard/LeaderboardFilterControls.module.css'
import { setLeaderboardFilters } from 'lib/tabs/tabLeaderboard/leaderboardTabController'
import { useLeaderboardTabStore } from 'lib/tabs/tabLeaderboard/useLeaderboardTabStore'
import {
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'

interface LeaderboardFilterControlsProps {
  activeTeamId: string
  availableTeams: PublicTeamMeta[]
  filterCharacterEidolon: LeaderboardEidolonFilter
  onFilterChange: (filters: { teamId?: string, characterEidolon?: string }) => void
  getCharacterName: (characterId: string) => string
  allTeamsLabel: string
  eidolonOptions: { value: LeaderboardEidolonFilter, label: string }[]
}

function characterName(props: LeaderboardFilterControlsProps, characterId: string) {
  return props.getCharacterName(characterId)
}

function teamLabel(props: LeaderboardFilterControlsProps, team: PublicTeamMeta) {
  return team.teammates.map((teammate) => characterName(props, teammate.characterId)).join(' / ')
}

function TeamNamedButton({ team, active, onSelect, label }: {
  team: PublicTeamMeta,
  active: boolean,
  onSelect: (teamId: string) => void,
  label: string,
}) {
  return (
    <UnstyledButton
      className={`${classes.teamNamedRow} ${active ? classes.teamNamedRowActive : ''}`}
      title={label}
      onClick={() => onSelect(team.teamId)}
    >
      <span className={classes.teamNamedAvatars}>
        {team.teammates.map((teammate) => (
          <img
            key={teammate.characterId}
            className={classes.teamNamedAvatar}
            src={Assets.getCharacterAvatarById(teammate.characterId)}
          />
        ))}
      </span>
      <span className={classes.teamNamedText}>{label}</span>
    </UnstyledButton>
  )
}

function renderTeamNamedRows(props: LeaderboardFilterControlsProps, onSelect?: () => void) {
  const availableTeams = props.availableTeams
  const allActive = props.activeTeamId === LEADERBOARD_FILTER_ALL
  const select = (teamId: string) => {
    props.onFilterChange({ teamId })
    onSelect?.()
  }
  return (
    <div className={classes.teamNamedRows}>
      <UnstyledButton
        className={`${classes.teamNamedRow} ${classes.teamNamedRowAll} ${allActive ? classes.teamNamedRowActive : ''}`}
        onClick={() => select(LEADERBOARD_FILTER_ALL)}
      >
        <span className={classes.teamNamedText}>{props.allTeamsLabel}</span>
      </UnstyledButton>
      {availableTeams.map((team) => (
        <TeamNamedButton
          key={team.teamId}
          team={team}
          active={props.activeTeamId === team.teamId}
          onSelect={select}
          label={teamLabel(props, team)}
        />
      ))}
    </div>
  )
}

function TeamPopover(props: LeaderboardFilterControlsProps) {
  const [opened, setOpened] = useState(false)
  const availableTeams = props.availableTeams
  const selectedTeam = availableTeams.find((team) => team.teamId === props.activeTeamId)
  const triggerLabel = selectedTeam ? teamLabel(props, selectedTeam) : props.allTeamsLabel

  return (
    <Popover opened={opened} onChange={setOpened} position='bottom-start' width='target' shadow='md' radius='md' offset={4} withinPortal={false}>
      <Popover.Target>
        <UnstyledButton
          className={`${classes.teamNamedRow} ${classes.teamPopTrigger} ${selectedTeam ? '' : classes.teamPopTriggerAll} ${
            opened ? classes.teamPopTriggerOpen : ''
          }`}
          title={triggerLabel}
          onClick={() => setOpened((o) => !o)}
        >
          {selectedTeam && (
            <span className={classes.teamNamedAvatars}>
              {selectedTeam.teammates.map((teammate) => (
                <img
                  key={teammate.characterId}
                  className={classes.teamNamedAvatar}
                  src={Assets.getCharacterAvatarById(teammate.characterId)}
                />
              ))}
            </span>
          )}
          <span className={classes.teamNamedText}>{triggerLabel}</span>
          <span className={classes.teamPopChevron}>
            <IconChevronDown size={14} />
          </span>
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown className={classes.teamPopDropdown} p={6}>
        {renderTeamNamedRows(props, () => setOpened(false))}
      </Popover.Dropdown>
    </Popover>
  )
}

function renderCharacterEidolonBar(props: LeaderboardFilterControlsProps) {
  return (
    <SegmentedControl
      classNames={{ root: classes.eidolonSegmentedRoot, label: classes.eidolonSegmentedLabel }}
      data={props.eidolonOptions.map((option) => ({ value: option.value, label: option.label }))}
      value={props.filterCharacterEidolon}
      onChange={(value) => props.onFilterChange({ characterEidolon: value })}
      size='xs'
      radius={6}
      fullWidth
    />
  )
}

export function LeaderboardFilterControls() {
  const selectedCharacterId = useLeaderboardTabStore((s) => s.selectedCharacterId)
  const activeTeamId = useLeaderboardTabStore((s) => s.activeTeamId)
  const availableTeams = useLeaderboardTabStore((s) => s.availableTeams)
  const filterCharacterEidolon = useLeaderboardTabStore((s) => s.filterCharacterEidolon)
  const { t: tCharacters } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const { t } = useTranslation('leaderboardTab', { keyPrefix: 'Filters' })
  const { t: tCommon } = useTranslation('common')

  const eidolonOptions = useMemo(() => [
    { value: LEADERBOARD_FILTER_ALL, label: t('AllEidolons') },
    ...EIDOLON_TIERS.map((eidolon, i) => ({
      value: EIDOLON_GROUPS[i],
      label: tCommon('EidolonNShort', { eidolon }),
    })),
  ], [t, tCommon])

  if (!selectedCharacterId) return null

  const props: LeaderboardFilterControlsProps = {
    activeTeamId,
    availableTeams,
    filterCharacterEidolon,
    onFilterChange: setLeaderboardFilters,
    getCharacterName: (characterId) => tCharacters(`${characterId as CharacterId}.Name`),
    allTeamsLabel: t('AllTeams', { count: availableTeams.length }),
    eidolonOptions,
  }

  return (
    <div className={classes.filterRows}>
      <div className={classes.labeledFilterRow}>
        <span className={classes.filterLabel}>{t('EidolonLabel')}</span>
        {renderCharacterEidolonBar(props)}
      </div>
      <div className={classes.labeledFilterRow}>
        <span className={classes.filterLabel}>{t('TeamLabel')}</span>
        <TeamPopover {...props} />
      </div>
    </div>
  )
}
