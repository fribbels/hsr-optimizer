// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { BuildSource } from 'types/savedBuild'
import type { LightConeId } from 'types/lightCone'
import type { CharacterId } from 'types/character'
import type { ScoringMetadata } from 'types/metadata'
import type { Relic } from 'types/relic'
import { Metadata } from 'lib/state/metadataInitializer'
import { migrateBuild } from './buildMigration'

Metadata.initialize()

const CHAR_ID = '1001' as CharacterId
const LC_ID = '21001' as LightConeId
const CHAR_FORM = { characterEidolon: 0, lightCone: LC_ID, lightConeSuperimposition: 1 }

// ---- Layer 2 fixtures (current format, old field names) ----

const LAYER2_OPTIMIZER_BUILD = {
  name: 'DPS Build',
  characterId: CHAR_ID,
  eidolon: 2,
  lightConeId: LC_ID,
  superimposition: 3,
  equipped: { Head: 'r1' },
  team: [{
    characterId: '1201' as CharacterId,
    eidolon: 0,
    lightConeId: '21002' as LightConeId,
    superimposition: 1,
    relicSet: 'SetA',
    ornamentSet: 'SetB',
    characterConditionals: { enhanced: true },
    lightConeConditionals: {},
  }],
  optimizerMetadata: {
    comboType: 'simple',
    comboStateJson: '{}',
    setConditionals: {},
    presets: true,
    statFilters: null,
  },
  deprioritizeBuffs: false,
  characterConditionals: { enhanced: true },
  lightConeConditionals: {},
}

const LAYER2_CHARACTER_BUILD = {
  name: 'Relic Snapshot',
  characterId: CHAR_ID,
  eidolon: 0,
  lightConeId: LC_ID,
  superimposition: 1,
  equipped: { Head: 'r1', Body: 'r2' },
  team: [],
  optimizerMetadata: null,
  deprioritizeBuffs: true,
  characterConditionals: undefined,
  lightConeConditionals: undefined,
}

// ---- Layer 1 fixture (ancient format) ----

const LAYER1_ANCIENT_BUILD = {
  build: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'],
  name: 'Old Build',
  score: { score: '50.2', rating: 'A' },
}

describe('migrateBuild', () => {
  describe('Layer 1: ancient format', () => {
    it('converts { build: string[], name, score } to CharacterSavedBuild', () => {
      const relicsById = new Map<string, Relic>([
        ['r1', { id: 'r1', part: 'Head' }],
        ['r2', { id: 'r2', part: 'Hands' }],
      ] as any)
      const result = migrateBuild(LAYER1_ANCIENT_BUILD as any, CHAR_ID, CHAR_FORM, relicsById, {} as ScoringMetadata)
      expect(result).not.toBeNull()
      expect(result!.source).toBe(BuildSource.Character)
      expect(result!.name).toBe('Old Build')
      expect(result!.equipped.Head).toBe('r1')
    })

    it('handles missing relics gracefully', () => {
      const result = migrateBuild(LAYER1_ANCIENT_BUILD as any, CHAR_ID, CHAR_FORM, new Map<string, Relic>(), {} as ScoringMetadata)
      expect(result).not.toBeNull()
      expect(result!.equipped).toEqual({})
    })

    it('returns null for completely invalid data', () => {
      const result = migrateBuild({} as any, CHAR_ID, CHAR_FORM, new Map<string, Relic>(), {} as ScoringMetadata)
      expect(result).toBeNull()
    })
  })

  describe('Layer 2: current format (old field names)', () => {
    it('renames fields and adds source for optimizer builds', () => {
      const result = migrateBuild(LAYER2_OPTIMIZER_BUILD as any, CHAR_ID, CHAR_FORM, new Map<string, Relic>(), {} as ScoringMetadata)!
      expect(result.source).toBe(BuildSource.Optimizer)
      expect(result.characterEidolon).toBe(2)
      expect(result.lightCone).toBe(LC_ID)
      expect(result.lightConeSuperimposition).toBe(3)
      // Old names should not be on the result
      expect((result as any).eidolon).toBeUndefined()
      expect((result as any).lightConeId).toBeUndefined()
    })

    it('renames teammate fields', () => {
      const result = migrateBuild(LAYER2_OPTIMIZER_BUILD as any, CHAR_ID, CHAR_FORM, new Map<string, Relic>(), {} as ScoringMetadata)!
      const tm = result.team[0]!
      expect(tm.teamRelicSet).toBe('SetA')
      expect(tm.teamOrnamentSet).toBe('SetB')
      expect((tm as any).relicSet).toBeUndefined()
    })

    it('converts optimizerMetadata === null to BuildSource.Character', () => {
      const result = migrateBuild(LAYER2_CHARACTER_BUILD as any, CHAR_ID, CHAR_FORM, new Map<string, Relic>(), {} as ScoringMetadata)!
      expect(result.source).toBe(BuildSource.Character)
      // deprioritizeBuffs should not be on CharacterSavedBuild
      expect('deprioritizeBuffs' in result).toBe(false)
    })

    it('converts comboStateJson: null to empty string', () => {
      const buildWithNullCombo = { ...LAYER2_OPTIMIZER_BUILD, optimizerMetadata: { ...LAYER2_OPTIMIZER_BUILD.optimizerMetadata, comboStateJson: null } }
      const result = migrateBuild(buildWithNullCombo as any, CHAR_ID, CHAR_FORM, new Map<string, Relic>(), {} as ScoringMetadata)!
      expect((result as any).comboStateJson).toBe('{}')
    })

    it('pads team array to 3-slot tuple with nulls', () => {
      const result = migrateBuild(LAYER2_OPTIMIZER_BUILD as any, CHAR_ID, CHAR_FORM, new Map<string, Relic>(), {} as ScoringMetadata)!
      expect(result.team).toHaveLength(3)
      expect(result.team[0]).not.toBeNull()
      expect(result.team[1]).toBeNull()
      expect(result.team[2]).toBeNull()
    })

    it('renames presets → comboPreprocessor', () => {
      const result = migrateBuild(LAYER2_OPTIMIZER_BUILD as any, CHAR_ID, CHAR_FORM, new Map<string, Relic>(), {} as ScoringMetadata)!
      expect((result as any).comboPreprocessor).toBe(true)
      expect((result as any).presets).toBeUndefined()
    })

    it('infers comboType when missing', () => {
      const buildNoComboType = {
        ...LAYER2_OPTIMIZER_BUILD,
        optimizerMetadata: { ...LAYER2_OPTIMIZER_BUILD.optimizerMetadata, comboType: undefined, comboStateJson: '{"data":true}' },
      }
      const result = migrateBuild(buildNoComboType as any, CHAR_ID, CHAR_FORM, new Map<string, Relic>(), {} as ScoringMetadata)!
      expect((result as any).comboType).toBe('advanced')
    })
  })

  describe('Layer 3: new format (already migrated)', () => {
    it('returns build unchanged if source field exists', () => {
      const newBuild = { source: BuildSource.Character, name: 'Test', characterId: CHAR_ID, equipped: {}, characterEidolon: 0, lightCone: LC_ID, lightConeSuperimposition: 1, team: [null, null, null] }
      const result = migrateBuild(newBuild as any, CHAR_ID, CHAR_FORM, new Map<string, Relic>(), {} as ScoringMetadata)
      expect(result).toEqual(newBuild)
    })
  })
})
