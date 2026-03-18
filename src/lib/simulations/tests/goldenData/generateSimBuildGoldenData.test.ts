// @vitest-environment jsdom
import { writeFileSync } from 'fs'
import { performance } from 'perf_hooks'
import { applyTeamAwareSetConditionalPresets } from 'lib/conditionals/evaluation/applyPresets'
import { Stats } from 'lib/constants/constants'
import {
  type SetsOrnaments,
  type SetsRelics,
  SetsOrnamentsNames,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import { BasicKey } from 'lib/optimization/basicStatsArray'
import { getAKeyName, GlobalRegister, StatKey } from 'lib/optimization/engine/config/keys'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { AbilityMeta } from 'lib/optimization/rotation/turnAbilityConfig'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import type { Simulation } from 'lib/simulations/statSimulationTypes'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import type { CharacterId } from 'types/character'
import type { Form } from 'types/form'
import type { LightConeId } from 'types/lightCone'
import {
  trackedBasicStatKeys,
  trackedCombatStatKeys,
} from 'lib/simulations/tests/simTestUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { describe, test } from 'vitest'

Metadata.initialize()

// ─── Character → Light Cone mapping (from webgpuTestGenerator.ts) ───────────

// Character → signature Light Cone mapping (from webgpuTestGenerator.ts, IDs hardcoded)
const LC_MAP: Record<string, LightConeId> = Object.fromEntries([
  ['1003', '23000'], ['1004', '23004'], ['1005', '23006'], ['1006', '23007'],
  ['1101', '23003'], ['1102', '23001'], ['1104', '23005'], ['1107', '23002'],
  ['1112', '23016'], ['1203', '23008'], ['1204', '23010'], ['1205', '23009'],
  ['1208', '23011'], ['1209', '23012'], ['1211', '23013'], ['1212', '23014'],
  ['1213', '23015'], ['1217', '23017'], ['1218', '23029'], ['1220', '23031'],
  ['1221', '23030'], ['1222', '23032'], ['1225', '23035'], ['1302', '23018'],
  ['1303', '23019'], ['1304', '23023'], ['1305', '23020'], ['1306', '23021'],
  ['1307', '23022'], ['1308', '23024'], ['1309', '23026'], ['1310', '23025'],
  ['1313', '23034'], ['1314', '23028'], ['1315', '23027'], ['1317', '23033'],
  ['1401', '23037'], ['1402', '23036'], ['1403', '23038'], ['1404', '23039'],
  ['1405', '23041'], ['1407', '23040'],
  ['1406', '23043'], // Cipher
  ['1408', '23044'], // Phainon
  ['1409', '23042'], // Hyacine
  ['1410', '23047'], // Hysilens
  ['1412', '23048'], // Cerydra
  ['1413', '23049'], // Evernight
  ['1414', '23051'], // PermansorTerrae
  ['1415', '23052'], // Cyrene
].map(([k, v]) => [k, v as LightConeId]))

// ─── Stat Spreads ───────────────────────────────────────────────────────────

type StatSpread = { label: string, stats: Record<string, number> }

const STAT_SPREADS: StatSpread[] = [
  { label: 'balanced', stats: { [Stats.ATK_P]: 10, [Stats.DEF_P]: 10, [Stats.HP_P]: 10, [Stats.SPD]: 10, [Stats.CR]: 10, [Stats.CD]: 10, [Stats.EHR]: 10, [Stats.RES]: 10, [Stats.BE]: 10 } },
  { label: 'crit', stats: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 15, [Stats.CD]: 15, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5 } },
  { label: 'speed', stats: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 15, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5 } },
  { label: 'break', stats: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 15 } },
  { label: 'defensive', stats: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 15, [Stats.HP_P]: 15, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5 } },
  { label: 'none', stats: {} },
  { label: 'atk_heavy', stats: { [Stats.ATK_P]: 20, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5 } },
  { label: 'cd_stack', stats: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 25, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5 } },
  { label: 'ehr', stats: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 15, [Stats.RES]: 5, [Stats.BE]: 5 } },
  { label: 'err', stats: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5, [Stats.ERR]: 10 } },
  { label: 'ohb', stats: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 10, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5, [Stats.OHB]: 15 } },
  { label: 'high_rolls', stats: { [Stats.ATK_P]: 15, [Stats.DEF_P]: 15, [Stats.HP_P]: 15, [Stats.SPD]: 15, [Stats.CR]: 15, [Stats.CD]: 15, [Stats.EHR]: 15, [Stats.RES]: 15, [Stats.BE]: 15 } },
  { label: 'spd_crit', stats: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 15, [Stats.CR]: 10, [Stats.CD]: 15, [Stats.EHR]: 5, [Stats.RES]: 5, [Stats.BE]: 5 } },
  { label: 'break_ehr', stats: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 5, [Stats.HP_P]: 5, [Stats.SPD]: 5, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 15, [Stats.RES]: 5, [Stats.BE]: 15 } },
  { label: 'tank', stats: { [Stats.ATK_P]: 5, [Stats.DEF_P]: 20, [Stats.HP_P]: 20, [Stats.SPD]: 10, [Stats.CR]: 5, [Stats.CD]: 5, [Stats.EHR]: 5, [Stats.RES]: 10, [Stats.BE]: 5 } },
  { label: 'low_rolls', stats: { [Stats.ATK_P]: 3, [Stats.DEF_P]: 3, [Stats.HP_P]: 3, [Stats.SPD]: 3, [Stats.CR]: 3, [Stats.CD]: 3, [Stats.EHR]: 3, [Stats.RES]: 3, [Stats.BE]: 3 } },
]

// ─── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_MAINS = {
  simBody: Stats.CR,
  simFeet: Stats.SPD,
  simPlanarSphere: Stats.ATK_P,
  simLinkRope: Stats.ATK_P,
}

const DEFAULT_RELIC_SET: SetsRelics = SetsRelicsNames[0]
const DEFAULT_ORNAMENT_SET: SetsOrnaments = SetsOrnamentsNames[0]

const INCLUDED_TRAILBLAZERS = new Set(['8001', '8003', '8005', '8007'])

// ─── Golden Data Types ──────────────────────────────────────────────────────

interface GoldenBuildExpected {
  actionDamage: Record<string, number>
  primaryActionStats: {
    DMG_BOOST: number
    sourceEntityCR: number
    sourceEntityCD: number
    sourceEntityElementDmgBoost: number
  }
  comboDmg: number
  ehp: number
  basicStats: Record<string, number>
  combatStats: Record<string, number>
}

interface GoldenBuild {
  label: string
  spreadLabel: string
  simRelicSet1: SetsRelics
  simRelicSet2: SetsRelics
  simOrnamentSet: SetsOrnaments
  expected: GoldenBuildExpected
}

interface GoldenCharacterData {
  characterId: CharacterId
  lightConeId: LightConeId
  builds: GoldenBuild[]
}

interface GoldenSimBuildData {
  meta: {
    generatedAt: string
    characterCount: number
    totalBuilds: number
    version: string
  }
  characters: GoldenCharacterData[]
}

// ─── Result Collection ──────────────────────────────────────────────────────

const BasicKeyNames = Object.keys(BasicKey) as (keyof typeof BasicKey)[]

function collectBuildResult(
  result: ReturnType<typeof runStatSimulations>[0],
): GoldenBuildExpected {
  const { x, primaryActionStats, actionDamage } = result

  const basicStats: Record<string, number> = {}
  for (const key of trackedBasicStatKeys) {
    basicStats[BasicKeyNames[key]] = precisionRound(x.c.a[key], 6)
  }

  const combatStats: Record<string, number> = {}
  for (const key of trackedCombatStatKeys) {
    combatStats[getAKeyName(key)] = precisionRound(x.a[key], 6)
  }
  if (primaryActionStats) {
    combatStats['CR'] = precisionRound(primaryActionStats.sourceEntityCR, 6)
    combatStats['CD'] = precisionRound(primaryActionStats.sourceEntityCD, 6)
    combatStats['DMG_BOOST'] = precisionRound(
      primaryActionStats.DMG_BOOST + primaryActionStats.sourceEntityElementDmgBoost, 6,
    )
  }
  combatStats['EHP'] = precisionRound(x.a[StatKey.EHP], 6)
  combatStats['COMBO_DMG'] = precisionRound(x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG), 6)

  const roundedActionDamage: Record<string, number> = {}
  for (const ability of ['BASIC', 'SKILL', 'ULT', 'FUA', 'DOT', 'BREAK', 'MEMO_SKILL', 'MEMO_TALENT']) {
    roundedActionDamage[`${ability}_DMG`] = 0
  }
  roundedActionDamage['HEAL_VALUE'] = 0
  roundedActionDamage['SHIELD_VALUE'] = 0

  if (actionDamage) {
    let healValue = 0
    let shieldValue = 0
    for (const [actionName, dmg] of Object.entries(actionDamage)) {
      const abilityKind = actionName.replace(/^[A-Z]+_/, '')
      const meta = AbilityMeta[abilityKind as keyof typeof AbilityMeta]
      if (meta?.category === 'heal') healValue += dmg ?? 0
      else if (meta?.category === 'shield') shieldValue += dmg ?? 0
      else if (meta?.category === 'damage') roundedActionDamage[`${abilityKind}_DMG`] = precisionRound(dmg ?? 0, 6)
    }
    roundedActionDamage['HEAL_VALUE'] = precisionRound(healValue, 6)
    roundedActionDamage['SHIELD_VALUE'] = precisionRound(shieldValue, 6)
  }

  return {
    actionDamage: roundedActionDamage,
    primaryActionStats: {
      DMG_BOOST: precisionRound(primaryActionStats?.DMG_BOOST ?? 0, 6),
      sourceEntityCR: precisionRound(primaryActionStats?.sourceEntityCR ?? 0, 6),
      sourceEntityCD: precisionRound(primaryActionStats?.sourceEntityCD ?? 0, 6),
      sourceEntityElementDmgBoost: precisionRound(primaryActionStats?.sourceEntityElementDmgBoost ?? 0, 6),
    },
    comboDmg: precisionRound(x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG), 6),
    ehp: precisionRound(x.a[StatKey.EHP], 6),
    basicStats,
    combatStats,
  }
}

// ─── Form Generation ────────────────────────────────────────────────────────

function getLightConeForCharacter(characterId: CharacterId): LightConeId {
  if (LC_MAP[characterId]) return LC_MAP[characterId]

  // Fallback: first 5-star LC matching the character's path
  const dbMetadata = getGameMetadata()
  const characterPath = dbMetadata.characters[characterId]?.path
  if (characterPath) {
    for (const lc of Object.values(dbMetadata.lightCones)) {
      if (lc.path === characterPath && lc.rarity === 5) return lc.id
    }
  }
  return '23001' as LightConeId // In the Night
}

function generateCharacterForm(characterId: CharacterId, lightConeId: LightConeId): Form | null {
  const form = generateFullDefaultForm(characterId, lightConeId, 0, 1)
  if (!form) return null

  const simMeta = getGameMetadata().characters[characterId]?.scoringMetadata?.simulation
  if (simMeta?.teammates) {
    for (let idx = 0; idx < Math.min(simMeta.teammates.length, 3); idx++) {
      const tm = simMeta.teammates[idx]
      if (!tm?.characterId) continue
      const tmForm = generateFullDefaultForm(tm.characterId, tm.lightCone, tm.characterEidolon, tm.lightConeSuperimposition, true)
      if (!tmForm) continue
      if (tm.teamRelicSet) tmForm.teamRelicSet = tm.teamRelicSet
      if (tm.teamOrnamentSet) tmForm.teamOrnamentSet = tm.teamOrnamentSet
      if (idx === 0) form.teammate0 = tmForm
      if (idx === 1) form.teammate1 = tmForm
      if (idx === 2) form.teammate2 = tmForm
    }
  }

  applyTeamAwareSetConditionalPresets(form)
  return form
}

// ─── Character filtering ────────────────────────────────────────────────────

function getTestCharacterIds(): CharacterId[] {
  const dbMetadata = getGameMetadata()
  const ids: CharacterId[] = []
  for (const [id, meta] of Object.entries(dbMetadata.characters)) {
    if (meta.unreleased) continue
    // Only include one trailblazer per path (odd IDs: 8001, 8003, 8005, 8007)
    if (id.startsWith('8') && !INCLUDED_TRAILBLAZERS.has(id)) continue
    ids.push(id as CharacterId)
  }
  return ids
}

// ─── Generator ──────────────────────────────────────────────────────────────

describe('generate simulateBuild golden data', () => {
  test('generate golden data: all 5★ chars × all sets × stat spreads', () => {
    const t0 = performance.now()
    const characterIds = getTestCharacterIds()

    const goldenData: GoldenSimBuildData = {
      meta: {
        generatedAt: new Date().toISOString(),
        characterCount: 0,
        totalBuilds: 0,
        version: '1.0.0',
      },
      characters: [],
    }

    let totalBuilds = 0
    let errorCount = 0

    for (const characterId of characterIds) {
      const lightConeId = getLightConeForCharacter(characterId)

      try {
        const form = generateCharacterForm(characterId, lightConeId)
        if (!form) continue

        const context = generateContext(form)
        const builds: GoldenBuild[] = []

        // All relic 4pc sets × all stat spreads (default ornament)
        for (const relicSet of SetsRelicsNames) {
          for (const spread of STAT_SPREADS) {
            const sim: Simulation = {
              simType: StatSimTypes.SubstatRolls,
              request: {
                simRelicSet1: relicSet,
                simRelicSet2: relicSet,
                simOrnamentSet: DEFAULT_ORNAMENT_SET,
                ...DEFAULT_MAINS,
                stats: spread.stats,
              },
            } as unknown as Simulation

            const result = runStatSimulations([sim], form, context)[0]
            builds.push({
              label: `relic_${relicSet}_${spread.label}`,
              spreadLabel: spread.label,
              simRelicSet1: relicSet,
              simRelicSet2: relicSet,
              simOrnamentSet: DEFAULT_ORNAMENT_SET,
              expected: collectBuildResult(result),
            })
          }
        }

        // All ornament sets × all stat spreads (default relic)
        for (const ornamentSet of SetsOrnamentsNames) {
          for (const spread of STAT_SPREADS) {
            const sim: Simulation = {
              simType: StatSimTypes.SubstatRolls,
              request: {
                simRelicSet1: DEFAULT_RELIC_SET,
                simRelicSet2: DEFAULT_RELIC_SET,
                simOrnamentSet: ornamentSet,
                ...DEFAULT_MAINS,
                stats: spread.stats,
              },
            } as unknown as Simulation

            const result = runStatSimulations([sim], form, context)[0]
            builds.push({
              label: `ornament_${ornamentSet}_${spread.label}`,
              spreadLabel: spread.label,
              simRelicSet1: DEFAULT_RELIC_SET,
              simRelicSet2: DEFAULT_RELIC_SET,
              simOrnamentSet: ornamentSet,
              expected: collectBuildResult(result),
            })
          }
        }

        totalBuilds += builds.length
        goldenData.characters.push({ characterId, lightConeId, builds })
      } catch (error) {
        errorCount++
        const name = getGameMetadata().characters[characterId]?.name ?? characterId
        console.error(`Failed: ${characterId} (${name}):`, error)
      }
    }

    goldenData.meta.characterCount = goldenData.characters.length
    goldenData.meta.totalBuilds = totalBuilds

    const elapsed = performance.now() - t0

    const outputPath = 'src/lib/simulations/tests/goldenData/goldenSimBuildResults.json'
    writeFileSync(outputPath, JSON.stringify(goldenData))

    console.log('================================================================================')
    console.log('GOLDEN SIMULATEBUILD DATA GENERATION')
    console.log('================================================================================')
    console.log(`Characters:    ${goldenData.characters.length}`)
    console.log(`Relic sets:    ${SetsRelicsNames.length}`)
    console.log(`Ornament sets: ${SetsOrnamentsNames.length}`)
    console.log(`Stat spreads:  ${STAT_SPREADS.length}`)
    console.log(`Total builds:  ${totalBuilds}`)
    console.log(`Errors:        ${errorCount}`)
    console.log(`Time:          ${elapsed.toFixed(1)} ms`)
    console.log(`Per build:     ${(elapsed / totalBuilds).toFixed(3)} ms`)
    console.log(`Throughput:    ${(totalBuilds / (elapsed / 1000)).toFixed(0)} builds/sec`)
    console.log('================================================================================')
  }, 300_000)
})
