import {
  DEFAULT_WARP_REQUEST,
  DEFAULT_WARP_TARGET,
  EidolonLevel,
  type EnrichedWarpRequest,
  generateOptions,
  NONE_WARP_INCOME_OPTION,
  StarlightMultiplier,
  SuperimpositionLevel,
  type WarpIncomeDefinition,
  WarpIncomeType,
  type WarpMilestoneResult,
  type WarpRequest,
  type WarpResult,
  WarpStrategy,
  type WarpTarget,
  type WarpTargetResult,
  WarpType,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import { WARP_DIMENSIONS } from 'lib/tabs/tabWarp/warpDimensions'

// Modified each patch
export const WarpIncomeOptions: WarpIncomeDefinition[] = [
  // ...generateOptions('3.4', 92, 57, 116, 69, 124, 77),
  // ...generateOptions('3.5', 88, 66, 112, 77, 120, 86),

  // ...generateOptions('3.7', 107, 82, 130, 94, 138, 102),
  // ...[
  //   generateOption('3.8', 1, WarpIncomeType.F2P, 66),
  //   generateOption('3.8', 2, WarpIncomeType.F2P, 21),
  //   generateOption('3.8', 3, WarpIncomeType.F2P, 22),
  //   generateOption('3.8', 1, WarpIncomeType.EXPRESS, 78),
  //   generateOption('3.8', 2, WarpIncomeType.EXPRESS, 32),
  //   generateOption('3.8', 3, WarpIncomeType.EXPRESS, 31),
  //   generateOption('3.8', 1, WarpIncomeType.BP_EXPRESS, 82),
  //   generateOption('3.8', 2, WarpIncomeType.BP_EXPRESS, 36),
  //   generateOption('3.8', 3, WarpIncomeType.BP_EXPRESS, 31),
  // ],
  // ...generateOptions('4.0', 115, 96, 138, 107, 146, 115),
  // ...generateOptions('4.1', 98, 81, 114, 89, 122, 97),
  // ...generateOptions('4.2', 117, 91, 140, 103, 149, 112),
  ...generateOptions('4.3', 91, 66, 116, 78, 124, 86),
  ...generateOptions('4.4', 94, 69, 117, 81, 126, 87),
]

export function normalizeWarpRequest(raw: unknown): WarpRequest {
  const source = (raw ?? {}) as Partial<WarpRequest>

  const income = Array.isArray(source.income)
    ? source.income.filter((id) => WarpIncomeOptions.some((option) => option.id === id))
    : []

  const targets = Array.isArray(source.targets)
    ? source.targets.map(normalizeWarpTarget)
    : DEFAULT_WARP_REQUEST.targets.map((target) => ({ ...target }))

  return {
    passes: Math.max(0, Number(source.passes) || 0),
    jades: Math.max(0, Number(source.jades) || 0),
    income,
    targets,
    plannerMode: source.plannerMode ?? DEFAULT_WARP_REQUEST.plannerMode,
    strategy: source.strategy ?? DEFAULT_WARP_REQUEST.strategy,
    starlight: source.starlight ?? DEFAULT_WARP_REQUEST.starlight,
    pityCharacter: Math.max(0, Number(source.pityCharacter) || 0),
    guaranteedCharacter: source.guaranteedCharacter ?? false,
    pityLightCone: Math.max(0, Number(source.pityLightCone) || 0),
    guaranteedLightCone: source.guaranteedLightCone ?? false,
  }
}

function normalizeWarpTarget(raw: Partial<WarpTarget>, index: number): WarpTarget {
  return {
    id: raw.id || `target-${index + 1}`,
    characterId: raw.characterId ?? null,
    lightConeId: raw.lightConeId ?? null,
    targetEidolonLevel: clampLevel(raw.targetEidolonLevel, DEFAULT_WARP_TARGET.targetEidolonLevel, EidolonLevel.NONE, EidolonLevel.E6),
    targetSuperimpositionLevel: clampLevel(
      raw.targetSuperimpositionLevel,
      DEFAULT_WARP_TARGET.targetSuperimpositionLevel,
      SuperimpositionLevel.NONE,
      SuperimpositionLevel.S5,
    ),
    currentEidolonLevel: clampLevel(raw.currentEidolonLevel, DEFAULT_WARP_TARGET.currentEidolonLevel, EidolonLevel.NONE, EidolonLevel.E6),
    currentSuperimpositionLevel: clampLevel(
      raw.currentSuperimpositionLevel,
      DEFAULT_WARP_TARGET.currentSuperimpositionLevel,
      SuperimpositionLevel.NONE,
      SuperimpositionLevel.S5,
    ),
  }
}

function clampLevel<T extends number>(value: unknown, fallback: T, min: T, max: T): T {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value as T : fallback
}

type WarpMilestone = {
  warpType: WarpType,
  pity: number,
  guaranteed: boolean,
}

type LabeledWarpMilestone = WarpMilestone & { label: string }

type StartingBannerState = {
  character: {
    pity: number,
    guaranteed: boolean,
  },
  lightCone: {
    pity: number,
    guaranteed: boolean,
  },
}

export function calculateWarps(originalRequest: WarpRequest): Exclude<WarpResult, null> {
  const request = enrichWarpRequest(originalRequest)

  const freshStartDistByType: Record<WarpType, number[]> = {
    [WarpType.CHARACTER]: pityAdjustedPmf(WARP_DIMENSIONS[WarpType.CHARACTER].distribution, 0, WARP_DIMENSIONS[WarpType.CHARACTER].warpCap),
    [WarpType.LIGHTCONE]: pityAdjustedPmf(WARP_DIMENSIONS[WarpType.LIGHTCONE].distribution, 0, WARP_DIMENSIONS[WarpType.LIGHTCONE].warpCap),
  }

  const targetResults: WarpTargetResult[] = []
  let cumulativePmf: number[] = [1] // P(total cost = 0) = 1 before any milestones
  let hasUsedCharacterStart = false
  let hasUsedLightConeStart = false

  // Banner pity / guaranteed applies only to the FIRST target that pulls each type; once a type has been
  // pulled for an earlier target, later targets start that type fresh (pity 0). The flags below are flipped
  // as we walk targets in array order, so this relies on targets being processed in that order.
  for (const target of request.targets) {
    const startingState: StartingBannerState = {
      character: {
        pity: hasUsedCharacterStart ? 0 : request.pityCharacter,
        guaranteed: hasUsedCharacterStart ? false : request.guaranteedCharacter,
      },
      lightCone: {
        pity: hasUsedLightConeStart ? 0 : request.pityLightCone,
        guaranteed: hasUsedLightConeStart ? false : request.guaranteedLightCone,
      },
    }

    const milestones = generateWarpMilestones(target, startingState, request.strategy)
    const targetMilestoneResults: Record<string, WarpMilestoneResult> = {}

    for (const milestone of milestones) {
      const { warpType, label, pity, guaranteed } = milestone
      const dimension = WARP_DIMENSIONS[warpType]

      const milestoneStartDist = pityAdjustedPmf(dimension.distribution, pity, dimension.warpCap)
      const milestoneDist = milestoneCostPmf(milestoneStartDist, guaranteed, dimension.fiftyFifty, freshStartDistByType[warpType])

      cumulativePmf = convolveArrays(cumulativePmf, milestoneDist)

      const result = milestoneStats(cumulativePmf, request.warps)
      targetMilestoneResults[label] = result

      if (warpType === WarpType.CHARACTER) hasUsedCharacterStart = true
      if (warpType === WarpType.LIGHTCONE) hasUsedLightConeStart = true
    }

    targetResults.push({ target, milestoneResults: targetMilestoneResults })
  }

  return { targetResults, request }
}

export function enrichWarpRequest(originalRequest: WarpRequest): EnrichedWarpRequest {
  const request: WarpRequest = {
    ...DEFAULT_WARP_REQUEST,
    ...originalRequest,
    jades: Number(originalRequest.jades) || 0,
    passes: Number(originalRequest.passes) || 0,
    pityCharacter: Math.max(0, Number(originalRequest.pityCharacter) || 0),
    pityLightCone: Math.max(0, Number(originalRequest.pityLightCone) || 0),
  }

  const selectedIncome = request.income.map(
    (incomeId) => WarpIncomeOptions.find((option) => option.id === incomeId) ?? NONE_WARP_INCOME_OPTION,
  )

  let additionalPasses = 0

  for (const income of selectedIncome) {
    additionalPasses += income.passes
  }

  const totalJade = request.jades
  const totalPasses = request.passes + additionalPasses
  const initialWarps = Math.floor(totalJade / 160) + totalPasses

  const refundedWarps = Math.floor((StarlightMultiplier[request.starlight] ?? 0) * initialWarps)
  const totalStarlight = refundedWarps * 20
  const totalWarps = initialWarps + refundedWarps

  return {
    ...request,
    warps: totalWarps,
    totalJade: totalJade,
    totalPasses: totalPasses,
    additionalPasses: additionalPasses,
    totalStarlight: totalStarlight,
  }
}

function generateWarpMilestones(target: WarpTarget, startingState: StartingBannerState, strategy: WarpStrategy): LabeledWarpMilestone[] {
  const { targetEidolonLevel, targetSuperimpositionLevel, currentEidolonLevel, currentSuperimpositionLevel } = target

  if (targetEidolonLevel === EidolonLevel.NONE && targetSuperimpositionLevel === SuperimpositionLevel.NONE) {
    return []
  }

  const path = generateTargetMilestonePath(target, strategy)

  // Walk the ordered path once: skip levels already owned, label the survivors from the running
  // eidolon/superimposition counters, and apply the banner's starting pity/guaranteed to the
  // first emitted pull of each type. Truncate at the milestone that first reaches the goal.
  let skipCharacters = currentEidolonLevel // owns E0..currentEidolon -> skip currentEidolon + 1 (NONE = -1 -> skip 0)
  let skipLightCones = currentSuperimpositionLevel // owns S1..currentSi     -> skip currentSi      (NONE =  0 -> skip 0)
  let e = currentEidolonLevel
  let s = currentSuperimpositionLevel
  let assignedCharacterStart = false
  let assignedLightConeStart = false

  const milestones: LabeledWarpMilestone[] = []
  let targetIndex = -1

  for (const warpType of path) {
    const isCharacter = warpType === WarpType.CHARACTER
    if (isCharacter) {
      if (skipCharacters > EidolonLevel.NONE) {
        skipCharacters--
        continue
      }
      e++
    } else {
      if (skipLightCones > SuperimpositionLevel.NONE) {
        skipLightCones--
        continue
      }
      s++
    }

    const isFirstOfType = isCharacter ? !assignedCharacterStart : !assignedLightConeStart
    if (isCharacter) assignedCharacterStart = true
    else assignedLightConeStart = true

    const bannerStart = isCharacter ? startingState.character : startingState.lightCone
    const label = e === EidolonLevel.NONE
      ? `S${s}`
      : targetSuperimpositionLevel === SuperimpositionLevel.NONE
      ? `E${e}`
      : `E${e}S${s}`

    milestones.push({
      warpType,
      label,
      pity: isFirstOfType ? bannerStart.pity : 0,
      guaranteed: isFirstOfType ? bannerStart.guaranteed : false,
    })

    if (targetIndex === -1 && isTargetReached(targetEidolonLevel, targetSuperimpositionLevel, e, s)) {
      targetIndex = milestones.length - 1
    }
  }

  return targetIndex === -1 ? milestones : milestones.slice(0, targetIndex + 1)
}

// Ordered sequence of pulls (by type) to fully reach a target, from a fresh E0/S0 baseline.
// Owned-level filtering and labeling happen later in generateWarpMilestones.
function generateTargetMilestonePath(target: WarpTarget, strategy: WarpStrategy): WarpType[] {
  const path: WarpType[] = []
  const characterTarget = target.targetEidolonLevel
  const lightConeTarget = target.targetSuperimpositionLevel
  const hasLightConeTarget = lightConeTarget !== SuperimpositionLevel.NONE

  // WarpStrategy.S1 is the "light cone first" sentinel (value 7, outside the EidolonLevel range);
  // any other strategy value is the eidolon (capped at the character target) after which S1 is pulled.
  const s1InsertionAfterEidolon = strategy === WarpStrategy.S1
    ? EidolonLevel.NONE
    : Math.min(strategy, Math.max(characterTarget, EidolonLevel.E0)) as EidolonLevel
  let insertedS1 = false

  function insertS1() {
    if (!hasLightConeTarget || insertedS1) return
    path.push(WarpType.LIGHTCONE)
    insertedS1 = true
  }

  if (characterTarget !== EidolonLevel.NONE) {
    for (let eidolon = EidolonLevel.E0; eidolon <= characterTarget; eidolon++) {
      if (s1InsertionAfterEidolon < eidolon) insertS1()
      path.push(WarpType.CHARACTER)
      if (s1InsertionAfterEidolon === eidolon) insertS1()
    }
  }

  insertS1()

  for (let superimposition = SuperimpositionLevel.S2; superimposition <= lightConeTarget; superimposition++) {
    path.push(WarpType.LIGHTCONE)
  }

  return path
}

function isTargetReached(
  targetEidolonLevel: EidolonLevel,
  targetSuperimpositionLevel: SuperimpositionLevel,
  eidolon: EidolonLevel,
  superimposition: SuperimpositionLevel,
) {
  return (targetEidolonLevel === EidolonLevel.NONE || eidolon >= targetEidolonLevel)
    && (targetSuperimpositionLevel === SuperimpositionLevel.NONE || superimposition >= targetSuperimpositionLevel)
}

function milestoneStats(cumulativePmf: number[], budget: number): WarpMilestoneResult {
  // Expected warps = Σ k * P(total cost = k)
  const warps = cumulativePmf.reduce((sum, p, k) => sum + k * p, 0)

  // Win probability = P(total cost <= budget)
  let wins = 0
  for (let k = 0; k <= budget && k < cumulativePmf.length; k++) {
    wins += cumulativePmf[k]
  }

  return { warps, wins }
}

// PMF (probability mass function) for cost starting at pity position.
// Result is 1-indexed: result[0] = 0, result[k] = P(costs k warps from pity position).
function pityAdjustedPmf(distribution: number[], pity: number, warpCap: number): number[] {
  const slice = distribution.slice(pity, warpCap)
  const total = slice.reduce((sum, p) => sum + p, 0)
  // pity at/beyond the hard cap leaves no probability mass; contribute zero cost rather than NaN.
  if (total === 0) return [1]
  return [0, ...slice.map((p) => p / total)]
}

// Discrete convolution: (a ⊗ b)[k] = Σᵢ a[i] * b[k-i]
function convolveArrays(a: number[], b: number[]): number[] {
  const result = Array.from({ length: a.length + b.length - 1 }, () => 0)
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j]
    }
  }
  return result
}

// PMF for a single milestone cost.
// For 50/50: rate * milestoneStartDist + (1 - rate) * convolve(milestoneStartDist, freshStartDist)
// For guaranteed: milestoneStartDist
function milestoneCostPmf(
  milestoneStartDist: number[],
  guaranteed: boolean,
  rate: number,
  freshStartDist: number[],
): number[] {
  if (guaranteed) return milestoneStartDist

  const winBranch = milestoneStartDist.map((p) => p * rate)
  const loseBranch = convolveArrays(milestoneStartDist, freshStartDist).map((p) => p * (1 - rate))

  const result = Array.from({ length: Math.max(winBranch.length, loseBranch.length) }, () => 0)
  for (let i = 0; i < winBranch.length; i++) {
    result[i] += winBranch[i]
  }
  for (let i = 0; i < loseBranch.length; i++) {
    result[i] += loseBranch[i]
  }
  return result
}
