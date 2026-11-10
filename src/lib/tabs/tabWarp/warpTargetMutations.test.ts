import type { UseFormReturnType } from '@mantine/form'
import { Bronya } from 'lib/conditionals/character/1100/Bronya'
import { Clara } from 'lib/conditionals/character/1100/Clara'
import { Amber } from 'lib/conditionals/lightcone/3star/Amber'
import { Chorus } from 'lib/conditionals/lightcone/3star/Chorus'
import { Cornucopia } from 'lib/conditionals/lightcone/3star/Cornucopia'
import {
  EidolonLevel,
  type PlannerTarget,
  SuperimpositionLevel,
  type WarpRequest,
  type WarpTarget,
  WarpTargetKind,
  WarpType,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import {
  createSkinTarget,
  SKIN_BANNERS,
} from 'lib/tabs/tabWarp/warpSkinBanners'
import * as skinBanners from 'lib/tabs/tabWarp/warpSkinBanners'
import {
  addCharAndSignatureGoal,
  addCharGoal,
  addSkinGoal,
  getCharacterEidolonFloor,
  getLightConeSuperimpositionFloor,
  hasSkinTarget,
  moveTarget,
  removeTarget,
  updateSkinGoal,
  updateTarget,
  updateTargetFrom,
  updateTargetTo,
} from 'lib/tabs/tabWarp/warpTargetMutations'
import {
  afterEach,
  assert,
  beforeEach,
  expect,
  test,
  vi,
} from 'vitest'

const CHAR_A = Bronya.id
const CHAR_B = Clara.id
const LC_A = Cornucopia.id
const SIG_LC = Amber.id
const OTHER_LC = Chorus.id

// Stand-in character save: add functions read owned eidolon / equipped-cone superimposition from here.
const storeMock = vi.hoisted(() => ({
  byId: {} as Record<string, { form: { characterEidolon: number, lightCone: string, lightConeSuperimposition: number } }>,
}))
const configMock = vi.hoisted(() => ({
  byId: {} as Record<string, { defaultLightCone: string | null }>,
}))

vi.mock('lib/stores/character/characterStore', () => ({
  getCharacterById: (id: string) => storeMock.byId[id],
  getCharacters: () => Object.values(storeMock.byId),
}))

vi.mock('lib/conditionals/resolver/characterConfigRegistry', () => ({
  getCharacterConfig: (id: string) => configMock.byId[id],
  getAllCharacterConfigs: () => new Map(Object.entries(configMock.byId)),
}))

beforeEach(() => {
  storeMock.byId = {}
  configMock.byId = {}
})

afterEach(() => vi.restoreAllMocks())

function makeWarpTarget(patch: Partial<WarpTarget> = {}): WarpTarget {
  return {
    kind: WarpTargetKind.WARP,
    id: 'target',
    characterId: null,
    lightConeId: null,
    targetEidolonLevel: EidolonLevel.NONE,
    targetSuperimpositionLevel: SuperimpositionLevel.NONE,
    currentEidolonLevel: EidolonLevel.NONE,
    currentSuperimpositionLevel: SuperimpositionLevel.NONE,
    ...patch,
  }
}

function warpTarget(target: PlannerTarget): WarpTarget {
  assert(target.kind === WarpTargetKind.WARP)
  return target
}

// Minimal stand-in for the Mantine form: only getValues().targets and setFieldValue are exercised.
function fakeForm(initial: PlannerTarget[]) {
  let targets = initial
  const form = {
    getValues: () => ({ targets }),
    setFieldValue: (_field: string, value: PlannerTarget[]) => {
      targets = value
    },
  } as unknown as UseFormReturnType<WarpRequest>
  return { form, current: () => targets }
}

test('character eidolon floor is NONE with no matching earlier targets', () => {
  const targets = [makeWarpTarget({ characterId: CHAR_B, targetEidolonLevel: EidolonLevel.E3 })]
  expect(getCharacterEidolonFloor(targets, CHAR_A, targets.length)).toBe(EidolonLevel.NONE)
})

test('character eidolon floor takes the max target among earlier same-character targets', () => {
  const targets = [
    makeWarpTarget({ characterId: CHAR_A, targetEidolonLevel: EidolonLevel.E0 }),
    makeWarpTarget({ characterId: CHAR_A, targetEidolonLevel: EidolonLevel.E2 }),
  ]
  expect(getCharacterEidolonFloor(targets, CHAR_A, 2)).toBe(EidolonLevel.E2)
})

test('character eidolon floor ignores targets at or after beforeIndex', () => {
  const targets = [
    makeWarpTarget({ characterId: CHAR_A, targetEidolonLevel: EidolonLevel.E1 }),
    makeWarpTarget({ characterId: CHAR_A, targetEidolonLevel: EidolonLevel.E5 }),
  ]
  expect(getCharacterEidolonFloor(targets, CHAR_A, 1)).toBe(EidolonLevel.E1)
})

test('character eidolon floor is NONE for a null character', () => {
  const targets = [makeWarpTarget({ characterId: CHAR_A, targetEidolonLevel: EidolonLevel.E3 })]
  expect(getCharacterEidolonFloor(targets, null, targets.length)).toBe(EidolonLevel.NONE)
})

test('light cone superimposition floor takes the max among earlier same-LC targets', () => {
  const targets = [
    makeWarpTarget({ lightConeId: LC_A, targetSuperimpositionLevel: SuperimpositionLevel.S1 }),
    makeWarpTarget({ lightConeId: LC_A, targetSuperimpositionLevel: SuperimpositionLevel.S3 }),
  ]
  expect(getLightConeSuperimpositionFloor(targets, LC_A, 2)).toBe(SuperimpositionLevel.S3)
})

test('addCharGoal appends an E0 goal for a brand-new character', () => {
  const { form, current } = fakeForm([])
  addCharGoal(form, CHAR_A)
  const targets = current()
  expect(targets).toHaveLength(1)
  expect(targets[0]).toMatchObject({ characterId: CHAR_A, targetEidolonLevel: EidolonLevel.E0 })
})

test('addCharGoal chains the next eidolon and starts from the previous goal', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E0 }),
  ])
  addCharGoal(form, CHAR_A)
  const targets = current()
  expect(targets).toHaveLength(2)
  expect(targets[1]).toMatchObject({ currentEidolonLevel: EidolonLevel.E0, targetEidolonLevel: EidolonLevel.E1 })
})

// --- Reflow: the journey (goal set + count) is invariant under reorder ---

test('dragging same-character rows keeps the journey ascending without a phantom goal', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E0 }),
    makeWarpTarget({ id: 'b', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E0, targetEidolonLevel: EidolonLevel.E1 }),
    makeWarpTarget({ id: 'c', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E1, targetEidolonLevel: EidolonLevel.E2 }),
  ])
  // drag the E1->E2 row to the front; chain must snap back to ascending, ending at E2 (no phantom E3)
  moveTarget(form, 'c', 'a')
  const t = current()
  expect(t.map(warpTarget).map((x) => x.targetEidolonLevel)).toEqual([EidolonLevel.E0, EidolonLevel.E1, EidolonLevel.E2])
  expect(t.map(warpTarget).map((x) => x.currentEidolonLevel)).toEqual([EidolonLevel.NONE, EidolonLevel.E0, EidolonLevel.E1])
})

test('reordering one character does not move another character\'s row', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E2 }),
    makeWarpTarget({ id: 'x', characterId: CHAR_B, currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E0 }),
    makeWarpTarget({ id: 'b', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E2, targetEidolonLevel: EidolonLevel.E3 }),
  ])
  // raise A's first goal above its second; A's rows reorder but B's row stays in the middle
  updateTargetTo(form, 0, WarpType.CHARACTER, EidolonLevel.E5)
  const t = current()
  expect(t.map((x) => x.id)).toEqual(['b', 'x', 'a'])
  expect(t[1]).toMatchObject({ id: 'x', targetEidolonLevel: EidolonLevel.E0 })
})

test('editing a goal above a later goal reorders it to the sorted slot without a phantom', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E0 }),
    makeWarpTarget({ id: 'b', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E0, targetEidolonLevel: EidolonLevel.E1 }),
    makeWarpTarget({ id: 'c', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E1, targetEidolonLevel: EidolonLevel.E2 }),
  ])
  updateTargetTo(form, 1, WarpType.CHARACTER, EidolonLevel.E4)
  const t = current()
  expect(t.map((x) => x.id)).toEqual(['a', 'c', 'b'])
  expect(t.map(warpTarget).map((x) => [x.currentEidolonLevel, x.targetEidolonLevel])).toEqual([
    [EidolonLevel.NONE, EidolonLevel.E0],
    [EidolonLevel.E0, EidolonLevel.E2],
    [EidolonLevel.E2, EidolonLevel.E4],
  ])
})

// --- Owned level (FROM) edits: raise shifts up, lower keeps goals absolute, count preserved ---

test('raising the owned level shifts the chain up and preserves the upgrade count', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E0 }),
    makeWarpTarget({ id: 'b', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E0, targetEidolonLevel: EidolonLevel.E1 }),
  ])
  updateTargetFrom(form, 0, WarpType.CHARACTER, EidolonLevel.E1)
  const t = current()
  expect(t.map(warpTarget).map((x) => [x.currentEidolonLevel, x.targetEidolonLevel])).toEqual([
    [EidolonLevel.E1, EidolonLevel.E2],
    [EidolonLevel.E2, EidolonLevel.E3],
  ])
})

test('lowering the owned level keeps goals absolute and extends the bottom row', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E2, targetEidolonLevel: EidolonLevel.E3 }),
    makeWarpTarget({ id: 'b', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E3, targetEidolonLevel: EidolonLevel.E4 }),
  ])
  updateTargetFrom(form, 0, WarpType.CHARACTER, EidolonLevel.E0)
  const t = current()
  expect(t.map(warpTarget).map((x) => [x.currentEidolonLevel, x.targetEidolonLevel])).toEqual([
    [EidolonLevel.E0, EidolonLevel.E3],
    [EidolonLevel.E3, EidolonLevel.E4],
  ])
})

test('raising the owned superimposition shifts the light cone chain up', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', lightConeId: LC_A, currentSuperimpositionLevel: SuperimpositionLevel.NONE, targetSuperimpositionLevel: SuperimpositionLevel.S1 }),
    makeWarpTarget({ id: 'b', lightConeId: LC_A, currentSuperimpositionLevel: SuperimpositionLevel.S1, targetSuperimpositionLevel: SuperimpositionLevel.S2 }),
  ])
  updateTargetFrom(form, 0, WarpType.LIGHTCONE, SuperimpositionLevel.S1)
  const t = current()
  expect(t.map(warpTarget).map((x) => [x.currentSuperimpositionLevel, x.targetSuperimpositionLevel])).toEqual([
    [SuperimpositionLevel.S1, SuperimpositionLevel.S2],
    [SuperimpositionLevel.S2, SuperimpositionLevel.S3],
  ])
})

// --- Remove preserves the owned level; cap keeps a redundant goal ---

test('removing the lowest goal preserves the owned level on the survivors', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E2, targetEidolonLevel: EidolonLevel.E3 }),
    makeWarpTarget({ id: 'b', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E3, targetEidolonLevel: EidolonLevel.E4 }),
    makeWarpTarget({ id: 'c', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E4, targetEidolonLevel: EidolonLevel.E5 }),
  ])
  removeTarget(form, 0)
  const t = current()
  expect(t.map(warpTarget).map((x) => [x.currentEidolonLevel, x.targetEidolonLevel])).toEqual([
    [EidolonLevel.E2, EidolonLevel.E4],
    [EidolonLevel.E4, EidolonLevel.E5],
  ])
})

test('a chained goal capped at E6 is kept as a redundant goal with no room to pop', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E6 }),
    makeWarpTarget({ id: 'b', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E6, targetEidolonLevel: EidolonLevel.E6 }),
  ])
  updateTargetTo(form, 1, WarpType.CHARACTER, EidolonLevel.E6)
  const t = current()
  expect(t[0]).toMatchObject({ currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E6 })
  expect(t[1]).toMatchObject({ currentEidolonLevel: EidolonLevel.E6, targetEidolonLevel: EidolonLevel.E6 })
})

// --- Add buttons pre-fill owned character eidolons from the save ---

test('addCharGoal seeds the owned eidolon from the save', () => {
  storeMock.byId[CHAR_A] = { form: { characterEidolon: EidolonLevel.E3, lightCone: '99999', lightConeSuperimposition: SuperimpositionLevel.S1 } }
  const { form, current } = fakeForm([])
  addCharGoal(form, CHAR_A)
  const t = current()
  expect(t).toHaveLength(1)
  expect(t[0]).toMatchObject({ currentEidolonLevel: EidolonLevel.E3, targetEidolonLevel: EidolonLevel.E4 })
})

test('addCharAndSignatureGoal seeds owned eidolon but starts the signature from NONE', () => {
  configMock.byId[CHAR_A] = { defaultLightCone: SIG_LC }
  storeMock.byId[CHAR_A] = { form: { characterEidolon: EidolonLevel.E3, lightCone: SIG_LC, lightConeSuperimposition: SuperimpositionLevel.S2 } }
  const { form, current } = fakeForm([])
  addCharAndSignatureGoal(form, CHAR_A)
  const t = current()
  expect(t).toHaveLength(2)
  expect(t[0]).toMatchObject({ characterId: CHAR_A, lightConeId: null, currentEidolonLevel: EidolonLevel.E3, targetEidolonLevel: EidolonLevel.E4 })
  expect(t[1]).toMatchObject({
    lightConeId: SIG_LC,
    currentSuperimpositionLevel: SuperimpositionLevel.NONE,
    targetSuperimpositionLevel: SuperimpositionLevel.S1,
  })
})

test('addCharAndSignatureGoal starts the signature from NONE when a different cone is equipped', () => {
  configMock.byId[CHAR_A] = { defaultLightCone: SIG_LC }
  storeMock.byId[CHAR_A] = { form: { characterEidolon: EidolonLevel.E3, lightCone: OTHER_LC, lightConeSuperimposition: SuperimpositionLevel.S2 } }
  const { form, current } = fakeForm([])
  addCharAndSignatureGoal(form, CHAR_A)
  const t = current()
  expect(t[0]).toMatchObject({ currentEidolonLevel: EidolonLevel.E3, targetEidolonLevel: EidolonLevel.E4 })
  expect(t[1]).toMatchObject({
    lightConeId: SIG_LC,
    currentSuperimpositionLevel: SuperimpositionLevel.NONE,
    targetSuperimpositionLevel: SuperimpositionLevel.S1,
  })
})

test('addSkinGoal appends one compact skin target and rejects a duplicate', () => {
  const bannerId = SKIN_BANNERS[0].id
  const { form, current } = fakeForm([makeWarpTarget({ characterId: CHAR_A, targetEidolonLevel: EidolonLevel.E0 })])

  addSkinGoal(form, bannerId)
  addSkinGoal(form, bannerId)

  expect(current()).toHaveLength(2)
  expect(current()[1]).toEqual({
    kind: WarpTargetKind.SKIN,
    id: expect.any(String),
    skin: { bannerId, drawsDone: 0, drawTarget: 8 },
  })
})

test('addSkinGoal ignores disabled banners', () => {
  const initial = [makeWarpTarget({ characterId: CHAR_A, targetEidolonLevel: EidolonLevel.E0 })]
  const { form, current } = fakeForm(initial)
  const banner = SKIN_BANNERS[0]
  vi.spyOn(skinBanners, 'getSkinBanner').mockReturnValue({ ...banner, enabled: false })

  addSkinGoal(form, banner.id)

  expect(current()).toBe(initial)
})

test.each([true, false])('an existing skin blocks a different banner even when enabled is %s', (enabled) => {
  const banner = SKIN_BANNERS[0]
  const otherBanner = { ...banner, id: 'other-skin', enabled: true }
  const existingSkin = createSkinTarget('saved-skin', { bannerId: banner.id, drawsDone: 3, drawTarget: 7 })
  const initial = [existingSkin]
  const { form, current } = fakeForm(initial)
  vi.spyOn(skinBanners, 'getSkinBanner').mockImplementation((id) => {
    if (id === banner.id) return { ...banner, enabled }
    if (id === otherBanner.id) return otherBanner
    return undefined
  })

  expect(hasSkinTarget(current())).toBe(true)
  addSkinGoal(form, otherBanner.id)

  expect(current()).toBe(initial)
  expect(current()[0]).toEqual(existingSkin)

  removeTarget(form, 0)
  expect(hasSkinTarget(current())).toBe(false)
  addSkinGoal(form, otherBanner.id)

  expect(current()).toEqual([{
    kind: WarpTargetKind.SKIN,
    id: expect.any(String),
    skin: { bannerId: otherBanner.id, drawsDone: 0, drawTarget: 8 },
  }])
})

test('raising draws done past the draw target pushes the target up', () => {
  const { form, current } = fakeForm([])

  addSkinGoal(form, SKIN_BANNERS[0].id)
  updateSkinGoal(form, 0, { drawTarget: 5 })

  expect(current()[0]).toMatchObject({ skin: { drawsDone: 0, drawTarget: 5 } })

  updateSkinGoal(form, 0, { drawsDone: 6 })

  expect(current()[0]).toMatchObject({ skin: { drawsDone: 6, drawTarget: 7 } })
})

test('skin targets do not affect character chains around them', () => {
  const { form, current } = fakeForm([makeWarpTarget({ id: 'a', characterId: CHAR_A, targetEidolonLevel: EidolonLevel.E0 })])

  addSkinGoal(form, SKIN_BANNERS[0].id)
  addCharGoal(form, CHAR_A)

  expect(current()[2]).toMatchObject({ characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E0, targetEidolonLevel: EidolonLevel.E1 })

  removeTarget(form, 0)

  expect(current().map((t) => t.kind)).toEqual([WarpTargetKind.SKIN, WarpTargetKind.WARP])
  expect(current()[1]).toMatchObject({ currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E1 })
})

test('skin edits replace only the skin goal and ordinary edits cannot add warp fields to it', () => {
  const skin = createSkinTarget('skin', { bannerId: SKIN_BANNERS[0].id, drawsDone: 0, drawTarget: 5 })
  const character = makeWarpTarget({ id: 'character', characterId: CHAR_A, targetEidolonLevel: EidolonLevel.E0 })
  const { form, current } = fakeForm([character, skin])

  updateSkinGoal(form, 1, { drawsDone: 6 })
  updateTarget(form, 1, { characterId: CHAR_B })
  updateTargetFrom(form, 1, WarpType.CHARACTER, EidolonLevel.E2)
  updateTargetTo(form, 1, WarpType.CHARACTER, EidolonLevel.E4)

  expect(current()).toEqual([
    character,
    { ...skin, skin: { ...skin.skin, drawsDone: 6, drawTarget: 7 } },
  ])
})

test('reflow keeps the skin in place and dragging or removing it preserves warp chains', () => {
  const skin = createSkinTarget('skin', { bannerId: SKIN_BANNERS[0].id, drawsDone: 3, drawTarget: 7 })
  const lightCone = makeWarpTarget({ id: 'lc', lightConeId: LC_A, targetSuperimpositionLevel: SuperimpositionLevel.S1 })
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E2, targetEidolonLevel: EidolonLevel.E3 }),
    skin,
    makeWarpTarget({ id: 'b', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E3, targetEidolonLevel: EidolonLevel.E4 }),
    lightCone,
  ])

  updateTargetTo(form, 0, WarpType.CHARACTER, EidolonLevel.E5)

  expect(current().map((target) => target.id)).toEqual(['b', 'skin', 'a', 'lc'])
  expect(current()[1]).toBe(skin)
  expect(current()[0]).toMatchObject({ currentEidolonLevel: EidolonLevel.E2, targetEidolonLevel: EidolonLevel.E4 })
  expect(current()[2]).toMatchObject({ currentEidolonLevel: EidolonLevel.E4, targetEidolonLevel: EidolonLevel.E5 })

  moveTarget(form, 'skin', 'lc')
  expect(current().map((target) => target.id)).toEqual(['b', 'a', 'lc', 'skin'])
  expect(current()[3]).toBe(skin)

  moveTarget(form, 'skin', 'b')
  expect(current().map((target) => target.id)).toEqual(['skin', 'b', 'a', 'lc'])

  const warpPlan = current().slice(1)
  removeTarget(form, 0)
  expect(current()).toEqual(warpPlan)
  expect(current()[2]).toEqual(lightCone)
})

test('removing a light cone goal preserves ownership across a skin target', () => {
  const skin = createSkinTarget('skin', { bannerId: SKIN_BANNERS[0].id, drawsDone: 2, drawTarget: 8 })
  const { form, current } = fakeForm([
    makeWarpTarget({
      id: 'first',
      lightConeId: LC_A,
      currentSuperimpositionLevel: SuperimpositionLevel.S1,
      targetSuperimpositionLevel: SuperimpositionLevel.S2,
    }),
    skin,
    makeWarpTarget({
      id: 'last',
      lightConeId: LC_A,
      currentSuperimpositionLevel: SuperimpositionLevel.S2,
      targetSuperimpositionLevel: SuperimpositionLevel.S4,
    }),
  ])

  removeTarget(form, 0)

  expect(current()[0]).toBe(skin)
  expect(current()[1]).toMatchObject({ currentSuperimpositionLevel: SuperimpositionLevel.S1, targetSuperimpositionLevel: SuperimpositionLevel.S4 })
  expect(getLightConeSuperimpositionFloor(current(), LC_A, current().length)).toBe(SuperimpositionLevel.S4)
})
