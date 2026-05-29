import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

export const SignatureLightConeByCharacterId: Partial<Record<CharacterId, LightConeId>> = {
  '1003': '23000', // Himeko - Night on the Milky Way
  '1004': '23004', // Welt - In the Name of the World
  '1005': '23006', // Kafka - Patience Is All You Need
  '1006': '23007', // Silver Wolf - Incessant Rain
  '1014': '23045', // Saber - A Thankless Coronation
  '1015': '23046', // Archer - The Hell Where Ideals Burn
  '1101': '23003', // Bronya - But the Battle Isn't Over
  '1102': '23001', // Seele - In the Night
  '1104': '23005', // Gepard - Moment of Victory
  '1107': '23002', // Clara - Something Irreplaceable
  '1112': '23016', // Topaz & Numby - Worrisome, Blissful
  '1203': '23008', // Luocha - Echoes of the Coffin
  '1204': '23010', // Jing Yuan - Before Dawn
  '1205': '23009', // Blade - The Unreachable Side
  '1208': '23011', // Fu Xuan - She Already Shut Her Eyes
  '1209': '23012', // Yanqing - Sleep Like the Dead
  '1211': '23013', // Bailu - Time Waits for No One
  '1212': '23014', // Jingliu - I Shall Be My Own Sword
  '1213': '23015', // Dan Heng • Imbibitor Lunae - Brighter Than the Sun
  '1217': '23017', // Huohuo - Night of Fright
  '1218': '23029', // Jiaoqiu - Those Many Springs
  '1220': '23031', // Feixiao - I Venture Forth to Hunt
  '1221': '23030', // Yunli - Dance at Sunset
  '1222': '23032', // Lingsha - Scent Alone Stays True
  '1225': '23035', // Fugue - Long Road Leads Home
  '1302': '23018', // Argenti - An Instant Before A Gaze
  '1303': '23019', // Ruan Mei - Past Self in Mirror
  '1304': '23023', // Aventurine - Inherently Unjust Destiny
  '1305': '23020', // Dr. Ratio - Baptism of Pure Thought
  '1306': '23021', // Sparkle - Earthly Escapade
  '1307': '23022', // Black Swan - Reforged Remembrance
  '1308': '23024', // Acheron - Along the Passing Shore
  '1309': '23026', // Robin - Flowing Nightglow
  '1310': '23025', // Firefly - Whereabouts Should Dreams Rest
  '1313': '23034', // Sunday - A Grounded Ascent
  '1314': '23028', // Jade - Yet Hope Is Priceless
  '1315': '23027', // Boothill - Sailing Towards a Second Life
  '1317': '23033', // Rappa - Ninjutsu Inscription: Dazzling Evilbreaker
  '1401': '23037', // The Herta - Into the Unreachable Veil
  '1402': '23036', // Aglaea - Time Woven Into Gold
  '1403': '23038', // Tribbie - If Time Were a Flower
  '1404': '23039', // Mydei - Flame of Blood, Blaze My Path
  '1405': '23041', // Anaxa - Life Should Be Cast to Flames
  '1406': '23043', // Cipher - Lies Dance on the Breeze
  '1407': '23040', // Castorice - Make Farewells More Beautiful
  '1408': '23044', // Phainon - Thus Burns the Dawn
  '1409': '23042', // Hyacine - Long May Rainbows Adorn the Sky
  '1410': '23047', // Hysilens - Why Does the Ocean Sing
  '1412': '23048', // Cerydra - Epoch Etched in Golden Blood
  '1413': '23049', // Evernight - To Evernight's Stars
  '1414': '23051', // Dan Heng • Permansor Terrae - Though Worlds Apart
  '1415': '23052', // Cyrene - This Love, Forever
  '1501': '23053', // Sparxie - Dazzled by a Flowery World
  '1502': '23054', // Yao Guang - When She Decided to See
  '1504': '23056', // Ashveil - The Finale of a Lie
  '1505': '23058', // Evanescia - Until the Flowers Bloom Again
  '1506': '23057', // Silver Wolf LV.999 - Welcome to the Cosmic City
  '1507': '23059', // Mortenax Blade - Reforged in Hellfire
}

export function getSignatureLightConeId(characterId: CharacterId | null | undefined): LightConeId | null {
  if (!characterId) return null

  const baseCharacterId = characterId.endsWith('b1') ? characterId.slice(0, -2) as CharacterId : characterId
  return SignatureLightConeByCharacterId[characterId] ?? SignatureLightConeByCharacterId[baseCharacterId] ?? null
}
