import { Aglaea } from 'lib/conditionals/character/1400/Aglaea'
import { Evanescia } from 'lib/conditionals/character/1500/Evanescia'
import { Archer } from 'lib/conditionals/character/1000/Archer'
import type { LeaderboardVersionFile } from 'leaderboard/shared/types'

export const LEADERBOARD_VERSIONS: LeaderboardVersionFile = {
  global: 3,
  characters: {
    [Archer.id]: 1,
    [Aglaea.id]: 2,
    [Evanescia.id]: 1,
  },
  lightCones: {},
}
