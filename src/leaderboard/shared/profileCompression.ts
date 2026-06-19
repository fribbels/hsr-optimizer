import type { UnconvertedCharacter } from 'lib/importer/characterConverter'
import type { LightConeId } from 'types/lightCone'

/*
 * Minified JSON key mapping (must stay in sync with server Lambda):
 *
 * Root:    a = characters array
 * Char:    a = avatarId, r = rank, e = enhancedId
 * Equip:   q = equipment, q.t = tid, q.r = rank
 * Relic:   l = relicList, t = tid, v = level, m = mainAffixId, u = subAffixList
 * Sub:     a = affixId, c = cnt, s = step
 */

export type MinifiedProfile = {
  a: MinifiedCharacter[],
}

export type MinifiedCharacter = {
  a: number,
  r?: number,
  e?: number,
  q?: { t: number, r: number },
  l?: MinifiedRelic[],
}

type MinifiedRelic = {
  t: number,
  v: number,
  m: number,
  u: MinifiedSubAffix[],
}

type MinifiedSubAffix = {
  a: number,
  c: number,
  s?: number,
}

export function minifyProfile(avatarDetailList: Record<string, unknown>[]): MinifiedProfile {
  const sorted = avatarDetailList
    .filter((x) => !!x)
    .sort((a, b) => {
      if (b._assist && a._assist) return ((a.pos as number) || 0) - ((b.pos as number) || 0)
      if (b._assist) return 1
      if (a._assist) return -1
      return 0
    })
    .filter((item, index, array) => {
      return array.findIndex((i) => i.avatarId === item.avatarId) === index
    })

  return { a: sorted.map(minifyCharacter) }
}

function minifyCharacter(char: Record<string, unknown>): MinifiedCharacter {
  const result: MinifiedCharacter = { a: char.avatarId as number }
  if (char.rank != null) result.r = char.rank as number
  if (char.enhancedId) result.e = char.enhancedId as number

  if (char.equipment) {
    const equip = char.equipment as Record<string, unknown>
    result.q = { t: equip.tid as number, r: equip.rank as number }
  }

  if (Array.isArray(char.relicList)) {
    result.l = char.relicList.map((relicValue: unknown): MinifiedRelic => {
      const relic = relicValue as Record<string, unknown>
      return {
        t: relic.tid as number,
        v: relic.level as number,
        m: relic.mainAffixId as number,
        u: (Array.isArray(relic.subAffixList) ? relic.subAffixList : []).map((subValue: unknown): MinifiedSubAffix => {
          const s = subValue as Record<string, unknown>
          const sub: MinifiedSubAffix = { a: s.affixId as number, c: (s.cnt ?? s.count) as number }
          if (s.step) sub.s = s.step as number
          return sub
        }),
      }
    })
  }

  return result
}

export function expandProfile(minified: MinifiedProfile): UnconvertedCharacter[] {
  return minified.a.map(expandCharacter)
}

export { expandCharacter }

function expandCharacter(char: MinifiedCharacter): UnconvertedCharacter {
  const avatarId = char.e ? `${char.a}b${char.e}` : char.a

  const result: UnconvertedCharacter = { avatarId }
  if (char.r != null) result.rank = char.r

  if (char.q) {
    result.equipment = {
      tid: String(char.q.t) as LightConeId,
      rank: char.q.r,
      level: 80,
    }
  }

  if (char.l) {
    result.relicList = char.l.map((relic) => {
      return {
        tid: String(relic.t),
        level: relic.v ?? 0,
        mainAffixId: relic.m,
        subAffixList: relic.u.map((s) => ({
          affixId: s.a,
          cnt: s.c,
          step: s.s ?? 0,
        })),
      }
    })
  }

  return result
}
