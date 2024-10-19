import argenti from 'lib/conditionals/character/Argenti'
import arlan from 'lib/conditionals/character/Arlan'
import asta from 'lib/conditionals/character/Asta'
import bailu from 'lib/conditionals/character/Bailu'
import blackswan from 'lib/conditionals/character/BlackSwan'
import blade from 'lib/conditionals/character/Blade'
import bronya from 'lib/conditionals/character/Bronya'
import clara from 'lib/conditionals/character/Clara'
import danheng from 'lib/conditionals/character/DanHeng'
import drratio from 'lib/conditionals/character/DrRatio'
import fuxuan from 'lib/conditionals/character/FuXuan'
import gepard from 'lib/conditionals/character/Gepard'
import guinaifen from 'lib/conditionals/character/Guinaifen'
import hanya from 'lib/conditionals/character/Hanya'
import herta from 'lib/conditionals/character/Herta'
import himeko from 'lib/conditionals/character/Himeko'
import hook from 'lib/conditionals/character/Hook'
import huohuo from 'lib/conditionals/character/Huohuo'
import imbibitorlunae from 'lib/conditionals/character/ImbibitorLunae'
import jingliu from 'lib/conditionals/character/Jingliu'
import jingyuan from 'lib/conditionals/character/JingYuan'
import kafka from 'lib/conditionals/character/Kafka'
import luka from 'lib/conditionals/character/Luka'
import luocha from 'lib/conditionals/character/Luocha'
import lynx from 'lib/conditionals/character/Lynx'
import march7th from 'lib/conditionals/character/March7th'
import misha from 'lib/conditionals/character/Misha'
import natasha from 'lib/conditionals/character/Natasha'
import pela from 'lib/conditionals/character/Pela'
import trailblazerdestruction from 'lib/conditionals/character/TrailblazerDestruction'
import trailblazerharmony from 'lib/conditionals/character/TrailblazerHarmony'
import trailblazerpreservation from 'lib/conditionals/character/TrailblazerPreservation'
import qingque from 'lib/conditionals/character/Qingque'
import ruanmei from 'lib/conditionals/character/RuanMei'
import sampo from 'lib/conditionals/character/Sampo'
import seele from 'lib/conditionals/character/Seele'
import serval from 'lib/conditionals/character/Serval'
import silverwolf from 'lib/conditionals/character/SilverWolf'
import sparkle from 'lib/conditionals/character/Sparkle'
import sushang from 'lib/conditionals/character/Sushang'
import tingyun from 'lib/conditionals/character/Tingyun'
import welt from 'lib/conditionals/character/Welt'
import xueyi from 'lib/conditionals/character/Xueyi'
import yanqing from 'lib/conditionals/character/Yanqing'
import yukong from 'lib/conditionals/character/Yukong'
import acheron from 'lib/conditionals/character/Acheron'
import aventurine from 'lib/conditionals/character/Aventurine'
import gallagher from 'lib/conditionals/character/Gallagher'
import robin from 'lib/conditionals/character/Robin'
import boothill from 'lib/conditionals/character/Boothill'
import topaz from 'lib/conditionals/character/Topaz'
import firefly from 'lib/conditionals/character/Firefly'
import jade from 'lib/conditionals/character/Jade'
import march7thImaginary from 'lib/conditionals/character/March7thImaginary'
import yunli from 'lib/conditionals/character/Yunli'
import jiaoqiu from 'lib/conditionals/character/Jiaoqiu'
import feixiao from 'lib/conditionals/character/Feixiao'
import lingsha from 'lib/conditionals/character/Lingsha'
import moze from 'lib/conditionals/character/Moze'
import rappa from 'lib/conditionals/character/Rappa'

export const characterOptionMapping = {
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
  1314: jade,
  1315: boothill,
  1317: rappa,
  8001: trailblazerdestruction,
  8002: trailblazerdestruction,
  8003: trailblazerpreservation,
  8004: trailblazerpreservation,
  8005: trailblazerharmony,
  8006: trailblazerharmony,
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
export const CharacterConditionals = {
  get: (request, withContent = false) => {
    const characterFn = characterOptionMapping[request.characterId]
    return characterFn(request.characterEidolon, withContent)
  },
}
