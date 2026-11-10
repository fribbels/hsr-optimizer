import {
  type SkinGoal,
  type SkinTarget,
  WarpTargetKind,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import { precisionRound } from 'lib/utils/mathUtils'

// Invites cost jade. Each rate applies after missing earlier draws, and the planner stops on a win.
export type SkinBanner = {
  readonly id: string,
  readonly enabled: boolean, // false hides and skips this banner while preserving saved targets
  readonly label: string,
  readonly image: string, // file name under assets/misc, without extension
  readonly jadePerInvite: number,
  readonly draws: readonly { readonly inviteCost: number, readonly rate: number }[],
}

// The outfit drops on `draw` (1-based) after `jadeCost` jade spent on this banner.
export type SkinOutcome = {
  draw: number,
  probability: number,
  jadeCost: number,
}

export const SKIN_BANNERS: readonly SkinBanner[] = [
  {
    id: 'star-lotto',
    enabled: true,
    label: 'Star Lotto',
    image: 'starLotto',
    jadePerInvite: 100,
    draws: [
      { inviteCost: 0, rate: 0.0005 },
      { inviteCost: 3, rate: 0.0025 },
      { inviteCost: 5, rate: 0.01 },
      { inviteCost: 8, rate: 0.015 },
      { inviteCost: 12, rate: 0.02 },
      { inviteCost: 15, rate: 0.05 },
      { inviteCost: 20, rate: 0.25 },
      { inviteCost: 24, rate: 1 },
    ],
  },
]

export function getSkinBanner(id: string | null | undefined): SkinBanner | undefined {
  return SKIN_BANNERS.find((banner) => banner.id === id)
}

// Keep the target after draws done and within the banner. Invalid values use the full banner range.
export function clampSkinGoal(banner: SkinBanner, drawsDone = 0, drawTarget = banner.draws.length): SkinGoal {
  const count = banner.draws.length
  const done = isIntegerInRange(drawsDone, 0, count - 1) ? drawsDone : 0
  const target = isIntegerInRange(drawTarget, 0, count) ? Math.max(drawTarget, done + 1) : count

  return { bannerId: banner.id, drawsDone: done, drawTarget: target }
}

export function normalizeSkinGoal(raw: Partial<SkinGoal> | null | undefined): SkinGoal | null {
  if (raw == null || typeof raw !== 'object') return null

  const { bannerId, drawsDone, drawTarget } = raw
  const banner = getSkinBanner(bannerId)

  return banner ? clampSkinGoal(banner, drawsDone, drawTarget) : null
}

// Skin targets have no character or light cone goal.
export function createSkinTarget(id: string, skin: SkinGoal): SkinTarget {
  return {
    kind: WarpTargetKind.SKIN,
    id,
    skin,
  }
}

// Each outcome is the first winning draw. Completed draws are sunk cost, and missing the target is a failure.
export function skinOutcomes(banner: SkinBanner, skin: SkinGoal): SkinOutcome[] {
  const outcomes: SkinOutcome[] = []
  let missProbability = 1
  let invites = 0

  for (let index = skin.drawsDone; index < skin.drawTarget; index++) {
    const { inviteCost, rate } = banner.draws[index]
    invites += inviteCost
    outcomes.push({ draw: index + 1, probability: missProbability * rate, jadeCost: invites * banner.jadePerInvite })
    missProbability *= 1 - rate
  }

  return outcomes
}

// Clean float error before rounding so 0.05% displays as 0.1%.
export function skinChancePercent(wins: number): number {
  return precisionRound(precisionRound(wins * 100), 1)
}

function isIntegerInRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}
