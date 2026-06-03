import type { UseFormReturnType } from '@mantine/form'
import {
  addCharGoal,
  getCharacterEidolonFloor,
  getLightConeSuperimpositionFloor,
  moveTarget,
  removeTarget,
  updateTargetFrom,
  updateTargetTo,
} from 'lib/tabs/tabWarp/warpTargetMutations'
import {
  EidolonLevel,
  SuperimpositionLevel,
  type WarpRequest,
  type WarpTarget,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import {
  expect,
  test,
} from 'vitest'

const CHAR_A = '1001' as CharacterId
const CHAR_B = '1002' as CharacterId
const LC_A = '20001' as LightConeId

function makeWarpTarget(patch: Partial<WarpTarget> = {}): WarpTarget {
  return {
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

// Minimal stand-in for the Mantine form: only getValues().targets and setFieldValue are exercised.
function fakeForm(initial: WarpTarget[]) {
  let targets = initial
  const form = {
    getValues: () => ({ targets }),
    setFieldValue: (_field: string, value: WarpTarget[]) => { targets = value },
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
  expect(targets[0].characterId).toBe(CHAR_A)
  expect(targets[0].targetEidolonLevel).toBe(EidolonLevel.E0)
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
  expect(t.map((x) => x.targetEidolonLevel)).toEqual([EidolonLevel.E0, EidolonLevel.E1, EidolonLevel.E2])
  expect(t.map((x) => x.currentEidolonLevel)).toEqual([EidolonLevel.NONE, EidolonLevel.E0, EidolonLevel.E1])
})

test('reordering one character does not move another character\'s row', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E2 }),
    makeWarpTarget({ id: 'x', characterId: CHAR_B, currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E0 }),
    makeWarpTarget({ id: 'b', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E2, targetEidolonLevel: EidolonLevel.E3 }),
  ])
  // raise A's first goal above its second; A's rows reorder but B's row stays in the middle
  updateTargetTo(form, 0, true, EidolonLevel.E5)
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
  updateTargetTo(form, 1, true, EidolonLevel.E4)
  const t = current()
  expect(t.map((x) => x.id)).toEqual(['a', 'c', 'b'])
  expect(t.map((x) => [x.currentEidolonLevel, x.targetEidolonLevel])).toEqual([
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
  updateTargetFrom(form, 0, true, EidolonLevel.E1)
  const t = current()
  expect(t.map((x) => [x.currentEidolonLevel, x.targetEidolonLevel])).toEqual([
    [EidolonLevel.E1, EidolonLevel.E2],
    [EidolonLevel.E2, EidolonLevel.E3],
  ])
})

test('lowering the owned level keeps goals absolute and extends the bottom row', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E2, targetEidolonLevel: EidolonLevel.E3 }),
    makeWarpTarget({ id: 'b', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E3, targetEidolonLevel: EidolonLevel.E4 }),
  ])
  updateTargetFrom(form, 0, true, EidolonLevel.E0)
  const t = current()
  expect(t.map((x) => [x.currentEidolonLevel, x.targetEidolonLevel])).toEqual([
    [EidolonLevel.E0, EidolonLevel.E3],
    [EidolonLevel.E3, EidolonLevel.E4],
  ])
})

test('raising the owned superimposition shifts the light cone chain up', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', lightConeId: LC_A, currentSuperimpositionLevel: SuperimpositionLevel.NONE, targetSuperimpositionLevel: SuperimpositionLevel.S1 }),
    makeWarpTarget({ id: 'b', lightConeId: LC_A, currentSuperimpositionLevel: SuperimpositionLevel.S1, targetSuperimpositionLevel: SuperimpositionLevel.S2 }),
  ])
  updateTargetFrom(form, 0, false, SuperimpositionLevel.S1)
  const t = current()
  expect(t.map((x) => [x.currentSuperimpositionLevel, x.targetSuperimpositionLevel])).toEqual([
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
  expect(t.map((x) => [x.currentEidolonLevel, x.targetEidolonLevel])).toEqual([
    [EidolonLevel.E2, EidolonLevel.E4],
    [EidolonLevel.E4, EidolonLevel.E5],
  ])
})

test('a chained goal capped at E6 is kept as a redundant goal with no room to pop', () => {
  const { form, current } = fakeForm([
    makeWarpTarget({ id: 'a', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E6 }),
    makeWarpTarget({ id: 'b', characterId: CHAR_A, currentEidolonLevel: EidolonLevel.E6, targetEidolonLevel: EidolonLevel.E6 }),
  ])
  updateTargetTo(form, 1, true, EidolonLevel.E6)
  const t = current()
  expect(t[0]).toMatchObject({ currentEidolonLevel: EidolonLevel.NONE, targetEidolonLevel: EidolonLevel.E6 })
  expect(t[1]).toMatchObject({ currentEidolonLevel: EidolonLevel.E6, targetEidolonLevel: EidolonLevel.E6 })
})
