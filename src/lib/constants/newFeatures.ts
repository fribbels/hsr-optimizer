import { AppPages } from 'lib/constants/appPages'

export enum NewFeatureKey {
  WARP = 'warp',
  WARP_MULTI_TARGET = 'warp_multiTarget',
}

export const ACTIVE_NEW_FEATURES = new Set<string>([
  NewFeatureKey.WARP,
  NewFeatureKey.WARP_MULTI_TARGET,
])

export const PAGE_FEATURE_KEYS: Partial<Record<AppPages, NewFeatureKey>> = {
  [AppPages.WARP]: NewFeatureKey.WARP,
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
