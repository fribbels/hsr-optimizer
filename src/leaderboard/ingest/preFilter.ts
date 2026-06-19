import { CharacterConverter } from 'lib/importer/characterConverter'
import { substatPotentialUnits } from 'lib/relics/scoring/scoringConstants'
import { prepareScoringMetadata } from 'lib/relics/scoring/scoringMetadata'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { EligibleConverted } from 'leaderboard/ingest/eligibility'
import { isEligibleRaw } from 'leaderboard/ingest/eligibility'
import type {
  ParsedCharacter,
  ParsedProfile,
} from 'leaderboard/ingest/exportParser'
import type { CharacterId } from 'types/character'

type PreFilterCandidate = {
  profile: ParsedProfile,
  character: ParsedCharacter,
  charId: CharacterId,
  substatScore: number,
}

export type PreFilterResult = {
  profiles: ParsedProfile[],
  eligibleCounts: Map<string, number>,
  totalCounts: Map<string, number>,
}

export function preFilterProfiles(
  profiles: ParsedProfile[],
  topN: number = 100,
): PreFilterResult {
  const candidatesByChar = new Map<string, PreFilterCandidate[]>()
  const totalCountsByChar = new Map<string, number>()
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

      const prepared = prepareScoringMetadata(charId)
      let totalScore = 0
      for (const relic of Object.values(converted.equipped)) {
        if (!relic) continue
        for (const sub of relic.substats) {
          const weight = prepared.stats[sub.stat] || 0
          totalScore += substatPotentialUnits(sub.stat, sub.value) * weight
        }
      }

      if (!candidatesByChar.has(charId)) candidatesByChar.set(charId, [])
      candidatesByChar.get(charId)!.push({ profile, character, charId, substatScore: totalScore })
      totalEligible++
    }
  }

  const survivorKeys = new Set<string>()
  let totalSurvivors = 0

  for (const [charId, candidates] of candidatesByChar) {
    candidates.sort((a, b) => b.substatScore - a.substatScore)
    const kept = candidates.slice(0, topN)
    totalSurvivors += kept.length

    for (const c of kept) {
      survivorKeys.add(`${c.profile.uid}#${c.charId}`)
    }
  }

  const filteredProfiles: ParsedProfile[] = []
  for (const profile of profiles) {
    const keptCharacters = profile.characters.filter((c) => {
      const charId = String(c.unconverted.avatarId)
      return survivorKeys.has(`${profile.uid}#${charId}`)
    })
    if (keptCharacters.length > 0) {
      filteredProfiles.push({ ...profile, characters: keptCharacters })
    }
  }

  console.log(`Pre-filter: ${totalEligible} eligible across ${candidatesByChar.size} characters, ${totalSkipped} skipped`)
  console.log(`Pre-filter: kept ${totalSurvivors} candidates across ${filteredProfiles.length} profiles (top ${topN} per character)`)

  const eligibleCounts = new Map<string, number>()
  for (const [charId, candidates] of candidatesByChar) {
    eligibleCounts.set(charId, candidates.length)
  }

  return { profiles: filteredProfiles, eligibleCounts, totalCounts: totalCountsByChar }
}
