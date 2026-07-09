import { Gilgamesh } from 'lib/tabs/tabAvVisualizer/battleConfigs/Gilgamesh'
import type { BattleEntity } from 'lib/tabs/tabAvVisualizer/types'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { simulateBattle } from './simulateBattle'

const GILGAMESH_ID = '1509'

// Lives outside battleConfigs/ deliberately — that folder's index.ts does an eager import.meta.glob over
// every .ts file in it (to auto-register each character's config), so a test file placed directly inside
// gets swept up and loaded by the real app too, where vi.mock isn't available and crashes the dev server.
//
// vi.mock calls are hoisted above all imports by vitest's transform, so referencing the statically
// imported `Gilgamesh` here (rather than a fresh require) is safe despite the apparent ordering.
vi.mock('lib/tabs/tabAvVisualizer/battleConfigs', () => ({
  getBattleConfig: (id: string) => (id === GILGAMESH_ID ? Gilgamesh : {
    characterId: id,
    energyType: 'standard' as const,
    abilities: { basic: [], skill: [], ult: [] },
  }),
}))

function makeEntity(id: string, spd: number): BattleEntity {
  return { id, type: 'character', name: id, baseSpd: spd, spd, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 }
}

// Covers 秘技's onBattleStart effect — it should grant +3 Interest AND count as one hit toward the shared
// 本王允许你进攻 (extraAttack) counter, same as a real hit would via the hit-count-driven global listener.
describe('Gilgamesh — 秘技 (onBattleStart)', () => {
  it('grants 3 Interest and 1 stack of the extraAttack hit counter at battle start', () => {
    const result = simulateBattle([makeEntity(GILGAMESH_ID, 100)], [], [], [], 150)
    const initialBuffs = result.initialActiveInterventions[GILGAMESH_ID]
    expect(initialBuffs.find((b) => b.effectId === 'gilgamesh_interest')?.stacks).toBe(3)
    expect(initialBuffs.find((b) => b.effectId === 'gilgamesh_permission_to_strike')?.stacks).toBe(1)
  })
})
