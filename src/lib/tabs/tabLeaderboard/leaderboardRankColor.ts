export function getLeaderboardRankColor(rank: number): string {
  if (rank <= 3) return 'var(--lb-rank-top-3)'
  if (rank <= 10) return 'var(--lb-rank-top-10)'
  if (rank <= 25) return 'var(--lb-rank-top-25)'
  if (rank <= 50) return 'var(--lb-rank-top-50)'
  return 'var(--lb-rank-remaining)'
}
