import { applySetConditionalPresets, applyScoringMetadataPresets } from 'lib/conditionals/evaluation/applyPresets'
import { TwoPieceStatTags } from 'lib/constants/constants'
import { defaultSetConditionals } from 'lib/optimization/defaultForm'
import {
  type SetsOrnaments,
  type SetsRelics,
  SetsOrnamentsNames,
  SetsRelicsNames,
  STAT_TAG_TO_SETS,
  relicIndexToSetConfig,
} from 'lib/sets/setConfigRegistry'
import { enrichSimulationMetadata } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { runCustomBenchmarkOrchestrator } from 'lib/simulations/orchestrator/runCustomBenchmarkOrchestrator'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { BenchmarkForm } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { clone } from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import type { SimulationMetadata } from 'types/metadata'
import {
  computeFlag,
  getErrRopePermutations,
} from './setAuditorConstants'
import type {
  AuditorConfig,
  AuditorFlagLevel,
  AuditorParamCombo,
  AuditorResults,
  AuditorRunResult,
  AuditorSetCombo,
  AuditorSetSummary,
} from './setAuditorTypes'

export function generateParamCombos(metadata: SimulationMetadata, config: AuditorConfig): AuditorParamCombo[] {
  const allErrPerms = getErrRopePermutations(metadata)
  const errPerms = allErrPerms.filter((v) => config.errRope.includes(v ? 'err' : 'noErr'))
  const subDpsPerms = config.modes.map((m) => m === 'subDps')

  const combos: AuditorParamCombo[] = []
  for (const spd of config.spdBreakpoints) {
    for (const errRope of errPerms) {
      for (const subDps of subDpsPerms) {
        combos.push({ spd, errRope, subDps })
      }
    }
  }
  return combos
}

export function generateRelicSetCombos(defaultOrnament: SetsOrnaments): AuditorSetCombo[] {
  const combos: AuditorSetCombo[] = []

  // All 4p relic sets
  for (const setName of SetsRelicsNames) {
    combos.push({
      type: 'relic4p',
      relicSet1: setName as SetsRelics,
      relicSet2: setName as SetsRelics,
      ornamentSet: defaultOrnament,
      label: `${setName} 4p`,
    })
  }

  const taggedReps: { tag: string, set: SetsRelics }[] = []
  const taggedSetIds = new Set<string>()
  for (const tag of TwoPieceStatTags) {
    const sets = STAT_TAG_TO_SETS[tag]
    if (sets && sets.length > 0) {
      taggedReps.push({ tag, set: sets[0] })
      for (const s of sets) taggedSetIds.add(s)
    }
  }
  const untaggedSets: SetsRelics[] = []
  for (const setEntry of relicIndexToSetConfig) {
    if (!taggedSetIds.has(setEntry.id as string)) {
      untaggedSets.push(setEntry.id as SetsRelics)
    }
  }

  // All 2p representatives (tagged + untagged)
  const allReps: { label: string, set: SetsRelics }[] = [
    ...taggedReps.map((r) => ({ label: r.tag, set: r.set })),
    ...untaggedSets.map((s) => ({ label: s, set: s })),
  ]

  // Generate all pairs (including same-index for tagged, meaningful for same-stat doubling)
  for (let i = 0; i < allReps.length; i++) {
    for (let j = i; j < allReps.length; j++) {
      combos.push({
        type: 'relic2p2p',
        relicSet1: allReps[i].set,
        relicSet2: allReps[j].set,
        ornamentSet: defaultOrnament,
        label: `2p ${allReps[i].label} + 2p ${allReps[j].label}`,
      })
    }
  }

  return combos
}

export function generateOrnamentSetCombos(defaultRelic1: SetsRelics, defaultRelic2: SetsRelics): AuditorSetCombo[] {
  return SetsOrnamentsNames.map((setName) => ({
    type: 'ornament' as const,
    relicSet1: defaultRelic1,
    relicSet2: defaultRelic2,
    ornamentSet: setName as SetsOrnaments,
    label: setName,
  }))
}

function getEnrichedMetadata(metadata: SimulationMetadata): SimulationMetadata {
  const enriched = clone(metadata)
  enrichSimulationMetadata(enriched)
  return enriched
}

export function isMatchedRelicCombo(combo: AuditorSetCombo, metadata: SimulationMetadata): boolean {
  const { relicSet1, relicSet2 } = combo
  for (const entry of metadata.relicSets) {
    if (combo.type === 'relic4p') {
      // 4p: entry is [SetX, SetX]
      if (entry.length === 2 && entry[0] === entry[1] && entry[0] === relicSet1) {
        return true
      }
    } else if (combo.type === 'relic2p2p') {
      // 2p+2p: entry is a flat array with 3+ elements, any pair is valid
      if (entry.length >= 3 && entry.includes(relicSet1) && entry.includes(relicSet2)) {
        return true
      }
      // Also check length-2 entries where the two are different (explicit 2p+2p pair)
      if (entry.length === 2 && entry[0] !== entry[1]) {
        if (entry.includes(relicSet1) && entry.includes(relicSet2)) {
          return true
        }
      }
    }
  }
  return false
}

export function isMatchedOrnament(ornament: SetsOrnaments, metadata: SimulationMetadata): boolean {
  return metadata.ornamentSets.includes(ornament)
}

function isMatchedSet(combo: AuditorSetCombo, metadata: SimulationMetadata): boolean {
  if (combo.type === 'ornament') {
    return isMatchedOrnament(combo.ornamentSet, metadata)
  }
  return isMatchedRelicCombo(combo, metadata)
}

function buildBenchmarkForm(
  characterId: CharacterId,
  config: AuditorConfig,
  setCombo: AuditorSetCombo,
  paramCombo: AuditorParamCombo,
): BenchmarkForm {
  const form: BenchmarkForm = {
    characterId,
    lightCone: config.lightCone,
    characterEidolon: config.characterEidolon,
    lightConeSuperimposition: config.lightConeSuperimposition,
    basicSpd: paramCombo.spd,
    errRope: paramCombo.errRope,
    subDps: paramCombo.subDps,
    simRelicSet1: setCombo.relicSet1,
    simRelicSet2: setCombo.relicSet2,
    simOrnamentSet: setCombo.ornamentSet,
    teammate0: config.teammates[0],
    teammate1: config.teammates[1],
    teammate2: config.teammates[2],
    setConditionals: clone(defaultSetConditionals),
  }

  applySetConditionalPresets(form)
  applyScoringMetadataPresets(form)

  return form
}

function paramKey(p: AuditorParamCombo): string {
  return `${p.spd}|${p.errRope}|${p.subDps}`
}

export async function runAudit(
  characterId: CharacterId,
  config: AuditorConfig,
  onProgress: (completed: number, total: number) => void,
  cancelRef: { current: boolean },
): Promise<AuditorResults> {
  const gameData = getGameMetadata()
  const charMeta = gameData.characters[characterId]
  const metadata = charMeta.scoringMetadata.simulation!
  const enrichedMetadata = getEnrichedMetadata(metadata)

  // Determine default sets (first matched)
  const defaultRelic1 = metadata.relicSets[0]?.[0]
  const defaultRelic2 = metadata.relicSets[0]?.[1] ?? metadata.relicSets[0]?.[0]
  const defaultOrnament = metadata.ornamentSets[0]

  const relicRefLabel = defaultRelic1 === defaultRelic2
    ? `${defaultRelic1} 4p`
    : `2p ${defaultRelic1} + 2p ${defaultRelic2}`
  const ornamentRefLabel = defaultOrnament as string

  // Generate combos based on config
  const paramCombos = generateParamCombos(metadata, config)

  const allSetCombos: AuditorSetCombo[] = []
  if (config.setTypes.includes('relic4p') || config.setTypes.includes('relic2p2p')) {
    const relicCombos = generateRelicSetCombos(defaultOrnament)
      .filter((c) => config.setTypes.includes(c.type))
    allSetCombos.push(...relicCombos)
  }
  if (config.setTypes.includes('ornament')) {
    allSetCombos.push(...generateOrnamentSetCombos(defaultRelic1, defaultRelic2))
  }

  const cancelledResult = (): AuditorResults => ({ summaries: [], relicReferenceLabel: relicRefLabel, ornamentReferenceLabel: ornamentRefLabel })

  const needsPerfection = config.scoringModes.includes('perfection')
  const orchestratorOptions = needsPerfection
    ? { skipScoring: true }
    : { benchmarkOnly: true }

  function extractScores(orchestrator: { benchmarkSimResult?: { simScore: number }, perfectionSimResult?: { simScore: number } }): number[] {
    const scores: number[] = []
    if (config.scoringModes.includes('benchmark')) {
      scores.push(orchestrator.benchmarkSimResult?.simScore ?? 0)
    }
    if (config.scoringModes.includes('perfection')) {
      scores.push(orchestrator.perfectionSimResult?.simScore ?? 0)
    }
    return scores
  }

  const refCombo: AuditorSetCombo = {
    type: 'relic4p',
    relicSet1: defaultRelic1,
    relicSet2: defaultRelic2,
    ornamentSet: defaultOrnament,
    label: 'Reference',
  }

  const total = allSetCombos.length * paramCombos.length + paramCombos.length
  let completed = 0

  const refScoresByParam = new Map<string, number[]>()

  for (const paramCombo of paramCombos) {
    if (cancelRef.current) return cancelledResult()
    try {
      const form = buildBenchmarkForm(characterId, config, refCombo, paramCombo)
      const orchestrator = await runCustomBenchmarkOrchestrator(form, orchestratorOptions)
      refScoresByParam.set(paramKey(paramCombo), extractScores(orchestrator))
    } catch (e) {
      console.error('Auditor reference error:', e)
      refScoresByParam.set(paramKey(paramCombo), config.scoringModes.map(() => 0))
    }
    completed++
    onProgress(completed, total)
  }

  const scoresBySetAndParam = new Map<string, Map<string, number[]>>()

  for (const setCombo of allSetCombos) {
    if (cancelRef.current) break

    const setKey = `${setCombo.type}|${setCombo.relicSet1}|${setCombo.relicSet2}|${setCombo.ornamentSet}`
    const paramScores = new Map<string, number[]>()

    for (const paramCombo of paramCombos) {
      if (cancelRef.current) break

      try {
        const form = buildBenchmarkForm(characterId, config, setCombo, paramCombo)
        const orchestrator = await runCustomBenchmarkOrchestrator(form, orchestratorOptions)
        paramScores.set(paramKey(paramCombo), extractScores(orchestrator))
      } catch (e) {
        console.error(`Auditor error for ${setCombo.label} at ${paramKey(paramCombo)}:`, e)
        paramScores.set(paramKey(paramCombo), [-1])
      }

      completed++
      onProgress(completed, total)
    }

    scoresBySetAndParam.set(setKey, paramScores)
  }

  if (cancelRef.current) return cancelledResult()

  // Build summaries
  const summaries: AuditorSetSummary[] = []

  for (const setCombo of allSetCombos) {
    const setKey = `${setCombo.type}|${setCombo.relicSet1}|${setCombo.relicSet2}|${setCombo.ornamentSet}`
    const paramScores = scoresBySetAndParam.get(setKey)!
    const matched = isMatchedSet(setCombo, enrichedMetadata)

    const results: AuditorRunResult[] = []
    let bestDelta = -Infinity
    let bestDeltaParams = paramCombos[0]

    for (const paramCombo of paramCombos) {
      const pk = paramKey(paramCombo)
      const scores = paramScores.get(pk) ?? [-1]
      const refScores = refScoresByParam.get(pk) ?? config.scoringModes.map(() => 0)

      for (let m = 0; m < config.scoringModes.length; m++) {
        const score = scores[m] ?? 0
        const referenceScore = refScores[m] ?? 0

        let deltaPct = 0
        if (referenceScore > 0 && score > 0) {
          deltaPct = ((score - referenceScore) / referenceScore) * 100
        } else if (score < 0) {
          deltaPct = -999
        }

        const flag: AuditorFlagLevel = matched ? null : computeFlag(deltaPct)
        const modeLabel = config.scoringModes[m] === 'perfection' ? '200%' : '100%'

        results.push({ setCombo, paramCombo, score, referenceScore, deltaPct, flag, error: score < 0, modeLabel })

        if (deltaPct > bestDelta) {
          bestDelta = deltaPct
          bestDeltaParams = paramCombo
        }
      }
    }

    const summaryFlag: AuditorFlagLevel = matched ? null : computeFlag(bestDelta)

    summaries.push({
      setCombo,
      bestDelta,
      bestDeltaParams,
      flag: summaryFlag,
      matched,
      results,
    })
  }

  // Sort: flagged first (red then yellow), then by best delta descending
  summaries.sort((a, b) => {
    const flagOrder = (f: AuditorFlagLevel) => (f === 'red' ? 0 : f === 'yellow' ? 1 : 2)
    const fa = flagOrder(a.flag)
    const fb = flagOrder(b.flag)
    if (fa !== fb) return fa - fb
    return b.bestDelta - a.bestDelta
  })

  return { summaries, relicReferenceLabel: relicRefLabel, ornamentReferenceLabel: ornamentRefLabel }
}
