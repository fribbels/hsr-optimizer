import { isEligibleRaw } from 'leaderboard/ingest/eligibility'
import type { ParsedProfile } from 'leaderboard/ingest/exportParser'
import {
  computePreFilterSubstatScore,
  extractPreFilterSubstats,
} from 'leaderboard/ingest/preFilterExtractor'
import type {
  LeaderboardScoringCharacter,
  LeaderboardScoringProfile,
} from 'leaderboard/shared/types'
import type { UnconvertedCharacter } from 'lib/importer/characterConverter'
import type { MinifiedCharacter } from 'leaderboard/shared/profileCompression'
import { prepareScoringMetadata } from 'lib/relics/scoring/scoringMetadata'
import type { ScorerMetadata } from 'lib/relics/scoring/types'
import { CONFIG_DISPLAY_ORDER, hasConfig } from 'lib/scoring/scoringConfig'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { CharacterId } from 'types/character'

type PreFilterCandidate = {
  uid: string,
  fetchedAt: number,
  payloadHash: string,
  unconverted: UnconvertedCharacter,
  minified: MinifiedCharacter,
  charId: CharacterId,
  substatScore: number,
  substatScoreNoSpd: number,
}

export type PreFilterResult = {
  profiles: LeaderboardScoringProfile[],
  eligibleCounts: Map<string, number>,
  totalCounts: Map<string, number>,
}

export function preFilterProfiles(
  profiles: ParsedProfile[],
  topN: number = 100,
): PreFilterResult {
  const candidatesByChar = new Map<string, PreFilterCandidate[]>()
  const totalCountsByChar = new Map<string, number>()
  const scoringMetadataCache = new Map<CharacterId, ScorerMetadata>()
  let totalEligible = 0
  let totalSkipped = 0

  for (const profile of profiles) {
    for (const character of profile.characters) {
      const rawCharId = String(character.unconverted.avatarId)
      totalCountsByChar.set(rawCharId, (totalCountsByChar.get(rawCharId) ?? 0) + 1)

      if (!isEligibleRaw(character.unconverted)) {
        totalSkipped++
        continue
      }

      const charId = rawCharId as CharacterId

      const metadata = getGameMetadata().characters[charId]
      if (!metadata?.scoringMetadata || metadata.rarity < 5) {
        totalSkipped++
        continue
      }

      if (!CONFIG_DISPLAY_ORDER.some((ct) => hasConfig(metadata.scoringMetadata, ct))) {
        totalSkipped++
        continue
      }

      const substats = extractPreFilterSubstats(character.unconverted.relicList!)

      let prepared = scoringMetadataCache.get(charId)
      if (!prepared) {
        prepared = prepareScoringMetadata(charId)
        scoringMetadataCache.set(charId, prepared)
      }
      const { score: totalScore, scoreNoSpd: totalScoreNoSpd } = computePreFilterSubstatScore(substats, prepared.stats)

      if (!candidatesByChar.has(charId)) candidatesByChar.set(charId, [])
      candidatesByChar.get(charId)!.push({
        uid: profile.uid,
        fetchedAt: profile.fetchedAt,
        payloadHash: profile.payloadHash,
        unconverted: character.unconverted,
        minified: character.minified,
        charId,
        substatScore: totalScore,
        substatScoreNoSpd: totalScoreNoSpd,
      })
      totalEligible++
    }
  }

  const survivorsByProfile = new Map<string, LeaderboardScoringCharacter[]>()
  const profileMeta = new Map<string, { fetchedAt: number, payloadHash: string }>()
  let totalSurvivors = 0

  // Union of two top-N lists: one ranked with SPD, one without.
  // Ensures both SPD-dependent and SPD-independent builds survive the prefilter.
  for (const [, candidates] of candidatesByChar) {
    candidates.sort((a, b) => b.substatScore - a.substatScore)
    const keptBySpd = candidates.slice(0, topN)

    candidates.sort((a, b) => b.substatScoreNoSpd - a.substatScoreNoSpd)
    const keptNoSpd = candidates.slice(0, topN)

    // Merge both lists, keeping the best rank from either list per candidate
    const bestRank = new Map<string, number>()
    const candidateByKey = new Map<string, PreFilterCandidate>()

    for (let i = 0; i < keptBySpd.length; i++) {
      const key = `${keptBySpd[i].uid}#${keptBySpd[i].charId}`
      bestRank.set(key, i + 1)
      candidateByKey.set(key, keptBySpd[i])
    }

    for (let i = 0; i < keptNoSpd.length; i++) {
      const key = `${keptNoSpd[i].uid}#${keptNoSpd[i].charId}`
      const rank = i + 1
      const existing = bestRank.get(key)
      if (existing === undefined || rank < existing) {
        bestRank.set(key, rank)
      }
      if (!candidateByKey.has(key)) {
        candidateByKey.set(key, keptNoSpd[i])
      }
    }

    const merged: { candidate: PreFilterCandidate, rank: number }[] = []
    for (const [key, candidate] of candidateByKey) {
      merged.push({ candidate, rank: bestRank.get(key)! })
    }

    merged.sort((a, b) => a.rank - b.rank)
    totalSurvivors += merged.length

    for (let i = 0; i < merged.length; i++) {
      const { candidate: c, rank } = merged[i]
      if (!survivorsByProfile.has(c.uid)) {
        survivorsByProfile.set(c.uid, [])
        profileMeta.set(c.uid, { fetchedAt: c.fetchedAt, payloadHash: c.payloadHash })
      }
      survivorsByProfile.get(c.uid)!.push({
        unconverted: c.unconverted,
        minified: c.minified,
        preFilterRank: rank,
        qualityOrder: i,
      })
    }
  }

  const filteredProfiles: LeaderboardScoringProfile[] = []
  for (const [uid, characters] of survivorsByProfile) {
    const meta = profileMeta.get(uid)!
    filteredProfiles.push({
      uid,
      fetchedAt: meta.fetchedAt,
      payloadHash: meta.payloadHash,
      characters,
    })
  }

  console.log(`Pre-filter: ${totalEligible} eligible across ${candidatesByChar.size} characters, ${totalSkipped} skipped`)
  console.log(`Pre-filter: kept ${totalSurvivors} candidates across ${filteredProfiles.length} profiles (top ${topN} per character)`)

  const eligibleCounts = new Map<string, number>()
  for (const [charId, candidates] of candidatesByChar) {
    eligibleCounts.set(charId, candidates.length)
  }

  return { profiles: filteredProfiles, eligibleCounts, totalCounts: totalCountsByChar }
}
