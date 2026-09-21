import {
  Parts,
  Sets,
} from 'lib/constants/constants'
import { CONFIG_DISPLAY_ORDER } from 'lib/scoring/scoringConfig'
import {
  autofillTeamSlots,
  buildTeamBenchmarkOverrides,
  TeamBenchmarkOverrideStatus,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseModel'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { LightConeId } from 'types/lightCone'
import { ScoringConfigType } from 'types/metadata'
import type { Relic } from 'types/relic'
import {
  describe,
  expect,
  it,
} from 'vitest'

const A = '1001' as CharacterId
const B = '1002' as CharacterId
const C = '1003' as CharacterId
const D = '1004' as CharacterId
const UNOWNED = '9999' as CharacterId

function makeCharacter(
  id: CharacterId,
  lightCone: LightConeId | undefined,
  equipped: Character['equipped'] = {},
  characterEidolon = 0,
  lightConeSuperimposition = 1,
): Character {
  return {
    id,
    equipped,
    form: {
      characterId: id,
      lightCone,
      characterEidolon,
      lightConeSuperimposition,
    } as Character['form'],
  }
}

function makeRelic(id: string, set: string): Relic {
  return { id, set } as Relic
}

describe('teamShowcaseModel', () => {
  it('fills owned custom teammates in benchmark order while skipping duplicates and the leader', () => {
    const slots = autofillTeamSlots(
      [A, null, null, null],
      A,
      new Set([A, B, C, D]),
      [UNOWNED, A, B, B, C, D],
    )

    expect(slots).toEqual([A, B, C, D])
  })

  it('builds every focal card from the other three live characters in grid order', () => {
    const bEquipped: Character['equipped'] = {
      [Parts.Head]: 'b-head',
      [Parts.Hands]: 'b-hands',
      [Parts.Body]: 'b-body',
      [Parts.Feet]: 'b-feet',
      [Parts.PlanarSphere]: 'b-sphere',
      [Parts.LinkRope]: 'b-rope',
    }
    const characters = [
      makeCharacter(A, '20000' as LightConeId),
      makeCharacter(B, '20001' as LightConeId, bEquipped, 2, 3),
      makeCharacter(C, '20002' as LightConeId),
      makeCharacter(D, '20003' as LightConeId),
    ]
    const relicsById = {
      'b-head': makeRelic('b-head', Sets.WatchmakerMasterOfDreamMachinations),
      'b-hands': makeRelic('b-hands', Sets.WatchmakerMasterOfDreamMachinations),
      'b-body': makeRelic('b-body', Sets.WatchmakerMasterOfDreamMachinations),
      'b-feet': makeRelic('b-feet', Sets.WatchmakerMasterOfDreamMachinations),
      'b-sphere': makeRelic('b-sphere', Sets.BrokenKeel),
      'b-rope': makeRelic('b-rope', Sets.BrokenKeel),
    }

    const result = buildTeamBenchmarkOverrides(characters, relicsById)

    expect(result.status).toBe(TeamBenchmarkOverrideStatus.READY)
    for (const configType of CONFIG_DISPLAY_ORDER) {
      const teammates = result.overridesBySlot[0]?.[configType]?.teammates
      expect(teammates?.map((teammate) => teammate.characterId)).toEqual([B, C, D])
      expect(teammates?.[0]).toEqual(expect.objectContaining({
        lightCone: '20001',
        characterEidolon: 2,
        lightConeSuperimposition: 3,
        teamRelicSet: Sets.WatchmakerMasterOfDreamMachinations,
        teamOrnamentSet: Sets.BrokenKeel,
      }))
    }
    expect(result.overridesBySlot[1]?.[ScoringConfigType.DPS]?.teammates?.map((teammate) => teammate.characterId)).toEqual([A, C, D])
  })

  it('fails the entire override when any selected character has no light cone', () => {
    const characters = [
      makeCharacter(A, '20000' as LightConeId),
      makeCharacter(B, undefined),
      makeCharacter(C, '20002' as LightConeId),
      makeCharacter(D, '20003' as LightConeId),
    ]

    const result = buildTeamBenchmarkOverrides(characters, {})

    expect(result.status).toBe(TeamBenchmarkOverrideStatus.MISSING_LIGHT_CONE)
    expect(result.overridesBySlot.every((override) => override == null)).toBe(true)
  })
})
