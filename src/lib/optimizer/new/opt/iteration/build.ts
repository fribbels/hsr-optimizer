import { BodyPiece, FeetPiece, HandPiece, HeadPiece, RopePiece, SpherePiece } from '../../stats/relic'

export type BuildIndex = [number, number, number, number, number, number]

/**
 * Note: We do not support partial build, mainly for performance. Adding partial
 * build support would very much confuse the JIT, complicating the codebase (by
 * a fair bit with all the undef checks) and benefit little users.
 */
export type Build = {
  head: HeadPiece
  hand: HandPiece
  body: BodyPiece
  feet: FeetPiece
  sphere: SpherePiece
  rope: RopePiece
  value: number
}

export type BuildCandidate = Omit<Build, 'value'>
