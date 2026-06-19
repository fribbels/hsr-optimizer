import { UnstyledButton } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import classes from './CollapsedCharacterStrip.module.css'
import { selectLeaderboardCharacter } from './leaderboardTabController'
import { useLeaderboardTabStore } from './useLeaderboardTabStore'

export function CollapsedCharacterStrip() {
  const characters = useLeaderboardTabStore((s) => s.sortedCharacters)
  const selectedId = useLeaderboardTabStore((s) => s.selectedCharacterId)

  return (
    <div className={classes.container}>
      {characters.map((id) => (
        <UnstyledButton
          key={id}
          className={`${classes.icon} ${id === selectedId ? classes.iconSelected : ''}`}
          onClick={() => selectLeaderboardCharacter(id)}
        >
          <img src={Assets.getCharacterAvatarById(id)} className={classes.avatar} />
        </UnstyledButton>
      ))}
    </div>
  )
}
