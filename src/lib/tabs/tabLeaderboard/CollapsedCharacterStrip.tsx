import { UnstyledButton } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { useLeaderboardTabStore } from './useLeaderboardTabStore'
import { selectLeaderboardCharacter } from './leaderboardTabController'
import classes from './CollapsedCharacterStrip.module.css'

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
