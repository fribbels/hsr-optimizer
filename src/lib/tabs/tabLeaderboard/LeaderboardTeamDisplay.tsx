import { Assets } from 'lib/rendering/assets'
import type { LeaderboardTeammate } from './leaderboardTabTypes'
import classes from './LeaderboardTeamDisplay.module.css'

interface LeaderboardTeamDisplayProps {
  teammates: LeaderboardTeammate[]
  maxDisplay?: number
}

export function LeaderboardTeamDisplay({ teammates, maxDisplay = 3 }: LeaderboardTeamDisplayProps) {
  const displayed = teammates.slice(0, maxDisplay)

  return (
    <span className={classes.avatars}>
      {displayed.map((t, i) => (
        <span key={i} className={classes.teamIconWrap}>
          <img className={classes.teamIcon} src={Assets.getCharacterAvatarById(t.characterId)} />
        </span>
      ))}
    </span>
  )
}
