import {
  DEFAULT_WARP_REQUEST,
  DEFAULT_WARP_TARGET,
  EidolonLevel,
  PlannerMode,
  StarlightRefund,
  SuperimpositionLevel,
  type WarpRequest,
  WarpIncomeOptions,
  WarpStrategy,
  type WarpTarget,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'

/**
 * Legacy-only constructs. These no longer exist on the canonical {@link WarpRequest}/{@link WarpTarget};
 * they are read once at load time by {@link migrateWarpRequest} to upgrade older saves.
 */

export enum BannerRotation {
  NEW,
  RERUN,
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

/** A persisted target as it may appear in older saves: canonical fields plus legacy extras, all optional. */
export type LegacyWarpTarget = Partial<WarpTarget> & {
  target?: WarpTargetGoal,
  strategy?: WarpStrategy,
}

/** A persisted request as it may appear in older saves: canonical fields plus legacy extras, all optional. */
export type LegacyWarpRequest = Partial<Omit<WarpRequest, 'targets'>> & {
  targets?: LegacyWarpTarget[],
  bannerRotation?: BannerRotation,
  currentEidolonLevel?: EidolonLevel,
  currentSuperimpositionLevel?: SuperimpositionLevel,
}

/**
 * Upgrades a persisted (possibly legacy) warp request into the canonical shape used by the engine and UI.
 * Safe to run on already-canonical requests — it is idempotent.
 */
export function migrateWarpRequest(raw: LegacyWarpRequest | null | undefined): WarpRequest {
  if (!raw) return { ...DEFAULT_WARP_REQUEST, targets: [{ ...DEFAULT_WARP_TARGET }] }

  const merged = { ...DEFAULT_WARP_REQUEST, ...raw }
  const income = Array.isArray(raw.income)
    ? raw.income.filter((incomeId) => WarpIncomeOptions.some((option) => option.id === incomeId))
    : []

  return {
    passes: Number(merged.passes) || 0,
    jades: Number(merged.jades) || 0,
    income,
    targets: normalizeWarpTargets(raw),
    plannerMode: merged.plannerMode ?? PlannerMode.MULTI,
    strategy: merged.strategy ?? WarpStrategy.E0,
    starlight: merged.starlight ?? StarlightRefund.REFUND_AVG,
    pityCharacter: Number(merged.pityCharacter) || 0,
    guaranteedCharacter: merged.guaranteedCharacter ?? false,
    pityLightCone: Number(merged.pityLightCone) || 0,
    guaranteedLightCone: merged.guaranteedLightCone ?? false,
  }
}

export function normalizeWarpTargets(raw: LegacyWarpRequest): WarpTarget[] {
  if (Array.isArray(raw.targets) && raw.targets.length > 0) {
    return raw.targets.map((target, index) => normalizeTarget(target, index, raw))
  }

  const isRerun = raw.bannerRotation === BannerRotation.RERUN
  return [
    normalizeTarget({
      id: 'target-1',
      characterId: null,
      lightConeId: null,
      targetEidolonLevel: EidolonLevel.E6,
      targetSuperimpositionLevel: SuperimpositionLevel.S5,
      currentEidolonLevel: isRerun ? raw.currentEidolonLevel ?? EidolonLevel.NONE : EidolonLevel.NONE,
      currentSuperimpositionLevel: isRerun ? raw.currentSuperimpositionLevel ?? SuperimpositionLevel.NONE : SuperimpositionLevel.NONE,
    }, 0, raw),
  ]
}

function normalizeTarget(target: LegacyWarpTarget, index: number, raw: LegacyWarpRequest): WarpTarget {
  const legacyGoal = splitLegacyTargetGoal(target.target)
  const fallbackCurrentEidolonLevel = raw.currentEidolonLevel ?? EidolonLevel.NONE
  const fallbackCurrentSuperimpositionLevel = raw.currentSuperimpositionLevel ?? SuperimpositionLevel.NONE

  return {
    id: target.id || `target-${index + 1}`,
    characterId: target.characterId ?? null,
    lightConeId: target.lightConeId ?? null,
    targetEidolonLevel: coerceEidolonLevel(target.targetEidolonLevel, legacyGoal.targetEidolonLevel),
    targetSuperimpositionLevel: coerceSuperimpositionLevel(target.targetSuperimpositionLevel, legacyGoal.targetSuperimpositionLevel),
    currentEidolonLevel: coerceEidolonLevel(target.currentEidolonLevel, fallbackCurrentEidolonLevel),
    currentSuperimpositionLevel: coerceSuperimpositionLevel(target.currentSuperimpositionLevel, fallbackCurrentSuperimpositionLevel),
  }
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
