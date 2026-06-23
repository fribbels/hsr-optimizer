import type { EligibleConverted } from 'leaderboard/ingest/eligibility'
import { isEligibleRaw } from 'leaderboard/ingest/eligibility'
import type { ParsedProfile } from 'leaderboard/ingest/exportParser'
import type {
  LeaderboardScoringCharacter,
  LeaderboardScoringProfile,
} from 'leaderboard/shared/types'
import type { UnconvertedCharacter } from 'lib/importer/characterConverter'
import { CharacterConverter } from 'lib/importer/characterConverter'
import type { MinifiedCharacter } from 'leaderboard/shared/profileCompression'
import { substatPotentialUnits } from 'lib/relics/scoring/scoringConstants'
import { prepareScoringMetadata } from 'lib/relics/scoring/scoringMetadata'
import type { ScorerMetadata } from 'lib/relics/scoring/types'
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

      const converted = CharacterConverter.convert(character.unconverted) as EligibleConverted

      const charId = converted.id

      const metadata = getGameMetadata().characters[charId]
      if (!metadata?.scoringMetadata) {
        totalSkipped++
        continue
      }

      let prepared = scoringMetadataCache.get(charId)
      if (!prepared) {
        prepared = prepareScoringMetadata(charId)
        scoringMetadataCache.set(charId, prepared)
      }
      let totalScore = 0
      for (const relic of Object.values(converted.equipped)) {
        if (!relic) continue
        for (const sub of relic.substats) {
          const weight = prepared.stats[sub.stat] || 0
          totalScore += substatPotentialUnits(sub.stat, sub.value) * weight
        }
      }

      if (!candidatesByChar.has(charId)) candidatesByChar.set(charId, [])
      candidatesByChar.get(charId)!.push({
        uid: profile.uid,
        fetchedAt: profile.fetchedAt,
        payloadHash: profile.payloadHash,
        unconverted: character.unconverted,
        minified: character.minified,
        charId,
        substatScore: totalScore,
      })
      totalEligible++
    }
  }

  const survivorsByProfile = new Map<string, LeaderboardScoringCharacter[]>()
  const profileMeta = new Map<string, { fetchedAt: number, payloadHash: string }>()
  let totalSurvivors = 0

  for (const [, candidates] of candidatesByChar) {
    candidates.sort((a, b) => b.substatScore - a.substatScore)
    const kept = candidates.slice(0, topN)
    totalSurvivors += kept.length

    for (const c of kept) {
      const converted = CharacterConverter.convert(c.unconverted) as EligibleConverted
      if (!survivorsByProfile.has(c.uid)) {
        survivorsByProfile.set(c.uid, [])
        profileMeta.set(c.uid, { fetchedAt: c.fetchedAt, payloadHash: c.payloadHash })
      }
      survivorsByProfile.get(c.uid)!.push({
        unconverted: c.unconverted,
        minified: c.minified,
        converted,
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
