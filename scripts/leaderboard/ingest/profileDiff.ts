import type {
  IncrementalProfileDiff,
  ParsedProfile,
  ProfilePayloadIndex,
} from '../shared/types'

export function diffProfilePayloads(input: {
  previous: ProfilePayloadIndex | null,
  currentProfiles: ParsedProfile[],
}): IncrementalProfileDiff {
  const { previous, currentProfiles } = input
  const currentByUid = indexProfilesByUid(currentProfiles)

  const unchangedUids = new Set<string>()
  const changedUids = new Set<string>()
  const newUids = new Set<string>()
  const missingUids = new Set<string>()

  if (previous === null) {
    for (const uid of currentByUid.keys()) {
      newUids.add(uid)
    }
    return { unchangedUids, changedUids, newUids, missingUids }
  }

  for (const [uid, current] of currentByUid) {
    const previousEntry = previous.profiles[uid]
    if (!previousEntry) {
      newUids.add(uid)
    } else if (previousEntry.payloadHash === current.payloadHash) {
      unchangedUids.add(uid)
    } else {
      changedUids.add(uid)
    }
  }

  for (const uid of Object.keys(previous.profiles)) {
    if (!currentByUid.has(uid)) {
      missingUids.add(uid)
    }
  }

  return { unchangedUids, changedUids, newUids, missingUids }
}

export function buildProfilePayloadIndex(input: {
  profiles: ParsedProfile[],
  exportId?: string,
}): ProfilePayloadIndex {
  const { profiles, exportId } = input
  const profilesByUid = indexProfilesByUid(profiles)

  const entries: ProfilePayloadIndex['profiles'] = {}
  for (const profile of profilesByUid.values()) {
    entries[profile.uid] = {
      uid: profile.uid,
      fetchedAt: profile.fetchedAt,
      payloadHash: profile.payloadHash,
    }
  }

  return {
    exportId,
    profiles: entries,
  }
}

function indexProfilesByUid(profiles: ParsedProfile[]): Map<string, ParsedProfile> {
  const byUid = new Map<string, ParsedProfile>()
  for (const profile of profiles) {
    if (byUid.has(profile.uid)) {
      throw new Error(`Duplicate profile UID ${profile.uid} in export`)
    }
    byUid.set(profile.uid, profile)
  }
  return byUid
}
