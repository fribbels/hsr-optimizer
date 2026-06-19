import type { UnconvertedCharacter } from 'lib/importer/characterConverter'
import { expandCharacter } from 'scripts/leaderboard/shared/profileCompression'
import type {
  MinifiedCharacter,
  MinifiedProfile,
} from 'scripts/leaderboard/shared/profileCompression'
import { sha256Text } from '../shared/hash'
import {
  gunzipBase64Text,
  readGzipTextFile,
} from '../shared/nodeFacade'
import type {
  CharacterParseError,
  ExportParseSummary,
  ParsedCharacter,
  ParsedExport,
  ParsedProfile,
} from '../shared/types'

export type { ExportParseSummary, ParsedCharacter, ParsedExport, ParsedProfile } from '../shared/types'

enum ExportLineOutcome {
  NonProfile = 'nonProfile',
  Malformed = 'malformed',
}

export function parseExport(filePath: string): ParsedExport {
  const raw = readGzipTextFile(filePath)
  const lines = raw.split('\n').filter((line) => line.trim().length > 0)

  const profiles: ParsedProfile[] = []
  const characterErrors: CharacterParseError[] = []
  let malformedRows = 0
  let profileRows = 0

  for (const line of lines) {
    const result = parseExportLine(line, characterErrors)
    if (result === ExportLineOutcome.NonProfile) {
      continue
    }
    if (result === ExportLineOutcome.Malformed) {
      malformedRows++
      continue
    }
    profileRows++
    if (result.characters.length > 0) {
      profiles.push(result)
    }
  }

  const summary: ExportParseSummary = {
    exportPath: filePath,
    totalRows: lines.length,
    profileRows,
    malformedRows,
    parsedProfiles: profiles.length,
    characterErrors,
  }

  console.log(`Parsed ${profiles.length} profiles from ${lines.length} rows (${malformedRows} malformed, ${characterErrors.length} character errors)`)

  return { profiles, summary }
}

function parseExportLine(line: string, characterErrors: CharacterParseError[]): ParsedProfile | ExportLineOutcome {
  try {
    const row = JSON.parse(line) as Record<string, unknown>
    const item = (row.Item ?? row) as {
      pk?: { S?: string },
      sk?: { S?: string },
      t?: { N?: string },
      d?: { B?: string },
    }

    if (item.sk?.S !== 'U') {
      return ExportLineOutcome.NonProfile
    }

    const uid = item.pk?.S
    const fetchedAtRaw = item.t?.N
    const payloadBase64 = item.d?.B
    if (!uid || !fetchedAtRaw || !payloadBase64) {
      throw new Error('Missing required Dynamo fields (pk.S, t.N, or d.B)')
    }
    const fetchedAt = Number(fetchedAtRaw)
    if (!Number.isFinite(fetchedAt)) {
      throw new Error(`Non-finite fetchedAt: ${fetchedAtRaw}`)
    }
    const payloadHash = sha256Text(payloadBase64)

    const minified = JSON.parse(gunzipBase64Text(payloadBase64)) as MinifiedProfile
    if (!Array.isArray(minified.a)) {
      throw new Error('Minified profile payload missing character array')
    }

    const characters: ParsedCharacter[] = []
    for (let i = 0; i < minified.a.length; i++) {
      const minChar = minified.a[i] as MinifiedCharacter
      if (typeof minChar.a !== 'number') {
        characterErrors.push({ uid, avatarId: 0, error: `Character ${i} missing avatarId` })
        continue
      }
      try {
        const unconverted: UnconvertedCharacter = expandCharacter(minChar)
        characters.push({ unconverted, minified: minChar })
      } catch (e) {
        characterErrors.push({ uid, avatarId: minChar.a, error: String(e) })
      }
    }

    return { uid, fetchedAt, payloadHash, payloadBase64, characters }
  } catch (e) {
    console.warn(`Skipping malformed export line: ${String(e)}`)
    return ExportLineOutcome.Malformed
  }
}
