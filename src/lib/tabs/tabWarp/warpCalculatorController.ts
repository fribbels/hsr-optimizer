import { SaveState } from 'lib/state/saveState'
import { useWarpCalculatorStore } from 'lib/tabs/tabWarp/useWarpCalculatorStore'
import {
  characterDistribution,
  lightConeDistribution,
} from 'lib/tabs/tabWarp/warpRates'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

// Notes: 626 to e6 and 960 to e6s5, 952 with 0.78125 on lc

const characterWarpCap = 90
const lightConeWarpCap = 80
const character5050 = 0.5625
const lightCone5050 = 0.78125

export enum WarpIncomeType {
  NONE,
  F2P,
  EXPRESS,
  BP_EXPRESS,
}

export enum BannerRotation {
  NEW,
  RERUN,
}

export const NONE_WARP_INCOME_OPTION = generateOption('NONE', 0, WarpIncomeType.NONE, 0)

function generateOptions(
  version: string,
  f2pTotal: number,
  f2pFirstHalf: number,
  expressTotal: number,
  expressFirstHalf: number,
  bpTotal: number,
  bpFirstHalf: number,
) {
  return [
    generateOption(version, 1, WarpIncomeType.F2P, f2pFirstHalf),
    generateOption(version, 2, WarpIncomeType.F2P, f2pTotal - f2pFirstHalf),
    generateOption(version, 1, WarpIncomeType.EXPRESS, expressFirstHalf),
    generateOption(version, 2, WarpIncomeType.EXPRESS, expressTotal - expressFirstHalf),
    generateOption(version, 1, WarpIncomeType.BP_EXPRESS, bpFirstHalf),
    generateOption(version, 2, WarpIncomeType.BP_EXPRESS, bpTotal - bpFirstHalf),
  ]
}

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
  ...generateOptions('4.1', 98, 81, 114, 89, 122, 97),
  ...generateOptions('4.2', 117, 91, 140, 103, 149, 112),
  ...generateOptions('4.3', 91, 66, 116, 78, 124, 86),
]

export enum WarpStrategy {
  E0 = 0, // E0 -> S1 -> E6 -> S5
  E1 = 1, // E1 -> S1 -> E6 -> S5
  E2 = 2, // E2 -> S1 -> E6 -> S5
  E3 = 3, // E3 -> S1 -> E6 -> S5
  E4 = 4, // E4 -> S1 -> E6 -> S5
  E5 = 5, // E5 -> S1 -> E6 -> S5
  E6 = 6, // E6 -> S1 -> S5
  S1 = 7, // S1 -> E6 -> S5
}

export type WarpTargetGoal =
  | 'S1'
  | 'E0S0'
  | 'E0S1'
  | 'E1S1'
  | 'E2S1'
  | 'E3S1'
  | 'E4S1'
  | 'E5S1'
  | 'E6S1'
  | 'E6S2'
  | 'E6S3'
  | 'E6S4'
  | 'E6S5'

export const WarpTargetGoals: WarpTargetGoal[] = [
  'E0S0',
  'S1',
  'E0S1',
  'E1S1',
  'E2S1',
  'E3S1',
  'E4S1',
  'E5S1',
  'E6S1',
  'E6S2',
  'E6S3',
  'E6S4',
  'E6S5',
]

export enum EidolonLevel {
  NONE = -1,
  E0,
  E1,
  E2,
  E3,
  E4,
  E5,
  E6,
}

export enum SuperimpositionLevel {
  NONE = 0,
  S1,
  S2,
  S3,
  S4,
  S5,
}

export enum StarlightRefund {
  REFUND_NONE = 'REFUND_NONE',
  REFUND_LOW = 'REFUND_LOW',
  REFUND_AVG = 'REFUND_AVG',
  REFUND_HIGH = 'REFUND_HIGH',
}

export const StarlightMultiplier: Record<StarlightRefund, number> = {
  [StarlightRefund.REFUND_NONE]: 0.00,
  [StarlightRefund.REFUND_LOW]: 0.04,
  [StarlightRefund.REFUND_AVG]: 0.075,
  [StarlightRefund.REFUND_HIGH]: 0.11,
}

export type WarpRequest = {
  passes: number,
  jades: number,
  income: string[],
  targets: WarpTarget[],
  bannerRotation: BannerRotation,
  strategy: WarpStrategy,
  starlight: StarlightRefund,
  pityCharacter: number,
  guaranteedCharacter: boolean,
  pityLightCone: number,
  guaranteedLightCone: boolean,
  currentEidolonLevel: EidolonLevel,
  currentSuperimpositionLevel: SuperimpositionLevel,
}

export type WarpTarget = {
  id: string,
  characterId: CharacterId | null,
  lightConeId: LightConeId | null,
  target?: WarpTargetGoal,
  targetEidolonLevel: EidolonLevel,
  targetSuperimpositionLevel: SuperimpositionLevel,
  strategy: WarpStrategy,
  currentEidolonLevel: EidolonLevel,
  currentSuperimpositionLevel: SuperimpositionLevel,
}

export type WarpMilestoneResult = { warps: number, wins: number }
export type WarpResult = null | {
  milestoneResults: Record<string, WarpMilestoneResult>,
  targetResults: WarpTargetResult[],
  request: EnrichedWarpRequest,
}

export type WarpTargetResult = {
  target: WarpTarget,
  milestoneResults: Record<string, WarpMilestoneResult>,
}

export enum WarpType {
  CHARACTER,
  LIGHTCONE,
}

export const DEFAULT_WARP_REQUEST: WarpRequest = {
  passes: 0,
  jades: 0,
  income: [],
  targets: [
    {
      id: 'target-1',
      characterId: null,
      lightConeId: null,
      targetEidolonLevel: EidolonLevel.E6,
      targetSuperimpositionLevel: SuperimpositionLevel.S5,
      strategy: WarpStrategy.E0,
      currentEidolonLevel: EidolonLevel.NONE,
      currentSuperimpositionLevel: SuperimpositionLevel.NONE,
    },
  ],
  bannerRotation: BannerRotation.NEW,
  strategy: WarpStrategy.E0,
  starlight: StarlightRefund.REFUND_AVG,
  pityCharacter: 0,
  guaranteedCharacter: false,
  pityLightCone: 0,
  guaranteedLightCone: false,
  currentEidolonLevel: EidolonLevel.NONE,
  currentSuperimpositionLevel: SuperimpositionLevel.NONE,
}

export type WarpIncomeDefinition = {
  passes: number,
  id: string,
  version: string,
  type: WarpIncomeType,
  phase: number,
}

type WarpMilestone = {
  warpType: WarpType,
  label: string,
  pity: number,
  guaranteed: boolean,
  warpCap: number,
}

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

function generateOption(version: string, phase: number, type: WarpIncomeType, passes: number) {
  return {
    passes,
    version,
    phase,
    type,
    id: generateOptionKey(version, phase, type),
  }
}

function generateOptionKey(version: string, phase: number, type: WarpIncomeType) {
  return `${version}_p${phase}_${type}`
}

export function handleWarpRequest(originalRequest: WarpRequest) {
  console.log('calculate Warps', originalRequest)
  useWarpCalculatorStore.getState().setRequest(originalRequest)

  const warpResult = calculateWarps(originalRequest)

  useWarpCalculatorStore.getState().setResult(warpResult)
  SaveState.delayedSave()
}

export function calculateWarps(originalRequest: WarpRequest): Exclude<WarpResult, null> {
  const request = enrichWarpRequest(originalRequest)

  const freshStartCharDist = pityAdjustedPmf(characterDistribution, 0, characterWarpCap)
  const freshStartLcDist = pityAdjustedPmf(lightConeDistribution, 0, lightConeWarpCap)

  const milestoneResults: Record<string, WarpMilestoneResult> = {}
  const targetResults: WarpTargetResult[] = []
  let cumulativePmf: number[] = [1] // P(total cost = 0) = 1 before any milestones
  let hasUsedCharacterStart = false
  let hasUsedLightConeStart = false

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

    const milestones = generateWarpMilestones(target, startingState)
    const targetMilestoneResults: Record<string, WarpMilestoneResult> = {}

    for (const milestone of milestones) {
      const { warpType, label, pity, guaranteed } = milestone
      const isChar = warpType === WarpType.CHARACTER
      const baseDistribution = isChar ? characterDistribution : lightConeDistribution
      const warpCap = isChar ? characterWarpCap : lightConeWarpCap
      const rate = isChar ? character5050 : lightCone5050
      const freshStartDist = isChar ? freshStartCharDist : freshStartLcDist

      const milestoneStartDist = pityAdjustedPmf(baseDistribution, pity, warpCap)
      const milestoneDist = milestoneCostPmf(milestoneStartDist, guaranteed, rate, freshStartDist)

      cumulativePmf = convolveArrays(cumulativePmf, milestoneDist)

      // Expected warps = Σ k * P(total cost = k)
      const expectedWarps = cumulativePmf.reduce((sum, p, k) => sum + k * p, 0)

      // Win probability = P(total cost <= budget)
      let winProb = 0
      for (let k = 0; k <= request.warps && k < cumulativePmf.length; k++) {
        winProb += cumulativePmf[k]
      }

      const result = { warps: expectedWarps, wins: winProb }
      targetMilestoneResults[label] = result
      milestoneResults[label] = result

      if (warpType === WarpType.CHARACTER) hasUsedCharacterStart = true
      if (warpType === WarpType.LIGHTCONE) hasUsedLightConeStart = true
    }

    targetResults.push({ target, milestoneResults: targetMilestoneResults })
  }

  return { milestoneResults, targetResults, request }
}

function generateWarpMilestones(target: WarpTarget, startingState: StartingBannerState) {
  const {
    strategy,
    targetEidolonLevel,
    targetSuperimpositionLevel,
    currentEidolonLevel,
    currentSuperimpositionLevel,
  } = target

  if (targetEidolonLevel === EidolonLevel.NONE && targetSuperimpositionLevel === SuperimpositionLevel.NONE) {
    return []
  }

  let milestones = generateTargetMilestonePath(target, startingState)

  const currEidolonSuperCheck: boolean = (currentEidolonLevel !== EidolonLevel.NONE) || (currentSuperimpositionLevel !== SuperimpositionLevel.NONE)
  milestones = currEidolonSuperCheck ? filterRemapMilestones(milestones, target, startingState) : milestones

  let e = currentEidolonLevel
  let s = currentSuperimpositionLevel

  let targetIndex = -1

  for (let i = 0; i < milestones.length; i++) {
    const milestone = milestones[i]
    if (milestone.warpType == WarpType.CHARACTER) e++
    if (milestone.warpType == WarpType.LIGHTCONE) s++
    milestone.label = e == EidolonLevel.NONE ? `S${s}` : `E${e}S${s}`

    if (targetIndex === -1 && isTargetReached(targetEidolonLevel, targetSuperimpositionLevel, e, s)) {
      targetIndex = i
    }
  }

  return targetIndex === -1 ? milestones : milestones.slice(0, targetIndex + 1)
}

function generateTargetMilestonePath(target: WarpTarget, startingState: StartingBannerState) {
  const milestones: WarpMilestone[] = []
  const characterTarget = target.targetEidolonLevel
  const lightConeTarget = target.targetSuperimpositionLevel
  const hasLightConeTarget = lightConeTarget !== SuperimpositionLevel.NONE
  const s1InsertionAfterEidolon = target.strategy === WarpStrategy.S1
    ? EidolonLevel.NONE
    : Math.min(target.strategy, Math.max(characterTarget, EidolonLevel.E0)) as EidolonLevel
  let insertedS1 = false

  function insertS1() {
    if (!hasLightConeTarget || insertedS1) return

    milestones.push({
      warpType: WarpType.LIGHTCONE,
      label: 'S1',
      guaranteed: startingState.lightCone.guaranteed,
      pity: startingState.lightCone.pity,
      warpCap: lightConeWarpCap,
    })
    insertedS1 = true
  }

  if (characterTarget !== EidolonLevel.NONE) {
    for (let eidolon = EidolonLevel.E0; eidolon <= characterTarget; eidolon++) {
      if (s1InsertionAfterEidolon < eidolon) {
        insertS1()
      }

      milestones.push({
        warpType: WarpType.CHARACTER,
        label: `E${eidolon}`,
        guaranteed: eidolon === EidolonLevel.E0 ? startingState.character.guaranteed : false,
        pity: eidolon === EidolonLevel.E0 ? startingState.character.pity : 0,
        warpCap: characterWarpCap,
      })

      if (s1InsertionAfterEidolon === eidolon) {
        insertS1()
      }
    }
  }

  insertS1()

  for (let superimposition = SuperimpositionLevel.S2; superimposition <= lightConeTarget; superimposition++) {
    milestones.push({
      warpType: WarpType.LIGHTCONE,
      label: `S${superimposition}`,
      guaranteed: false,
      pity: 0,
      warpCap: lightConeWarpCap,
    })
  }

  return milestones
}

function isTargetReached(
  targetEidolonLevel: EidolonLevel,
  targetSuperimpositionLevel: SuperimpositionLevel,
  eidolon: EidolonLevel,
  superimposition: SuperimpositionLevel,
) {
  if (targetEidolonLevel !== EidolonLevel.NONE && eidolon < targetEidolonLevel) {
    return false
  }

  if (targetSuperimpositionLevel !== SuperimpositionLevel.NONE && superimposition < targetSuperimpositionLevel) {
    return false
  }

  return true
}

function filterRemapMilestones(milestones: WarpMilestone[], target: WarpTarget, startingState: StartingBannerState) {
  let skipCharacterMilestones: number = target.currentEidolonLevel
  let skipLightConeMilestones: number = target.currentSuperimpositionLevel
  let filteredMilestones: WarpMilestone[] = []

  // Filter out previous eidolon and superimposition already obtained.
  filteredMilestones = milestones.filter((milestone) => {
    switch (milestone.warpType) {
      case WarpType.CHARACTER:
        if (skipCharacterMilestones > -1) {
          skipCharacterMilestones--
          return false
        }
        break
      case WarpType.LIGHTCONE:
        if (skipLightConeMilestones > 0) {
          skipLightConeMilestones--
          return false
        }
        break
    }
    return true
  })

  // Remap the new starting milestone
  const firstNewCharacterIndex: number = filteredMilestones.findIndex((milestone) => milestone.warpType === WarpType.CHARACTER)
  if (firstNewCharacterIndex >= 0) {
    filteredMilestones[firstNewCharacterIndex].pity = startingState.character.pity
    filteredMilestones[firstNewCharacterIndex].guaranteed = startingState.character.guaranteed
  }

  const firstNewLightConeIndex: number = filteredMilestones.findIndex((milestone) => milestone.warpType === WarpType.LIGHTCONE)
  if (firstNewLightConeIndex >= 0) {
    filteredMilestones[firstNewLightConeIndex].pity = startingState.lightCone.pity
    filteredMilestones[firstNewLightConeIndex].guaranteed = startingState.lightCone.guaranteed
  }

  return filteredMilestones
}

export type EnrichedWarpRequest = {
  warps: number,
  totalStarlight: number,
  totalPasses: number,
  additionalPasses: number,
  totalJade: number,
} & WarpRequest

export function enrichWarpRequest(originalRequest: WarpRequest) {
  const request: WarpRequest = {
    ...DEFAULT_WARP_REQUEST,
    ...originalRequest,
    jades: Number(originalRequest.jades) || 0,
    passes: Number(originalRequest.passes) || 0,
    pityCharacter: Number(originalRequest.pityCharacter) || 0,
    pityLightCone: Number(originalRequest.pityLightCone) || 0,
    targets: normalizeWarpTargets(originalRequest),
  }

  const selectedIncome = request.income.map(
    (incomeId) => WarpIncomeOptions.find((option) => option.id == incomeId) ?? NONE_WARP_INCOME_OPTION,
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

  const enrichedRequest: EnrichedWarpRequest = {
    ...request,
    warps: totalWarps,
    totalJade: totalJade,
    totalPasses: totalPasses,
    additionalPasses: additionalPasses,
    totalStarlight: totalStarlight,
  }

  if (request.bannerRotation == BannerRotation.NEW) {
    enrichedRequest.currentEidolonLevel = EidolonLevel.NONE
    enrichedRequest.currentSuperimpositionLevel = SuperimpositionLevel.NONE
  }

  return enrichedRequest
}

export function normalizeWarpTargets(originalRequest: WarpRequest): WarpTarget[] {
  if (Array.isArray(originalRequest.targets) && originalRequest.targets.length > 0) {
    return originalRequest.targets.map((target, index) => normalizeTarget(target, index, originalRequest))
  }

  return [
    normalizeTarget({
      id: 'target-1',
      characterId: null,
      lightConeId: null,
      targetEidolonLevel: EidolonLevel.E6,
      targetSuperimpositionLevel: SuperimpositionLevel.S5,
      strategy: originalRequest.strategy ?? WarpStrategy.E0,
      currentEidolonLevel: originalRequest.bannerRotation === BannerRotation.RERUN ? originalRequest.currentEidolonLevel ?? EidolonLevel.NONE : EidolonLevel.NONE,
      currentSuperimpositionLevel: originalRequest.bannerRotation === BannerRotation.RERUN ? originalRequest.currentSuperimpositionLevel ?? SuperimpositionLevel.NONE : SuperimpositionLevel.NONE,
    }, 0, originalRequest),
  ]
}

function normalizeTarget(target: Partial<WarpTarget>, index: number, originalRequest: WarpRequest): WarpTarget {
  const legacyTarget = splitLegacyTargetGoal(target.target)
  const fallbackCurrentEidolonLevel = originalRequest.currentEidolonLevel ?? EidolonLevel.NONE
  const fallbackCurrentSuperimpositionLevel = originalRequest.currentSuperimpositionLevel ?? SuperimpositionLevel.NONE

  return {
    id: target.id || `target-${index + 1}`,
    characterId: target.characterId ?? null,
    lightConeId: target.lightConeId ?? null,
    targetEidolonLevel: coerceEidolonLevel(target.targetEidolonLevel, legacyTarget.targetEidolonLevel),
    targetSuperimpositionLevel: coerceSuperimpositionLevel(target.targetSuperimpositionLevel, legacyTarget.targetSuperimpositionLevel),
    strategy: target.strategy ?? originalRequest.strategy ?? WarpStrategy.E0,
    currentEidolonLevel: coerceEidolonLevel(target.currentEidolonLevel, fallbackCurrentEidolonLevel),
    currentSuperimpositionLevel: coerceSuperimpositionLevel(target.currentSuperimpositionLevel, fallbackCurrentSuperimpositionLevel),
  }
}

function coerceEidolonLevel(level: unknown, fallback: EidolonLevel): EidolonLevel {
  return isEidolonLevel(level) ? level : fallback
}

function coerceSuperimpositionLevel(level: unknown, fallback: SuperimpositionLevel): SuperimpositionLevel {
  return isSuperimpositionLevel(level) ? level : fallback
}

function isEidolonLevel(level: unknown): level is EidolonLevel {
  return [
    EidolonLevel.NONE,
    EidolonLevel.E0,
    EidolonLevel.E1,
    EidolonLevel.E2,
    EidolonLevel.E3,
    EidolonLevel.E4,
    EidolonLevel.E5,
    EidolonLevel.E6,
  ].includes(level as EidolonLevel)
}

function isSuperimpositionLevel(level: unknown): level is SuperimpositionLevel {
  return [
    SuperimpositionLevel.NONE,
    SuperimpositionLevel.S1,
    SuperimpositionLevel.S2,
    SuperimpositionLevel.S3,
    SuperimpositionLevel.S4,
    SuperimpositionLevel.S5,
  ].includes(level as SuperimpositionLevel)
}

function splitLegacyTargetGoal(target: WarpTargetGoal | undefined): Pick<WarpTarget, 'targetEidolonLevel' | 'targetSuperimpositionLevel'> {
  if (target === 'S1') {
    return {
      targetEidolonLevel: EidolonLevel.NONE,
      targetSuperimpositionLevel: SuperimpositionLevel.S1,
    }
  }

  if (target && WarpTargetGoals.includes(target)) {
    return {
      targetEidolonLevel: Number(target.charAt(1)) as EidolonLevel,
      targetSuperimpositionLevel: Number(target.charAt(3)) as SuperimpositionLevel,
    }
  }

  return {
    targetEidolonLevel: EidolonLevel.E6,
    targetSuperimpositionLevel: SuperimpositionLevel.S5,
  }
}

// PMF (probability mass function) for cost starting at pity position.
// Result is 1-indexed: result[0] = 0, result[k] = P(costs k warps from pity position).
function pityAdjustedPmf(distribution: number[], pity: number, warpCap: number): number[] {
  const slice = distribution.slice(pity, warpCap)
  const total = slice.reduce((sum, p) => sum + p, 0)
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
