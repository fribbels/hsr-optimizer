import { AppPages } from 'lib/tabs/navigation/constants'

export enum NewFeatureKey {
  WARP = 'warp',
  WARP_MULTI_TARGET = 'warp_multiTarget',
  LEADERBOARD = 'leaderboard',
}

export const ACTIVE_NEW_FEATURES = new Set<string>([
  NewFeatureKey.LEADERBOARD,
])

export const PAGE_FEATURE_KEYS: Partial<Record<AppPages, NewFeatureKey>> = {
  [AppPages.LEADERBOARD]: NewFeatureKey.LEADERBOARD,
}

export function isNewGroupCheck(prefix: string, seenFeatures: Set<string>): boolean {
  for (const key of ACTIVE_NEW_FEATURES) {
    if (key === prefix || key.startsWith(prefix + '.')) {
      if (!seenFeatures.has(key)) {
        return true
      }
    }
  }
  return false
}

export function isNewFeatureCheck(key: string, seenFeatures: Set<string>): boolean {
  return ACTIVE_NEW_FEATURES.has(key) && !seenFeatures.has(key)
}
