import type { PreTeammateSetUpgrade, TeammateSetUpgrade } from 'lib/simulations/teammateUpgradeGrouping'
import { groupTeammateSetUpgrades } from 'lib/simulations/teammateUpgradeGrouping'
import {
  describe,
  expect,
  test,
} from 'vitest'

function input(id: string, set: string, simScore: number, oldSet?: string): PreTeammateSetUpgrade {
  return { id, set, simScore, oldSet } as PreTeammateSetUpgrade
}

function expectGroup(group: TeammateSetUpgrade, ids: string[], sets: string[], simScore: number, oldSet?: string) {
  expect([...group.ids].sort()).toEqual(ids.sort())
  expect([...group.set].sort()).toEqual(sets.sort())
  expect(group.simScore).toBe(simScore)
  expect(group.oldSet).toBe(oldSet)
}

describe('groupTeammateSetUpgrades', () => {
  test('empty input returns empty array', () => {
    expect(groupTeammateSetUpgrades([])).toEqual([])
  })

  test('single entry produces a single group', () => {
    const results = groupTeammateSetUpgrades([
      input('char1', 'SetA', 100),
    ])
    expect(results).toHaveLength(1)
    expectGroup(results[0], ['char1'], ['SetA'], 100)
  })

  test('does not merge different sets for same character at same score', () => {
    const results = groupTeammateSetUpgrades([
      input('char1', 'SetA', 100, 'OldSet'),
      input('char1', 'SetB', 100, 'OldSet'),
    ])
    expect(results).toHaveLength(2)
    expect(results.some((r) => r.set.has('SetA'))).toBe(true)
    expect(results.some((r) => r.set.has('SetB'))).toBe(true)
  })

  test('does not merge sets at different scores', () => {
    const results = groupTeammateSetUpgrades([
      input('char1', 'SetA', 100, 'OldSet'),
      input('char1', 'SetB', 200, 'OldSet'),
    ])
    expect(results).toHaveLength(2)
    expect(results[0].simScore).toBe(200)
    expect(results[1].simScore).toBe(100)
  })

  test('merges characters with same set and score', () => {
    const results = groupTeammateSetUpgrades([
      input('char1', 'SetA', 100, 'OldSet'),
      input('char2', 'SetA', 100, 'OldSet'),
    ])
    expect(results).toHaveLength(1)
    expectGroup(results[0], ['char1', 'char2'], ['SetA'], 100, 'OldSet')
  })

  test('does not merge characters with different oldSet', () => {
    const results = groupTeammateSetUpgrades([
      input('char1', 'SetA', 100, 'OldX'),
      input('char2', 'SetA', 100, 'OldY'),
    ])
    expect(results).toHaveLength(2)
  })

  test('does not merge characters with different sets', () => {
    const results = groupTeammateSetUpgrades([
      input('char1', 'SetA', 100, 'OldSet'),
      input('char2', 'SetB', 100, 'OldSet'),
    ])
    expect(results).toHaveLength(2)
  })

  test('results sorted descending by simScore', () => {
    const results = groupTeammateSetUpgrades([
      input('char1', 'SetA', 50),
      input('char2', 'SetB', 200),
      input('char3', 'SetC', 100),
    ])
    expect(results.map((r) => r.simScore)).toEqual([200, 100, 50])
  })

  test('open slot (no oldSet) groups separately from filled slot', () => {
    const results = groupTeammateSetUpgrades([
      input('char1', 'SetA', 100, undefined),
      input('char2', 'SetA', 100, 'OldSet'),
    ])
    expect(results).toHaveLength(2)
    const openSlot = results.find((r) => !r.oldSet)!
    const filledSlot = results.find((r) => !!r.oldSet)!
    expectGroup(openSlot, ['char1'], ['SetA'], 100, undefined)
    expectGroup(filledSlot, ['char2'], ['SetA'], 100, 'OldSet')
  })

  test('full scenario: 3 teammates x multiple ornaments', () => {
    const results = groupTeammateSetUpgrades([
      input('char1', 'SetA', 100, 'OldSet'),
      input('char1', 'SetB', 100, 'OldSet'),
      input('char1', 'SetC', 90, 'OldSet'),
      input('char2', 'SetA', 100, 'OldSet'),
      input('char2', 'SetB', 100, 'OldSet'),
      input('char2', 'SetD', 80, 'OldSet'),
      input('char3', 'SetA', 100, 'OldSet'),
      input('char3', 'SetC', 95, 'OldSet'),
    ])

    // SetA at 100: char1, char2, char3 all merged
    const groupSetA100 = results.find((r) => r.simScore === 100 && r.set.has('SetA'))!
    expect(groupSetA100).toBeDefined()
    expectGroup(groupSetA100, ['char1', 'char2', 'char3'], ['SetA'], 100, 'OldSet')

    // SetB at 100: char1, char2 merged (separate from SetA)
    const groupSetB100 = results.find((r) => r.simScore === 100 && r.set.has('SetB'))!
    expect(groupSetB100).toBeDefined()
    expectGroup(groupSetB100, ['char1', 'char2'], ['SetB'], 100, 'OldSet')

    expect(results[0].simScore).toBeGreaterThanOrEqual(results[results.length - 1].simScore)
  })

  test('handles duplicate entries gracefully', () => {
    const results = groupTeammateSetUpgrades([
      input('char1', 'SetA', 100),
      input('char1', 'SetA', 100),
    ])
    expect(results).toHaveLength(1)
    expectGroup(results[0], ['char1'], ['SetA'], 100)
  })
})
