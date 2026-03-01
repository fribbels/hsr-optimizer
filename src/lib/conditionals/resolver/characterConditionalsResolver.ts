import { characterConfigRegistry } from 'lib/conditionals/resolver/characterConfigRegistry'
import { CharacterId, Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'

export type CharacterConditionalFunction = (e: Eidolon, withContent: boolean) => CharacterConditionalsController

export const characterOptionMapping = {} as Record<CharacterId, CharacterConditionalFunction>

for (const [id, config] of characterConfigRegistry) {
  characterOptionMapping[id] = config.conditionals
}

/**
 * Writing conditional text guidelines:
 *
 * DEF shred for debuffs, DEF PEN for buffs. Same for RES shred / RES PEN
 * Basic / Skill / Ult / DoT / FuA
 * Stats uppercased HP / DEF / ATK / CR / SPD / etc
 * Buff for actual stat buffs that last x turns or named buffs. Boost for DMG boost or other non visible buffs.
 * (force weakness break) on abilities that require broken targets / super break
 * Spaces between slashes CR / CD
 * Default RES is (dmg) RES, eff res is Effect RES
 * RNG hits are "x extra hits"
 * If a conditional has more than one buff effect, just consolidate as "buffs"
 * Techniques / start of fight buffs are called Initial buffs
 */
export const CharacterConditionalsResolver = {
  get: (request: {
    characterId: CharacterId,
    characterEidolon: number,
  }, withContent = false): CharacterConditionalsController => {
    const characterFn = characterOptionMapping[request.characterId]
    return characterFn(request.characterEidolon, withContent)
  },
}
