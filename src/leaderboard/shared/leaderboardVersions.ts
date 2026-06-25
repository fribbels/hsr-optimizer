import type { LeaderboardVersionFile } from 'leaderboard/shared/types'
import { Archer } from 'lib/conditionals/character/1000/Archer'
import { Aglaea } from 'lib/conditionals/character/1400/Aglaea'
import { Evanescia } from 'lib/conditionals/character/1500/Evanescia'

export const LEADERBOARD_VERSIONS: LeaderboardVersionFile = {
  global: 3,
  characters: {
    [Archer.id]: 1,
    [Aglaea.id]: 2,
    [Evanescia.id]: 1,
  },
  lightCones: {},
}
