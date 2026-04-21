// @vitest-environment jsdom
import {
  Parts,
  RelicSetFilterOptions,
  Stats,
} from 'lib/constants/constants'
import {
  SetsOrnamentsNames,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import {
  detectZeroPermutationCauses,
  ZeroPermRootCause,
} from 'lib/tabs/tabOptimizer/suggestionsEngine'
import type { Form } from 'types/form'
import type { Relic } from 'types/relic'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// Covers the zero-perm root-cause detection branch added for issue #1482:
// when every slot has relics but no set 4-tuple satisfies the filter, the
// cause is RELIC_SETS (not the default IMPORT fallback).

const relicStoreMock = vi.hoisted(() => ({ relics: [] as Relic[] }))

vi.mock('lib/stores/relic/relicStore', () => ({
  getRelics: () => relicStoreMock.relics,
  getRelicById: vi.fn(),
}))

vi.mock('lib/stores/character/characterStore', () => ({
  getCharacters: () => [],
  getCharacterById: vi.fn(() => null),
}))

const SET_A = SetsRelicsNames[0]
const SET_B = SetsRelicsNames[1]

function makeRelic(overrides: Partial<Relic> & { id: string, part: Relic['part'], set: Relic['set'] }): Relic {
  return {
    weightScore: 0,
    enhance: 15,
    equippedBy: undefined,
    grade: 5,
    main: { stat: Stats.HP, value: 0 },
    augmentedStats: {} as Relic['augmentedStats'],
    substats: [],
    previewSubstats: [],
    initialRolls: 0,
    ...overrides,
  }
}

function baseRequest(overrides: Partial<Form> = {}): Form {
  return {
    characterId: '1005',
    rank: 0,
    rankFilter: false,
    enhance: 0,
    grade: 0,
    exclude: [],
    includeEquippedRelics: true,
    keepCurrentRelics: false,
    mainBody: [],
    mainFeet: [],
    mainPlanarSphere: [],
    mainLinkRope: [],
    mainStatUpscaleLevel: 0,
    relicSets: [],
    ornamentSets: [],
    weights: {},
    ...overrides,
  } as Form
}

describe('detectZeroPermutationCauses — set-constraint infeasibility (issue #1482)', () => {
  beforeEach(() => {
    relicStoreMock.relics = []
  })

  it('reports RELIC_SETS when slot counts are nonzero but 2+Any setA cannot be satisfied', () => {
    // Every slot has a relic but none are set A. 2+Any setA is thus infeasible.
    for (const part of [Parts.Head, Parts.Hands, Parts.Body, Parts.Feet] as const) {
      relicStoreMock.relics.push(makeRelic({ id: `${part}-b`, part, set: SET_B }))
    }
    // Ornaments must exist too, otherwise the ORNAMENT_SETS branch wins.
    relicStoreMock.relics.push(makeRelic({ id: 'p', part: Parts.PlanarSphere, set: SetsOrnamentsNames[0] as Relic['set'] }))
    relicStoreMock.relics.push(makeRelic({ id: 'l', part: Parts.LinkRope, set: SetsOrnamentsNames[0] as Relic['set'] }))

    const causes = detectZeroPermutationCauses(baseRequest({
      relicSets: [[RelicSetFilterOptions.relic2PlusAny, SET_A]],
    }))

    expect(causes).toContain(ZeroPermRootCause.RELIC_SETS)
    expect(causes).not.toContain(ZeroPermRootCause.IMPORT)
  })

  it('reports ORNAMENT_SETS when sphere/rope slots are nonempty but no pair matches the filter', () => {
    // Sphere has only ornament A, rope has only ornament B; filter allows [A, B]
    // as EITHER ornament. `generateOrnamentSetSolutions` requires a MATCHING pair
    // (2pc same ornament), so (A-sphere, B-rope) is invalid and (A,A)/(B,B) have
    // zero relics on one side. Valid ornament permutations = 0 while slot counts
    // > 0 — the old detector would fall through to IMPORT.
    for (const part of [Parts.Head, Parts.Hands, Parts.Body, Parts.Feet] as const) {
      relicStoreMock.relics.push(makeRelic({ id: `${part}-a`, part, set: SET_A }))
    }
    relicStoreMock.relics.push(makeRelic({ id: 'p', part: Parts.PlanarSphere, set: SetsOrnamentsNames[0] as Relic['set'] }))
    relicStoreMock.relics.push(makeRelic({ id: 'l', part: Parts.LinkRope, set: SetsOrnamentsNames[1] as Relic['set'] }))

    const causes = detectZeroPermutationCauses(baseRequest({
      ornamentSets: [SetsOrnamentsNames[0], SetsOrnamentsNames[1]],
    }))

    expect(causes).toContain(ZeroPermRootCause.ORNAMENT_SETS)
    expect(causes).not.toContain(ZeroPermRootCause.IMPORT)
  })

  it('does not report RELIC_SETS when slot counts allow the filter', () => {
    // At least one set A relic in every slot — 2+Any setA is satisfiable.
    for (const part of [Parts.Head, Parts.Hands, Parts.Body, Parts.Feet] as const) {
      relicStoreMock.relics.push(makeRelic({ id: `${part}-a`, part, set: SET_A }))
    }
    relicStoreMock.relics.push(makeRelic({ id: 'p', part: Parts.PlanarSphere, set: SetsOrnamentsNames[0] as Relic['set'] }))
    relicStoreMock.relics.push(makeRelic({ id: 'l', part: Parts.LinkRope, set: SetsOrnamentsNames[0] as Relic['set'] }))

    const causes = detectZeroPermutationCauses(baseRequest({
      relicSets: [[RelicSetFilterOptions.relic2PlusAny, SET_A]],
    }))

    expect(causes).not.toContain(ZeroPermRootCause.RELIC_SETS)
  })
})
