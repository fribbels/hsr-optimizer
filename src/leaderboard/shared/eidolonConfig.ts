import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import {
  TrailblazerElationCaelus,
  TrailblazerElationStelle,
} from 'lib/conditionals/character/8000/TrailblazerElation'
import {
  TrailblazerHarmonyCaelus,
  TrailblazerHarmonyStelle,
} from 'lib/conditionals/character/8000/TrailblazerHarmony'
import {
  TrailblazerRemembranceCaelus,
  TrailblazerRemembranceStelle,
} from 'lib/conditionals/character/8000/TrailblazerRemembrance'
import { FlyIntoAPinkTomorrow } from 'lib/conditionals/lightcone/4star/FlyIntoAPinkTomorrow'
import { MemoriesOfThePast } from 'lib/conditionals/lightcone/4star/MemoriesOfThePast'
import { ElationBrimmingWithBlessings } from 'lib/conditionals/lightcone/5star/ElationBrimmingWithBlessings'
import { getAllCharacterConfigs } from 'lib/conditionals/resolver/characterConfigRegistry'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

export const EIDOLON_TIERS = [0, 1, 2, 6] as const
export type EidolonTierValue = typeof EIDOLON_TIERS[number]

export type LeaderboardEidolonGroup = `e${EidolonTierValue}`
export const EIDOLON_GROUPS: LeaderboardEidolonGroup[] = EIDOLON_TIERS.map((e) => `e${e}` as LeaderboardEidolonGroup)

export const DEFAULT_TIER_SUPERIMPOSITION = 1

export const LEADERBOARD_FILTER_ALL = 'all' as const
export type LeaderboardEidolonFilter = LeaderboardEidolonGroup | typeof LEADERBOARD_FILTER_ALL

export function eidolonToGroup(eidolon: number): LeaderboardEidolonGroup {
  for (let i = EIDOLON_TIERS.length - 1; i >= 0; i--) {
    if (eidolon >= EIDOLON_TIERS[i]) return EIDOLON_GROUPS[i]
  }
  return EIDOLON_GROUPS[0]
}

export type FixedTeammateOverride = {
  eidolon: number,
  lcSuperimpositions: Partial<Record<LightConeId, number>>,
}

export const FIXED_TEAMMATE_OVERRIDES: Partial<Record<CharacterId, FixedTeammateOverride>> = {
  [TrailblazerHarmonyCaelus.id]: { eidolon: 6, lcSuperimpositions: { [MemoriesOfThePast.id]: 5 } },
  [TrailblazerHarmonyStelle.id]: { eidolon: 6, lcSuperimpositions: { [MemoriesOfThePast.id]: 5 } },
  [TrailblazerRemembranceCaelus.id]: { eidolon: 6, lcSuperimpositions: { [FlyIntoAPinkTomorrow.id]: 5 } },
  [TrailblazerRemembranceStelle.id]: { eidolon: 6, lcSuperimpositions: { [FlyIntoAPinkTomorrow.id]: 5 } },
  [TrailblazerElationCaelus.id]: { eidolon: 6, lcSuperimpositions: { [ElationBrimmingWithBlessings.id]: 5 } },
  [TrailblazerElationStelle.id]: { eidolon: 6, lcSuperimpositions: { [ElationBrimmingWithBlessings.id]: 5 } },
}

export const TEAMMATE_EIDOLON_CAPS: Partial<Record<CharacterId, number>> = {
  [Sunday.id]: 5,
}

let signatureLcSet: Set<LightConeId> | null = null
function getSignatureLcSet(): Set<LightConeId> {
  if (signatureLcSet) return signatureLcSet
  signatureLcSet = new Set<LightConeId>()
  for (const config of getAllCharacterConfigs().values()) {
    if (config.defaultLightCone) {
      signatureLcSet.add(config.defaultLightCone)
    }
  }
  return signatureLcSet
}

export function getTeammateLcSuperimposition(
  characterId: CharacterId,
  lightConeId: LightConeId,
): number {
  // Explicit per-character overrides (e.g. Trailblazers at E6/S5)
  const fixed = FIXED_TEAMMATE_OVERRIDES[characterId]
  if (fixed?.lcSuperimpositions[lightConeId] != null) {
    return fixed.lcSuperimpositions[lightConeId]
  }

  // 4-star and 3-star LCs are cheap to superimpose
  const lcMeta = getGameMetadata().lightCones?.[lightConeId]
  if (lcMeta && lcMeta.rarity < 5) {
    return 5
  }

  // Non-signature 5-star LCs are not worth pulling dupes for
  if (!getSignatureLcSet().has(lightConeId)) {
    return 5
  }

  // Signature 5-star LCs default to S1
  return DEFAULT_TIER_SUPERIMPOSITION
}
