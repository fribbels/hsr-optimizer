import classes from 'lib/characterPreview/scoring/RollCountDisplay.module.css'
import { numberToLocaleString } from 'lib/utils/i18nUtils'

export function RollCountDisplay({ effective, total, leaderboard = false }: {
  effective: number,
  total: number,
  leaderboard?: boolean,
}) {
  return (
    <span className={`${classes.count} ${leaderboard ? classes.leaderboard : ''}`}>
      <span>{numberToLocaleString(effective, 1)}</span>
      <span className={classes.slash}>/</span>
      <span className={classes.total}>{numberToLocaleString(total)}</span>
    </span>
  )
}
