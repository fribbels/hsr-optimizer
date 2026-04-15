// @vitest-environment jsdom
import { CombatBuffs } from 'lib/constants/constants'
import { ComboType } from 'lib/optimization/rotation/comboType'
import {
  createDefaultCombatBuffs,
  createDefaultFormState,
  createDefaultRatingFilters,
  createDefaultStatFilters,
  createDefaultTeammate,
} from 'lib/stores/optimizerForm/optimizerFormDefaults'
import {
  describe,
  expect,
  it,
} from 'vitest'

describe('createDefaultTeammate', () => {
  it('should have undefined identity fields', () => {
    const teammate = createDefaultTeammate()
    expect(teammate.characterId).toBeUndefined()
    expect(teammate.lightCone).toBeUndefined()
    expect(teammate.teamRelicSet).toBeUndefined()
    expect(teammate.teamOrnamentSet).toBeUndefined()
  })

  it('should have correct numeric defaults', () => {
    const teammate = createDefaultTeammate()
    expect(teammate.characterEidolon).toBe(0)
    expect(teammate.lightConeSuperimposition).toBe(1)
  })

  it('should have empty conditional maps', () => {
    const teammate = createDefaultTeammate()
    expect(teammate.characterConditionals).toEqual({})
    expect(teammate.lightConeConditionals).toEqual({})
  })

  it('should return a new object each call', () => {
    const a = createDefaultTeammate()
    const b = createDefaultTeammate()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })
})

describe('createDefaultStatFilters', () => {
  it('should have all 20 fields set to undefined', () => {
    const filters = createDefaultStatFilters()
    const keys = Object.keys(filters)
    expect(keys).toHaveLength(20)
    for (const key of keys) {
      expect(filters[key as keyof typeof filters]).toBeUndefined()
    }
  })
})

describe('createDefaultRatingFilters', () => {
  it('should have all 18 fields set to undefined', () => {
    const filters = createDefaultRatingFilters()
    const keys = Object.keys(filters)
    expect(keys).toHaveLength(18)
    for (const key of keys) {
      expect(filters[key as keyof typeof filters]).toBeUndefined()
    }
  })
})

describe('createDefaultCombatBuffs', () => {
  it('should have a key for every CombatBuff set to 0', () => {
    const buffs = createDefaultCombatBuffs()
    for (const entry of Object.values(CombatBuffs)) {
      expect(buffs[entry.key]).toBe(0)
    }
  })

  it('should have the correct number of keys', () => {
    const buffs = createDefaultCombatBuffs()
    expect(Object.keys(buffs)).toHaveLength(Object.keys(CombatBuffs).length)
  })
})

describe('createDefaultFormState', () => {
  it('should have undefined characterId', () => {
    const form = createDefaultFormState()
    expect(form.characterId).toBeUndefined()
  })

  it('should have correct character defaults', () => {
    const form = createDefaultFormState()
    expect(form.characterEidolon).toBe(0)
    expect(form.characterLevel).toBe(80)
    expect(form.lightCone).toBeUndefined()
    expect(form.lightConeLevel).toBe(80)
    expect(form.lightConeSuperimposition).toBe(1)
  })

  it('should have three independent default teammates', () => {
    const form = createDefaultFormState()
    expect(form.teammates).toHaveLength(3)
    for (const teammate of form.teammates) {
      expect(teammate.characterId).toBeUndefined()
      expect(teammate.characterEidolon).toBe(0)
      expect(teammate.lightConeSuperimposition).toBe(1)
    }
    // Independence: mutating one should not affect others
    form.teammates[0].characterEidolon = 6
    expect(form.teammates[1].characterEidolon).toBe(0)
    expect(form.teammates[2].characterEidolon).toBe(0)
  })

  it('should have correct relic filter defaults', () => {
    const form = createDefaultFormState()
    expect(form.enhance).toBe(9)
    expect(form.grade).toBe(5)
    expect(form.rank).toBe(0)
    expect(form.exclude).toEqual([])
    expect(form.includeEquippedRelics).toBe(true)
    expect(form.keepCurrentRelics).toBe(false)
    expect(form.rankFilter).toBe(true)
    expect(form.mainStatUpscaleLevel).toBe(15)
    expect(form.mainHead).toEqual([])
    expect(form.mainHands).toEqual([])
    expect(form.mainBody).toEqual([])
    expect(form.mainFeet).toEqual([])
    expect(form.mainPlanarSphere).toEqual([])
    expect(form.mainLinkRope).toEqual([])
    expect(form.setFilters).toEqual({ fourPiece: [], twoPieceCombos: [], ornaments: [] })
  })

  it('should have correct enemy defaults', () => {
    const form = createDefaultFormState()
    expect(form.enemyLevel).toBe(95)
    expect(form.enemyCount).toBe(1)
    expect(form.enemyResistance).toBe(0.2)
    expect(form.enemyEffectResistance).toBe(0.3)
    expect(form.enemyMaxToughness).toBe(360)
    expect(form.enemyElementalWeak).toBe(true)
    expect(form.enemyWeaknessBroken).toBe(false)
  })

  it('should have correct combo defaults', () => {
    const form = createDefaultFormState()
    expect(form.comboType).toBe(ComboType.SIMPLE)
    expect(form.comboStateJson).toBe('{}')
    expect(form.comboPreprocessor).toBe(true)
    expect(form.comboTurnAbilities).toHaveLength(2)
    expect(form.comboTurnAbilities[0]).toBe('NULL')
  })

  it('should have stat and rating filters all undefined', () => {
    const form = createDefaultFormState()
    for (const val of Object.values(form.statFilters)) {
      expect(val).toBeUndefined()
    }
    for (const val of Object.values(form.ratingFilters)) {
      expect(val).toBeUndefined()
    }
  })

  it('should have correct scoring/display defaults', () => {
    const form = createDefaultFormState()
    expect(form.resultSort).toBeUndefined()
    expect(form.resultsLimit).toBe(1024)
    expect(form.deprioritizeBuffs).toBe(false)
    expect(form.statDisplay).toBe('combat')
    expect(form.memoDisplay).toBe('summoner')
  })

  it('should return a new object each call', () => {
    const a = createDefaultFormState()
    const b = createDefaultFormState()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
    // Deep independence
    a.teammates[0].characterEidolon = 6
    expect(b.teammates[0].characterEidolon).toBe(0)
  })
})
