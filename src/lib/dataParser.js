import characters from '../data/characters.json';
import characterPromotions from '../data/character_promotions.json';
import lightCones from '../data/light_cones.json';
import lightConeRanks from '../data/light_cone_ranks.json';
import lightConePromotions from '../data/light_cone_promotions.json';
import nicknames from '../data/nickname.json';
import { SaveState } from './saveState';

export const DataParser = {
  parse: () => {
    for (let entry of Object.entries(characters)) {
      let id = entry[0]
      let characterData = entry[1]
      let promotions = characterPromotions[id]

      characterData.promotions = parseBaseStatsByLevel(promotions)

      delete characterData.ranks
      delete characterData.skills
      delete characterData.skill_trees
    }

    let lightConeSuperimpositions = getSuperimpositions()
    for (let entry of Object.entries(lightCones)) {
      let id = entry[0]
      let lcData = entry[1]
      let promotions = lightConePromotions[id]

      if (lightConeSuperimpositions[id]) {
        lcData.superimpositions = lightConeSuperimpositions[id]
      } else {
        lcData.superimpositions = {}
      }
      lcData.promotions = parseBaseLightConeStatsByLevel(promotions)
    }

    let characterTraces = getOverrideTraces();
    for (let entry of Object.entries(characterTraces)) {
      let id = entry[0]
      let traceData = entry[1]

      characters[id].traces = traceData
      characters[id].displayName = getDisplayName(characters[id])
    }

    let data = {
      characters: characters,
      characterPromotions: characterPromotions,
      nicknames: characterPromotions,
      lightCones: lightCones
    }
    DB.setMetadata(data);

    return data;
  }
}

let displayNameMapping = {
  "8001": "Caelus (Physical)",
  "8002": "Stelle (Physical)",
  "8003": "Caelus (Fire)",
  "8004": "Stelle (Fire)",
  "1213": "Imbibitor Lunae"
}
function getDisplayName(character) {
  if (character.id in displayNameMapping) {
    return displayNameMapping[character.id]
  }
  return character.name
}

function parseBaseLightConeStatsByLevel(promotions) {
  let base = {}
  for (let i = 1; i <= 80; i++) {
    let valueIndex = (Math.floor((i-1) / 10) - 1)
    if (i <= 20) valueIndex = 0
    if (i > 79) valueIndex = 6

    let statScaling = promotions.values[valueIndex]

    base[i] = {
      [Constants.Stats.HP]: statScaling['hp'].base + statScaling['hp'].step * (i - 1),
      [Constants.Stats.ATK]: statScaling['atk'].base + statScaling['atk'].step * (i - 1),
      [Constants.Stats.DEF]: statScaling['def'].base + statScaling['def'].step * (i - 1),
    }
  }

  return base;
}

function parseBaseStatsByLevel(promotions) {
  let base = {}
  for (let i = 1; i <= 80; i++) {
    let valueIndex = (Math.floor((i-1) / 10) - 1)
    if (i <= 20) valueIndex = 0
    if (i > 79) valueIndex = 6

    let statScaling = promotions.values[valueIndex]

    base[i] = {
      [Constants.Stats.HP]: statScaling['hp'].base + statScaling['hp'].step * (i - 1),
      [Constants.Stats.ATK]: statScaling['atk'].base + statScaling['atk'].step * (i - 1),
      [Constants.Stats.CR]: statScaling['crit_rate'].base + statScaling['crit_rate'].step * (i - 1),
      [Constants.Stats.CD]: statScaling['crit_dmg'].base + statScaling['crit_dmg'].step * (i - 1),
      [Constants.Stats.DEF]: statScaling['def'].base + statScaling['def'].step * (i - 1),
      [Constants.Stats.SPD]: statScaling['spd'].base + statScaling['spd'].step * (i - 1),
    }
  }

  return base;
}

function getSuperimpositions() {
  return {
    "20000": {},
    "20001": {},
    "20002": {},
    "20003": {
      1: {[Constants.Stats.DEF_P]: 0.16},
      2: {[Constants.Stats.DEF_P]: 0.20},
      3: {[Constants.Stats.DEF_P]: 0.24},
      4: {[Constants.Stats.DEF_P]: 0.28},
      5: {[Constants.Stats.DEF_P]: 0.32},
    },
    "20004": {},
    "20005": {},
    "20006": {},
    "20007": {},
    "20008": {},
    "20009": {},
    "20010": {},
    "20011": {},
    "20012": {},
    "20013": {},
    "20014": {},
    "20015": {},
    "20016": {},
    "20017": {},
    "20018": {},
    "20019": {},
    "20020": {},
    "21000": {},
    "21001": {},
    "21002": {
      1: {[Constants.Stats.DEF_P]: 0.16},
      2: {[Constants.Stats.DEF_P]: 0.18},
      3: {[Constants.Stats.DEF_P]: 0.20},
      4: {[Constants.Stats.DEF_P]: 0.22},
      5: {[Constants.Stats.DEF_P]: 0.24},
    },
    "21003": {
      1: {[Constants.Stats.ATK_P]: 0.16},
      2: {[Constants.Stats.ATK_P]: 0.20},
      3: {[Constants.Stats.ATK_P]: 0.24},
      4: {[Constants.Stats.ATK_P]: 0.28},
      5: {[Constants.Stats.ATK_P]: 0.32},
    },
    "21004": {
      1: {[Constants.Stats.BE]: 0.28},
      2: {[Constants.Stats.BE]: 0.35},
      3: {[Constants.Stats.BE]: 0.42},
      4: {[Constants.Stats.BE]: 0.49},
      5: {[Constants.Stats.BE]: 0.56},
    },
    "21005": {},
    "21006": {},
    "21007": {},
    "21008": {
      1: {[Constants.Stats.EHR]: 0.20},
      2: {[Constants.Stats.EHR]: 0.25},
      3: {[Constants.Stats.EHR]: 0.30},
      4: {[Constants.Stats.EHR]: 0.35},
      5: {[Constants.Stats.EHR]: 0.40},
    },
    "21009": {},
    "21010": {},
    "21011": {},
    "21012": {},
    "21013": {},
    "21014": {
      1: {[Constants.Stats.RES]: 0.16},
      2: {[Constants.Stats.RES]: 0.20},
      3: {[Constants.Stats.RES]: 0.24},
      4: {[Constants.Stats.RES]: 0.28},
      5: {[Constants.Stats.RES]: 0.32},
    },
    "21015": {},
    "21016": {
      1: {[Constants.Stats.DEF_P]: 0.16},
      2: {[Constants.Stats.DEF_P]: 0.20},
      3: {[Constants.Stats.DEF_P]: 0.24},
      4: {[Constants.Stats.DEF_P]: 0.28},
      5: {[Constants.Stats.DEF_P]: 0.32},
    },
    "21017": {},
    "21018": {},
    "21019": {
      1: {[Constants.Stats.ATK_P]: 0.16},
      2: {[Constants.Stats.ATK_P]: 0.20},
      3: {[Constants.Stats.ATK_P]: 0.24},
      4: {[Constants.Stats.ATK_P]: 0.28},
      5: {[Constants.Stats.ATK_P]: 0.32},
    },
    "21020": {
      1: {[Constants.Stats.ATK_P]: 0.16},
      2: {[Constants.Stats.ATK_P]: 0.20},
      3: {[Constants.Stats.ATK_P]: 0.24},
      4: {[Constants.Stats.ATK_P]: 0.28},
      5: {[Constants.Stats.ATK_P]: 0.32},
    },
    "21021": {},
    "21022": {
      1: {[Constants.Stats.BE]: 0.16},
      2: {[Constants.Stats.BE]: 0.20},
      3: {[Constants.Stats.BE]: 0.24},
      4: {[Constants.Stats.BE]: 0.28},
      5: {[Constants.Stats.BE]: 0.32},
    },
    "21023": {},
    "21024": {},
    "21025": {},
    "21026": {
      1: {[Constants.Stats.ATK_P]: 0.10},
      2: {[Constants.Stats.ATK_P]: 0.125},
      3: {[Constants.Stats.ATK_P]: 0.15},
      4: {[Constants.Stats.ATK_P]: 0.175},
      5: {[Constants.Stats.ATK_P]: 0.20},
    },
    "21027": {},
    "21028": {
      1: {[Constants.Stats.HP_P]: 0.16},
      2: {[Constants.Stats.HP_P]: 0.20},
      3: {[Constants.Stats.HP_P]: 0.24},
      4: {[Constants.Stats.HP_P]: 0.28},
      5: {[Constants.Stats.HP_P]: 0.32},
    },
    "21029": {},
    "21030": {
      1: {[Constants.Stats.DEF_P]: 0.16},
      2: {[Constants.Stats.DEF_P]: 0.20},
      3: {[Constants.Stats.DEF_P]: 0.24},
      4: {[Constants.Stats.DEF_P]: 0.28},
      5: {[Constants.Stats.DEF_P]: 0.32},
    },
    "21031": {
      1: {[Constants.Stats.CR]: 0.12},
      2: {[Constants.Stats.CR]: 0.15},
      3: {[Constants.Stats.CR]: 0.18},
      4: {[Constants.Stats.CR]: 0.21},
      5: {[Constants.Stats.CR]: 0.24},
    },
    "21032": {},
    "21033": {
      1: {[Constants.Stats.ATK_P]: 0.24},
      2: {[Constants.Stats.ATK_P]: 0.30},
      3: {[Constants.Stats.ATK_P]: 0.36},
      4: {[Constants.Stats.ATK_P]: 0.42},
      5: {[Constants.Stats.ATK_P]: 0.48},
    },
    "21034": {},
    "22000": {
      1: {[Constants.Stats.BE]: 0.20},
      2: {[Constants.Stats.BE]: 0.25},
      3: {[Constants.Stats.BE]: 0.30},
      4: {[Constants.Stats.BE]: 0.35},
      5: {[Constants.Stats.BE]: 0.40},
    },
    "23000": {},
    "23001": {
      1: {[Constants.Stats.CR]: 0.18},
      2: {[Constants.Stats.CR]: 0.21},
      3: {[Constants.Stats.CR]: 0.24},
      4: {[Constants.Stats.CR]: 0.27},
      5: {[Constants.Stats.CR]: 0.30},
    },
    "23002": {
      1: {[Constants.Stats.ATK_P]: 0.24},
      2: {[Constants.Stats.ATK_P]: 0.28},
      3: {[Constants.Stats.ATK_P]: 0.32},
      4: {[Constants.Stats.ATK_P]: 0.36},
      5: {[Constants.Stats.ATK_P]: 0.40},
    },
    "23003": {},
    "23004": {},
    "23005": {
      1: {[Constants.Stats.DEF_P]: 0.24},
      2: {[Constants.Stats.DEF_P]: 0.28},
      3: {[Constants.Stats.DEF_P]: 0.32},
      4: {[Constants.Stats.DEF_P]: 0.36},
      5: {[Constants.Stats.DEF_P]: 0.40},
    },
    "23006": {},
    "23007": {
      1: {[Constants.Stats.EHR]: 0.20},
      2: {[Constants.Stats.EHR]: 0.25},
      3: {[Constants.Stats.EHR]: 0.30},
      4: {[Constants.Stats.EHR]: 0.35},
      5: {[Constants.Stats.EHR]: 0.40},
    },
    "23008": {
      1: {[Constants.Stats.ATK_P]: 0.24},
      2: {[Constants.Stats.ATK_P]: 0.28},
      3: {[Constants.Stats.ATK_P]: 0.32},
      4: {[Constants.Stats.ATK_P]: 0.36},
      5: {[Constants.Stats.ATK_P]: 0.40},
    },
    "23009": {
      1: {[Constants.Stats.CR]: 0.18},
      2: {[Constants.Stats.CR]: 0.21},
      3: {[Constants.Stats.CR]: 0.24},
      4: {[Constants.Stats.CR]: 0.27},
      5: {[Constants.Stats.CR]: 0.30},
    },
    "23010": {
      1: {[Constants.Stats.CD]: 0.36},
      2: {[Constants.Stats.CD]: 0.42},
      3: {[Constants.Stats.CD]: 0.48},
      4: {[Constants.Stats.CD]: 0.54},
      5: {[Constants.Stats.CD]: 0.60},
    },
    "23011": {
      1: {[Constants.Stats.HP_P]: 0.24},
      2: {[Constants.Stats.HP_P]: 0.28},
      3: {[Constants.Stats.HP_P]: 0.32},
      4: {[Constants.Stats.HP_P]: 0.36},
      5: {[Constants.Stats.HP_P]: 0.40},
    },
    "23012": {
      1: {[Constants.Stats.CD]: 0.30},
      2: {[Constants.Stats.CD]: 0.35},
      3: {[Constants.Stats.CD]: 0.40},
      4: {[Constants.Stats.CD]: 0.45},
      5: {[Constants.Stats.CD]: 0.50},
    },
    "23013": {
      1: {[Constants.Stats.HP_P]: 0.18},
      2: {[Constants.Stats.HP_P]: 0.21},
      3: {[Constants.Stats.HP_P]: 0.24},
      4: {[Constants.Stats.HP_P]: 0.27},
      5: {[Constants.Stats.HP_P]: 0.30},
    },
    "23014": {
      1: {[Constants.Stats.CD]: 0.2},
      2: {[Constants.Stats.CD]: 0.23},
      3: {[Constants.Stats.CD]: 0.26},
      4: {[Constants.Stats.CD]: 0.29},
      5: {[Constants.Stats.CD]: 0.32},
    },
    "23015": {
      1: {[Constants.Stats.CR]: 0.18},
      2: {[Constants.Stats.CR]: 0.21},
      3: {[Constants.Stats.CR]: 0.24},
      4: {[Constants.Stats.CR]: 0.27},
      5: {[Constants.Stats.CR]: 0.30},
    },
    "23016": {
      1: {[Constants.Stats.CR]: 0.18},
      2: {[Constants.Stats.CR]: 0.21},
      3: {[Constants.Stats.CR]: 0.24},
      4: {[Constants.Stats.CR]: 0.27},
      5: {[Constants.Stats.CR]: 0.30},
    },
    "24000": {},
    "24001": {
      1: {[Constants.Stats.CR]: 0.08},
      2: {[Constants.Stats.CR]: 0.10},
      3: {[Constants.Stats.CR]: 0.12},
      4: {[Constants.Stats.CR]: 0.14},
      5: {[Constants.Stats.CR]: 0.16},
    },
    "24002": {
      1: {[Constants.Stats.RES]: 0.08},
      2: {[Constants.Stats.RES]: 0.10},
      3: {[Constants.Stats.RES]: 0.12},
      4: {[Constants.Stats.RES]: 0.14},
      5: {[Constants.Stats.RES]: 0.16},
    },
    "24003": {
      1: {[Constants.Stats.BE]: 0.20},
      2: {[Constants.Stats.BE]: 0.25},
      3: {[Constants.Stats.BE]: 0.30},
      4: {[Constants.Stats.BE]: 0.35},
      5: {[Constants.Stats.BE]: 0.40},
    },
  }
}

function getOverrideTraces() {
  return {
    "1001": { // March 7th
      [Constants.Stats.Ice_DMG]: 0.224,  
      [Constants.Stats.DEF_P]: 0.225,  
      [Constants.Stats.RES]: 0.067,
    },
    "1002": { // Dan Heng
      [Constants.Stats.Wind_DMG]: 0.224,  
      [Constants.Stats.ATK_P]: 0.18,  
      [Constants.Stats.DEF_P]: 0.125,
    },
    "1003": { // Himeko
      [Constants.Stats.Fire_DMG]: 0.224,  
      [Constants.Stats.ATK_P]: 0.18,  
      [Constants.Stats.RES]: 0.067,
    },
    "1004": { // Welt
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.Imaginary_DMG]: 0.144,  
      [Constants.Stats.RES]: 0.067,
    },
    "1005": { // Kafka
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.EHR]: 0.18,  
      [Constants.Stats.HP_P]: 0.1,
    },
    "1006": { // Silver Wolf
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.EHR]: 0.18,  
      [Constants.Stats.Quantum_DMG]: 0.08,
    },
    "1008": { // Arlan
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.RES]: 0.12,
      [Constants.Stats.HP_P]: 0.1,
    },
    "1009": { // Asta
      [Constants.Stats.Fire_DMG]: 0.224,  
      [Constants.Stats.DEF_P]: 0.225,  
      [Constants.Stats.CR]: 0.067,
    },
    "1013": { // Herta
      [Constants.Stats.Ice_DMG]: 0.224,  
      [Constants.Stats.DEF_P]: 0.225,  
      [Constants.Stats.CR]: 0.067,
    },
    "1101": { // Bronya
      [Constants.Stats.Wind_DMG]: 0.224,  
      [Constants.Stats.CD]: 0.225,  
      [Constants.Stats.RES]: 0.067,
    },
    "1102": { // Seele
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.CD]: 0.225,  
      [Constants.Stats.DEF_P]: 0.125,
    },
    "1103": { // Serval
      [Constants.Stats.CR]: 0.187,  
      [Constants.Stats.EHR]: 0.18,  
      [Constants.Stats.RES]: 0.067,
    },
    "1104": { // Gepard
      [Constants.Stats.Ice_DMG]: 0.224,  
      [Constants.Stats.RES]: 0.12,  
      [Constants.Stats.DEF_P]: 0.125,
    },
    "1105": { // Natasha
      [Constants.Stats.HP_P]: 0.28,  
      [Constants.Stats.DEF_P]: 0.125,  
      [Constants.Stats.RES]: 0.12,
    },
    "1106": { // Pela
      [Constants.Stats.Ice_DMG]: 0.224,  
      [Constants.Stats.ATK_P]: 0.18,  
      [Constants.Stats.EHR]: 0.1,
    },
    "1107": { // Clara
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.Physical_DMG]: 0.144,  
      [Constants.Stats.HP_P]: 0.1,
    },
    "1108": { // Sampo
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.EHR]: 0.18,  
      [Constants.Stats.RES]: 0.067,
    },
    "1109": { // Hook
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.HP_P]: 0.18,  
      [Constants.Stats.CD]: 0.125,
    },
    "1110": { // Lynx
      [Constants.Stats.HP_P]: 0.28,  
      [Constants.Stats.DEF_P]: 0.225,  
      [Constants.Stats.RES]: 0.1,
    },
    "1111": { // Luka
      [Constants.Stats.ATK_P]: 0.28,   
      [Constants.Stats.EHR]: 0.18,  
      [Constants.Stats.DEF_P]: 0.125,
    },
    "1112": { // Topaz and Numby
      [Constants.Stats.Fire_DMG]: 0.224,  
      [Constants.Stats.CR]: 0.12,  
      [Constants.Stats.HP_P]: 0.1,
    },
    "1201": { // Qingque
      [Constants.Stats.ATK_P]: 0.28,   
      [Constants.Stats.Quantum_DMG]: 0.144,  
      [Constants.Stats.DEF_P]: 0.125,
    },
    "1202": { // Tingyun
      [Constants.Stats.ATK_P]: 0.28,   
      [Constants.Stats.DEF_P]: 0.225,  
      [Constants.Stats.Lightning_DMG]: 0.08,
    },
    "1203": { // Luocha
      [Constants.Stats.ATK_P]: 0.3,  
      [Constants.Stats.HP_P]: 0.18,  
      [Constants.Stats.DEF_P]: 0.125,
    },
    "1204": { // Jing Yuan
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.DEF_P]: 0.125,  
      [Constants.Stats.CR]: 0.12,
    },
    "1205": { // Blade
      [Constants.Stats.HP_P]: 0.28,  
      [Constants.Stats.CR]: 0.12,
      [Constants.Stats.RES]: 0.1,
    },
    "1206": { // Sushang
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.HP_P]: 0.18,  
      [Constants.Stats.DEF_P]: 0.125,
    },
    "1207": { // Yukong
      [Constants.Stats.Imaginary_DMG]: 0.224,  
      [Constants.Stats.HP_P]: 0.18,  
      [Constants.Stats.ATK_P]: 0.1,
    },
    "1208": { // Fu Xuan
      [Constants.Stats.CR]: 0.187,  
      [Constants.Stats.HP_P]: 0.18,  
      [Constants.Stats.RES]: 0.1,
    },
    "1209": { // Yanqing
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.Ice_DMG]: 0.144,  
      [Constants.Stats.HP_P]: 0.1,
    },
    "1210": { // Guinaifen
      [Constants.Stats.Fire_DMG]: 0.224,  
      [Constants.Stats.EHR]: 0.1,  
      [Constants.Stats.BE]: 0.24,
    },
    "1211": { // Bailu
      [Constants.Stats.HP_P]: 0.28,  
      [Constants.Stats.DEF_P]: 0.225,  
      [Constants.Stats.RES]: 0.067,
    },
    "1212": { // Jingliu
      [Constants.Stats.HP_P]: 0.10,  
      [Constants.Stats.SPD]: 9,  
      [Constants.Stats.CD]: 0.373,
    },
    "1213": { // Dan Heng • Imbibitor Lunae
      [Constants.Stats.Imaginary_DMG]: 0.224,  
      [Constants.Stats.CR]: 0.12,  
      [Constants.Stats.HP_P]: 0.1,
    },
    "8001": { // Physical Trailblazer
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.HP_P]: 0.18,  
      [Constants.Stats.DEF_P]: 0.125,
    },
    "8002": { // Physical Trailblazer
      [Constants.Stats.ATK_P]: 0.28,  
      [Constants.Stats.HP_P]: 0.18,  
      [Constants.Stats.DEF_P]: 0.125,
    },
    "8003": { // Fire Trailblazer
      [Constants.Stats.DEF_P]: 0.35,  
      [Constants.Stats.ATK_P]: 0.18,  
      [Constants.Stats.HP_P]: 0.1,
    },
    "8004": { // Fire Trailblazer
      [Constants.Stats.DEF_P]: 0.35,  
      [Constants.Stats.ATK_P]: 0.18,  
      [Constants.Stats.HP_P]: 0.1,
    },
  }
}