import { Sparkle } from 'lib/conditionals/character/1300/Sparkle'
import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import {
  Parts,
  SACERDOS_RELIVED_ORDEAL_1_STACK,
  SACERDOS_RELIVED_ORDEAL_2_STACK,
  Sets,
} from 'lib/constants/constants'
import { calculateTeammateSets } from 'lib/optimization/teammateSetUtils'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { Relic } from 'types/relic'
import {
  describe,
  expect,
  it,
} from 'vitest'

const equipped: Character['equipped'] = {
  [Parts.Head]: 'head',
  [Parts.Hands]: 'hands',
  [Parts.Body]: 'body',
  [Parts.Feet]: 'feet',
}
const relicsById: Partial<Record<string, Relic>> = {
  head: { id: 'head', set: Sets.SacerdosRelivedOrdeal } as Relic,
  hands: { id: 'hands', set: Sets.SacerdosRelivedOrdeal } as Relic,
  body: { id: 'body', set: Sets.SacerdosRelivedOrdeal } as Relic,
  feet: { id: 'feet', set: Sets.SacerdosRelivedOrdeal } as Relic,
}

describe('calculateTeammateSets', () => {
  it('infers two Sacerdos stacks for Sunday', () => {
    expect(calculateTeammateSets(makeCharacter(Sunday.id), relicsById).teamRelicSet)
      .toBe(SACERDOS_RELIVED_ORDEAL_2_STACK)
  })

  it.each([Sparkle.id, SparkleB1.id])('infers one Sacerdos stack for Sparkle %s', (id) => {
    expect(calculateTeammateSets(makeCharacter(id), relicsById).teamRelicSet)
      .toBe(SACERDOS_RELIVED_ORDEAL_1_STACK)
  })
})

function makeCharacter(id: CharacterId): Character {
  return {
    id,
    equipped,
    form: { characterId: id } as Character['form'],
  }
}
