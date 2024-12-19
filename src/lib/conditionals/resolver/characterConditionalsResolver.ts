import arlan from 'lib/conditionals/character/1000/Arlan'
import asta from 'lib/conditionals/character/1000/Asta'
import danheng from 'lib/conditionals/character/1000/DanHeng'
import herta from 'lib/conditionals/character/1000/Herta'
import himeko from 'lib/conditionals/character/1000/Himeko'
import kafka from 'lib/conditionals/character/1000/Kafka'
import march7th from 'lib/conditionals/character/1000/March7th'
import silverwolf from 'lib/conditionals/character/1000/SilverWolf'
import welt from 'lib/conditionals/character/1000/Welt'
import bronya from 'lib/conditionals/character/1100/Bronya'
import clara from 'lib/conditionals/character/1100/Clara'
import gepard from 'lib/conditionals/character/1100/Gepard'
import hook from 'lib/conditionals/character/1100/Hook'
import luka from 'lib/conditionals/character/1100/Luka'
import lynx from 'lib/conditionals/character/1100/Lynx'
import natasha from 'lib/conditionals/character/1100/Natasha'
import pela from 'lib/conditionals/character/1100/Pela'
import sampo from 'lib/conditionals/character/1100/Sampo'
import seele from 'lib/conditionals/character/1100/Seele'
import serval from 'lib/conditionals/character/1100/Serval'
import topaz from 'lib/conditionals/character/1100/Topaz'
import bailu from 'lib/conditionals/character/1200/Bailu'
import blade from 'lib/conditionals/character/1200/Blade'
import feixiao from 'lib/conditionals/character/1200/Feixiao'
import fugue from 'lib/conditionals/character/1200/Fugue'
import fuxuan from 'lib/conditionals/character/1200/FuXuan'
import guinaifen from 'lib/conditionals/character/1200/Guinaifen'
import hanya from 'lib/conditionals/character/1200/Hanya'
import huohuo from 'lib/conditionals/character/1200/Huohuo'
import imbibitorlunae from 'lib/conditionals/character/1200/ImbibitorLunae'
import jiaoqiu from 'lib/conditionals/character/1200/Jiaoqiu'
import jingliu from 'lib/conditionals/character/1200/Jingliu'
import jingyuan from 'lib/conditionals/character/1200/JingYuan'
import lingsha from 'lib/conditionals/character/1200/Lingsha'
import luocha from 'lib/conditionals/character/1200/Luocha'
import march7thImaginary from 'lib/conditionals/character/1200/March7thImaginary'
import moze from 'lib/conditionals/character/1200/Moze'
import qingque from 'lib/conditionals/character/1200/Qingque'
import sushang from 'lib/conditionals/character/1200/Sushang'
import tingyun from 'lib/conditionals/character/1200/Tingyun'
import xueyi from 'lib/conditionals/character/1200/Xueyi'
import yanqing from 'lib/conditionals/character/1200/Yanqing'
import yukong from 'lib/conditionals/character/1200/Yukong'
import yunli from 'lib/conditionals/character/1200/Yunli'
import acheron from 'lib/conditionals/character/1300/Acheron'
import argenti from 'lib/conditionals/character/1300/Argenti'
import aventurine from 'lib/conditionals/character/1300/Aventurine'
import blackswan from 'lib/conditionals/character/1300/BlackSwan'
import boothill from 'lib/conditionals/character/1300/Boothill'
import drratio from 'lib/conditionals/character/1300/DrRatio'
import firefly from 'lib/conditionals/character/1300/Firefly'
import gallagher from 'lib/conditionals/character/1300/Gallagher'
import jade from 'lib/conditionals/character/1300/Jade'
import misha from 'lib/conditionals/character/1300/Misha'
import rappa from 'lib/conditionals/character/1300/Rappa'
import robin from 'lib/conditionals/character/1300/Robin'
import ruanmei from 'lib/conditionals/character/1300/RuanMei'
import sparkle from 'lib/conditionals/character/1300/Sparkle'
import sunday from 'lib/conditionals/character/1300/Sunday'
import aglaea from 'lib/conditionals/character/1400/Aglaea'
import theHerta from 'lib/conditionals/character/1400/TheHerta'
import trailblazerdestruction from 'lib/conditionals/character/8000/TrailblazerDestruction'
import trailblazerharmony from 'lib/conditionals/character/8000/TrailblazerHarmony'
import trailblazerpreservation from 'lib/conditionals/character/8000/TrailblazerPreservation'
import trailblazerRemembrance from 'lib/conditionals/character/8000/TrailblazerRemembrance'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'

export type CharacterConditionalFunction = (e: Eidolon, withContent: boolean) => CharacterConditionalsController

export const characterOptionMapping: Record<string, CharacterConditionalFunction> = {
  1001: march7th,
  1002: danheng,
  1003: himeko,
  1004: welt,
  1005: kafka,
  1006: silverwolf,
  1008: arlan,
  1009: asta,
  1013: herta,
  1101: bronya,
  1102: seele,
  1103: serval,
  1104: gepard,
  1105: natasha,
  1106: pela,
  1107: clara,
  1108: sampo,
  1109: hook,
  1110: lynx,
  1111: luka,
  1112: topaz,
  1201: qingque,
  1202: tingyun,
  1203: luocha,
  1204: jingyuan,
  1205: blade,
  1206: sushang,
  1207: yukong,
  1208: fuxuan,
  1209: yanqing,
  1210: guinaifen,
  1211: bailu,
  1212: jingliu,
  1213: imbibitorlunae, // Simplified stacking logic, revisit
  1214: xueyi,
  1215: hanya,
  1217: huohuo,
  1218: jiaoqiu,
  1220: feixiao,
  1221: yunli,
  1222: lingsha,
  1223: moze,
  1224: march7thImaginary,
  1225: fugue,
  1301: gallagher,
  1302: argenti,
  1303: ruanmei,
  1304: aventurine,
  1305: drratio,
  1306: sparkle,
  1307: blackswan,
  1308: acheron,
  1309: robin,
  1310: firefly,
  1312: misha,
  1313: sunday,
  1314: jade,
  1315: boothill,
  1317: rappa,
  1401: theHerta,
  1402: aglaea,
  8001: trailblazerdestruction,
  8002: trailblazerdestruction,
  8003: trailblazerpreservation,
  8004: trailblazerpreservation,
  8005: trailblazerharmony,
  8006: trailblazerharmony,
  8007: trailblazerRemembrance,
  8008: trailblazerRemembrance,
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
  get: (request: {
    characterId: string;
    characterEidolon: number
  }, withContent = false): CharacterConditionalsController => {
    const characterFn = characterOptionMapping[request.characterId]
    return characterFn(request.characterEidolon, withContent)
  },
}
