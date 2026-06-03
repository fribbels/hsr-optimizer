import type { UseFormReturnType } from '@mantine/form'
import {
  addCharGoal,
  getCharacterEidolonFloor,
  getLightConeSuperimpositionFloor,
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
