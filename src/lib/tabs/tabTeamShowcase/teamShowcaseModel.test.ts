import {
  Parts,
  Sets,
} from 'lib/constants/constants'
import { CONFIG_DISPLAY_ORDER } from 'lib/scoring/scoringConfig'
import {
  autofillTeamSlots,
  buildTeamBenchmarkOverrideVariants,
  captureTeamBenchmarkSnapshot,
  resolveTeamBenchmarkOverrides,
  sanitizeTeamSlots,
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
  it('removes missing and duplicate characters while preserving slot positions', () => {
    const charactersById = {
      [A]: makeCharacter(A, '20000' as LightConeId),
      [B]: makeCharacter(B, '20001' as LightConeId),
    }

    expect(sanitizeTeamSlots([A, UNOWNED, A, B], charactersById)).toEqual([A, null, null, B])
  })

  it('fills owned custom teammates in benchmark order while skipping duplicates and the leader', () => {
    const slots = autofillTeamSlots(
      [A, null, null, null],
      A,
      new Set([A, B, C, D]),
      [UNOWNED, A, B, B, C, D],
    )

    expect(slots).toEqual([A, B, C, D])
  })

  it('normalizes a partial slot list before autofilling', () => {
    const slots = autofillTeamSlots(
      [A],
      A,
      new Set([A, B, C, D]),
      [B, C, D],
    )

    expect(slots).toEqual([A, B, C, D])
  })

  it('builds every focal card from the other three captured characters', () => {
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

    const result = captureTeamBenchmarkSnapshot(characters, relicsById)
    const variants = buildTeamBenchmarkOverrideVariants(result.snapshot)
    const overridesBySlot = resolveTeamBenchmarkOverrides([A, B, C, D], variants)

    expect(result.status).toBe(TeamBenchmarkOverrideStatus.READY)
    for (const configType of CONFIG_DISPLAY_ORDER) {
      const teammates = overridesBySlot[0]?.[configType]?.teammates
      expect(teammates?.map((teammate) => teammate.characterId)).toEqual([B, C, D])
      expect(teammates?.[0]).toEqual(expect.objectContaining({
        lightCone: '20001',
        characterEidolon: 2,
        lightConeSuperimposition: 3,
        teamRelicSet: Sets.WatchmakerMasterOfDreamMachinations,
        teamOrnamentSet: Sets.BrokenKeel,
      }))
    }
    expect(overridesBySlot[1]?.[ScoringConfigType.DPS]?.teammates?.map((teammate) => teammate.characterId)).toEqual([A, C, D])
    expect(overridesBySlot[0]?.[ScoringConfigType.DPS]?.deprioritizeBuffs).toBe(false)
    expect(overridesBySlot[1]?.[ScoringConfigType.DPS]?.deprioritizeBuffs).toBe(true)
    expect(overridesBySlot[0]?.[ScoringConfigType.BUFFER]?.deprioritizeBuffs).toBeUndefined()
  })

  it('keeps captured equipment while applying main DPS priority to the current first slot', () => {
    const characterB = makeCharacter(B, '20001' as LightConeId, {}, 2, 3)
    const characters = [
      makeCharacter(A, '20000' as LightConeId),
      characterB,
      makeCharacter(C, '20002' as LightConeId),
      makeCharacter(D, '20003' as LightConeId),
    ]
    const result = captureTeamBenchmarkSnapshot(characters, {})

    characterB.form.lightConeSuperimposition = 5
    const variants = buildTeamBenchmarkOverrideVariants(result.snapshot)
    const overridesBySlot = resolveTeamBenchmarkOverrides([B, A, C, D], variants)

    expect(overridesBySlot[0]?.[ScoringConfigType.DPS]?.deprioritizeBuffs).toBe(false)
    expect(overridesBySlot[1]?.[ScoringConfigType.DPS]?.deprioritizeBuffs).toBe(true)
    expect(overridesBySlot[1]?.[ScoringConfigType.DPS]?.teammates?.[0]).toEqual(expect.objectContaining({
      characterId: B,
      lightConeSuperimposition: 3,
    }))
  })

  it('preserves each character override when only non-main slots are reordered', () => {
    const characters = [
      makeCharacter(A, '20000' as LightConeId),
      makeCharacter(B, '20001' as LightConeId),
      makeCharacter(C, '20002' as LightConeId),
      makeCharacter(D, '20003' as LightConeId),
    ]
    const result = captureTeamBenchmarkSnapshot(characters, {})
    const variants = buildTeamBenchmarkOverrideVariants(result.snapshot)

    const before = resolveTeamBenchmarkOverrides([A, B, C, D], variants)
    const after = resolveTeamBenchmarkOverrides([A, C, D, B], variants)

    expect(after[0]).toBe(before[0])
    expect(after[1]).toBe(before[2])
    expect(after[2]).toBe(before[3])
    expect(after[3]).toBe(before[1])
  })

  it('changes only the old and new main DPS overrides when slot one changes', () => {
    const characters = [
      makeCharacter(A, '20000' as LightConeId),
      makeCharacter(B, '20001' as LightConeId),
      makeCharacter(C, '20002' as LightConeId),
      makeCharacter(D, '20003' as LightConeId),
    ]
    const result = captureTeamBenchmarkSnapshot(characters, {})
    const variants = buildTeamBenchmarkOverrideVariants(result.snapshot)

    const before = resolveTeamBenchmarkOverrides([A, B, C, D], variants)
    const after = resolveTeamBenchmarkOverrides([B, A, C, D], variants)

    expect(after[0]).not.toBe(before[1])
    expect(after[1]).not.toBe(before[0])
    expect(after[2]).toBe(before[2])
    expect(after[3]).toBe(before[3])
  })

  it('fails the entire override when any selected character has no light cone', () => {
    const characters = [
      makeCharacter(A, '20000' as LightConeId),
      makeCharacter(B, undefined),
      makeCharacter(C, '20002' as LightConeId),
      makeCharacter(D, '20003' as LightConeId),
    ]

    const result = captureTeamBenchmarkSnapshot(characters, {})

    expect(result.status).toBe(TeamBenchmarkOverrideStatus.MISSING_LIGHT_CONE)
    expect(result.snapshot).toBeUndefined()
  })
})
