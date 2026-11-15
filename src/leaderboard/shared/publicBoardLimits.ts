// Default --top-n-public, and the depth of older output without topNPublic
export const PUBLIC_TOP_N = 100

// Only builds at or above this score are published
export const AEON_SCORE = 1.50

export function resolvePublicTopN(output: { topNPublic?: number }): number {
  return output.topNPublic ?? PUBLIC_TOP_N
}
