import { CharacterConditionalsController } from 'types/conditionals'

type CharacterConditionalFunction = (eidolon: number, withContent: boolean) => CharacterConditionalsController
type CharacterModule = { default: CharacterConditionalFunction }
type CharacterRequest = {
  characterId: string
  characterEidolon: number
}

const characterModules: Record<string, () => Promise<CharacterModule>> = {
  1001: () => import('lib/conditionals/character/1000/March7th'),
  1002: () => import('lib/conditionals/character/1000/DanHeng'),
  1003: () => import('lib/conditionals/character/1000/Himeko'),
  1004: () => import('lib/conditionals/character/1000/Welt'),
  1005: () => import('lib/conditionals/character/1000/Kafka'),
  1006: () => import('lib/conditionals/character/1000/SilverWolf'),
  1008: () => import('lib/conditionals/character/1000/Arlan'),
  1009: () => import('lib/conditionals/character/1000/Asta'),
  1013: () => import('lib/conditionals/character/1000/Herta'),
  1101: () => import('lib/conditionals/character/1100/Bronya'),
  1102: () => import('lib/conditionals/character/1100/Seele'),
  1103: () => import('lib/conditionals/character/1100/Serval'),
  1104: () => import('lib/conditionals/character/1100/Gepard'),
  1105: () => import('lib/conditionals/character/1100/Natasha'),
  1106: () => import('lib/conditionals/character/1100/Pela'),
  1107: () => import('lib/conditionals/character/1100/Clara'),
  1108: () => import('lib/conditionals/character/1100/Sampo'),
  1109: () => import('lib/conditionals/character/1100/Hook'),
  1110: () => import('lib/conditionals/character/1100/Lynx'),
  1111: () => import('lib/conditionals/character/1100/Luka'),
  1112: () => import('lib/conditionals/character/1100/Topaz'),
  1201: () => import('lib/conditionals/character/1200/Qingque'),
  1202: () => import('lib/conditionals/character/1200/Tingyun'),
  1203: () => import('lib/conditionals/character/1200/Luocha'),
  1204: () => import('lib/conditionals/character/1200/JingYuan'),
  1205: () => import('lib/conditionals/character/1200/Blade'),
  1206: () => import('lib/conditionals/character/1200/Sushang'),
  1207: () => import('lib/conditionals/character/1200/Yukong'),
  1208: () => import('lib/conditionals/character/1200/FuXuan'),
  1209: () => import('lib/conditionals/character/1200/Yanqing'),
  1210: () => import('lib/conditionals/character/1200/Guinaifen'),
  1211: () => import('lib/conditionals/character/1200/Bailu'),
  1212: () => import('lib/conditionals/character/1200/Jingliu'),
  1213: () => import('lib/conditionals/character/1200/ImbibitorLunae'),
  1214: () => import('lib/conditionals/character/1200/Xueyi'),
  1215: () => import('lib/conditionals/character/1200/Hanya'),
  1217: () => import('lib/conditionals/character/1200/Huohuo'),
  1218: () => import('lib/conditionals/character/1200/Jiaoqiu'),
  1220: () => import('lib/conditionals/character/1200/Feixiao'),
  1221: () => import('lib/conditionals/character/1200/Yunli'),
  1222: () => import('lib/conditionals/character/1200/Lingsha'),
  1223: () => import('lib/conditionals/character/1200/Moze'),
  1224: () => import('lib/conditionals/character/1200/March7thImaginary'),
  1225: () => import('lib/conditionals/character/1200/Fugue'),
  1301: () => import('lib/conditionals/character/1300/Gallagher'),
  1302: () => import('lib/conditionals/character/1300/Argenti'),
  1303: () => import('lib/conditionals/character/1300/RuanMei'),
  1304: () => import('lib/conditionals/character/1300/Aventurine'),
  1305: () => import('lib/conditionals/character/1300/DrRatio'),
  1306: () => import('lib/conditionals/character/1300/Sparkle'),
  1307: () => import('lib/conditionals/character/1300/BlackSwan'),
  1308: () => import('lib/conditionals/character/1300/Acheron'),
  1309: () => import('lib/conditionals/character/1300/Robin'),
  1310: () => import('lib/conditionals/character/1300/Firefly'),
  1312: () => import('lib/conditionals/character/1300/Misha'),
  1313: () => import('lib/conditionals/character/1300/Sunday'),
  1314: () => import('lib/conditionals/character/1300/Jade'),
  1315: () => import('lib/conditionals/character/1300/Boothill'),
  1317: () => import('lib/conditionals/character/1300/Rappa'),
  1401: () => import('lib/conditionals/character/1400/TheHerta'),
  1402: () => import('lib/conditionals/character/1400/Aglaea'),
  1403: () => import('lib/conditionals/character/1400/Tribbie'),
  1404: () => import('lib/conditionals/character/1400/Mydei'),
  1405: () => import('lib/conditionals/character/1400/Anaxa'),
  1407: () => import('lib/conditionals/character/1400/Castorice'),
  8001: () => import('lib/conditionals/character/8000/TrailblazerDestruction'),
  8002: () => import('lib/conditionals/character/8000/TrailblazerDestruction'),
  8003: () => import('lib/conditionals/character/8000/TrailblazerPreservation'),
  8004: () => import('lib/conditionals/character/8000/TrailblazerPreservation'),
  8005: () => import('lib/conditionals/character/8000/TrailblazerHarmony'),
  8006: () => import('lib/conditionals/character/8000/TrailblazerHarmony'),
  8007: () => import('lib/conditionals/character/8000/TrailblazerRemembrance'),
  8008: () => import('lib/conditionals/character/8000/TrailblazerRemembrance'),
}

const characterRegistry = new Map<string, CharacterConditionalFunction>()

export async function preloadCharacters(characterIds: string[]): Promise<CharacterConditionalFunction[]> {
  const promises = characterIds.map(async (characterId) => {
    if (!characterRegistry.has(characterId)) {
      const importFn = characterModules[characterId]
      if (!importFn) {
        throw new Error(`No character found for ID: ${characterId}`)
      }

      const module = await importFn()
      characterRegistry.set(characterId, module.default)
      return module.default
    }
    return Promise.resolve(characterRegistry.get(characterId)!)
  })

  await Promise.all(promises)
  return characterIds.map((id) => characterRegistry.get(id)!)
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
 * RNG hits are “x extra hits”
 * If a conditional has more than one buff effect, just consolidate as “buffs”
 * Techniques / start of fight buffs are called Initial buffs
 */
export const CharacterConditionalsResolver = {
  get(request: CharacterRequest, withContent = false): CharacterConditionalsController {
    const { characterId, characterEidolon } = request

    if (!characterRegistry.has(characterId)) {
      throw new Error(`Character ${characterId} not preloaded.`)
    }

    const characterFn = characterRegistry.get(characterId)!
    return characterFn(characterEidolon, withContent)
  },
}
