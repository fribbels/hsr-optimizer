import stringSimilarity from 'string-similarity'
import { Constants, Parts, Sets } from './constants.ts'
import { RelicAugmenter } from './relicAugmenter'

import characters from '../data/characters.json'
import lightCones from '../data/light_cones.json'
import DB from './db'
import { Utils } from './utils'
import { Message } from './message'

let substatMapping
let mainstatMapping
let partMapping
let affixMapping
let metadata

const formTemplate = {
  characterId: '1204',
  characterLevel: 80,
  characterEidolon: 0,
  lightCone: '23010',
  lightConeLevel: 80,
  lightConeSuperimposition: 1,
}

function getTrailblazerId(name, metadata) {
  let id = '8002'
  if (name == 'TrailblazerDestruction') {
    id = metadata.trailblazer == 'Stelle' ? '8002' : '8001'
  }
  if (name == 'TrailblazerPreservation') {
    id = metadata.trailblazer == 'Stelle' ? '8004' : '8003'
  }
  return id
}

export const OcrParserKelz3 = {
  parse: (json, metadata) => {
    OcrParserKelz3.initialize()
    let relics = json.relics

    let parsedRelics = []
    for (let relic of relics) {
      let result = readRelic(relic, metadata)
      let output = RelicAugmenter.augment(result)

      // Temporarily skip broken imports
      if (output) {
        parsedRelics.push(result)
      }
      // console.log(result);
    }

    return parsedRelics
  },

  parseCharacters: (json, metadata) => {
    OcrParserKelz3.initialize()
    let characters = json.characters
    if (!characters) {
      return []
    }

    let parsedCharacters = []
    for (let character of characters) {
      let lightCone = undefined
      if (json.light_cones) {
        // Find their light cone
        lightCone = json.light_cones.find((x) => x.location == character.key)
      }

      try {
        let result = readCharacter(character, lightCone, metadata)
        parsedCharacters.push(result)
      } catch (e) {
        Message.warning(`Error reading a character [${character?.key}], try running the scanner again with a dark background to improve scan accuracy`, 10)
      }
    }

    return parsedCharacters
  },

  parseMetadata: (json) => {
    if (!json.metadata) json.metadata = {}

    return {
      trailblazer: json.metadata.trailblazer || 'Stelle',
    }
  },

  initialize: () => {
    if (!substatMapping) {
      metadata = DB.getMetadata().relics
      substatMapping = {
        'ATK': Constants.Stats.ATK,
        'HP': Constants.Stats.HP,
        'DEF': Constants.Stats.DEF,
        'ATK_': Constants.Stats.ATK_P,
        'HP_': Constants.Stats.HP_P,
        'DEF_': Constants.Stats.DEF_P,
        'SPD': Constants.Stats.SPD,
        'CRIT Rate_': Constants.Stats.CR,
        'CRIT DMG_': Constants.Stats.CD,
        'Effect Hit Rate_': Constants.Stats.EHR,
        'Effect RES_': Constants.Stats.RES,
        'Break Effect_': Constants.Stats.BE,
      }

      mainstatMapping = {
        'ATK': Constants.Stats.ATK_P,
        'HP': Constants.Stats.HP_P,
        'DEF': Constants.Stats.DEF_P,
        'SPD': Constants.Stats.SPD,
        'CRIT Rate': Constants.Stats.CR,
        'CRIT DMG': Constants.Stats.CD,
        'Effect Hit Rate': Constants.Stats.EHR,
        'Break Effect': Constants.Stats.BE,
        'Energy Regeneration Rate': Constants.Stats.ERR,
        'Outgoing Healing Boost': Constants.Stats.OHB,
        'Physical DMG Boost': Constants.Stats.Physical_DMG,
        'Fire DMG Boost': Constants.Stats.Fire_DMG,
        'Ice DMG Boost': Constants.Stats.Ice_DMG,
        'Lightning DMG Boost': Constants.Stats.Lightning_DMG,
        'Wind DMG Boost': Constants.Stats.Wind_DMG,
        'Quantum DMG Boost': Constants.Stats.Quantum_DMG,
        'Imaginary DMG Boost': Constants.Stats.Imaginary_DMG,
      }

      partMapping = {
        [Constants.Parts.Head]: 1,
        [Constants.Parts.Hands]: 2,
        [Constants.Parts.Body]: 3,
        [Constants.Parts.Feet]: 4,
        [Constants.Parts.PlanarSphere]: 5,
        [Constants.Parts.LinkRope]: 6,
      }

      affixMapping = {
        [Constants.Stats.HP_P]: 'HPAddedRatio',
        [Constants.Stats.ATK_P]: 'AttackAddedRatio',
        [Constants.Stats.DEF_P]: 'DefenceAddedRatio',
        [Constants.Stats.HP]: 'HPDelta',
        [Constants.Stats.ATK]: 'AttackDelta',
        [Constants.Stats.DEF]: 'DefenceDelta',
        [Constants.Stats.SPD]: 'SpeedDelta',
        [Constants.Stats.CD]: 'CriticalDamageBase',
        [Constants.Stats.CR]: 'CriticalChanceBase',
        [Constants.Stats.EHR]: 'StatusProbabilityBase',
        [Constants.Stats.RES]: 'StatusResistanceBase',
        [Constants.Stats.BE]: 'BreakDamageAddedRatioBase',
        [Constants.Stats.ERR]: 'SPRatioBase',
        [Constants.Stats.OHB]: 'HealRatioBase',
        [Constants.Stats.Physical_DMG]: 'PhysicalAddedRatio',
        [Constants.Stats.Fire_DMG]: 'FireAddedRatio',
        [Constants.Stats.Ice_DMG]: 'IceAddedRatio',
        [Constants.Stats.Lightning_DMG]: 'ThunderAddedRatio',
        [Constants.Stats.Wind_DMG]: 'WindAddedRatio',
        [Constants.Stats.Quantum_DMG]: 'QuantumAddedRatio',
        [Constants.Stats.Imaginary_DMG]: 'ImaginaryAddedRatio',
      }
    }
  },
}

const characterList = Object.values(characters)
const lightConeList = Object.values(lightCones)

function readCharacter(character, lightCone, metadata) {
  const newCharacter = { ...formTemplate }
  lightCone = lightCone || undefined

  // Lookup character & light cone ids
  let characterId

  if (character.key.startsWith('Trailblazer')) {
    characterId = getTrailblazerId(character.key, metadata)
  } else {
    characterId = characterList.find((x) => x.name == character.key).id
  }

  let lcKey = lightCone?.key
  const lightConeId = lightConeList.find((x) => x.name == lcKey)?.id

  // Set information
  newCharacter.characterId = characterId
  newCharacter.characterLevel = character.level || 80
  newCharacter.characterEidolon = character.eidolon || 0
  newCharacter.lightCone = lightConeId
  newCharacter.lightConeLevel = lightCone?.level || 80
  newCharacter.lightConeSuperimposition = lightCone?.superimposition || 1

  return newCharacter
}

function readRelic(relic) {
  let partMatches = stringSimilarity.findBestMatch(relic.slot, Object.values(Parts))
  // console.log('partMatches', partMatches);
  let part = partMatches.bestMatch.target

  let setMatches = stringSimilarity.findBestMatch(lowerAlphaNumeric(relic.set), relicSetList.map((x) => x[1]))
  let set = relicSetList[setMatches.bestMatchIndex][2]

  let enhance = Math.min(Math.max(parseInt(relic.level), 0), 15)
  let grade = Math.min(Math.max(parseInt(relic.rarity), 2), 5)

  let parsedStats = readStats(relic, part, grade, enhance)

  let id
  if (characterList.find((x) => x.name == relic.location)) {
    id = characterList.find((x) => x.name == relic.location).id
  } else {
    if (relic.location.startsWith('Trailblazer')) {
      id = getTrailblazerId(relic.location, metadata)
    }
  }

  return {
    part: part,
    set: set,
    enhance: enhance,
    grade: grade,
    main: parsedStats.main,
    substats: parsedStats.substats,
    equippedBy: relic.location === '' ? undefined : id,
  }
}

function readStats(relic, part, grade, enhance) {
  let rawSubstats = relic.substats
  let parsedSubstats = []

  for (let substat of rawSubstats) {
    let mappedStat = substatMapping[substat.key]
    let value = substat.value

    parsedSubstats.push({
      stat: mappedStat,
      value: value,
    })
  }

  let rawMainstat = relic.mainstat
  let parsedMainStat
  let main

  // console.log(relic, parsedSubstats, rawMainstat);

  if (part == 'Hands') {
    parsedMainStat = Constants.Stats.ATK
  } else if (part == 'Head') {
    parsedMainStat = Constants.Stats.HP
  } else {
    parsedMainStat = mainstatMapping[rawMainstat]
  }

  let partId = partMapping[part]
  let mainId = affixMapping[parsedMainStat]
  let query = `${grade}${partId}`
  let affixMetadata = metadata.relicMainAffixes[query]
  let mainData = Object.values(affixMetadata.affixes).find((x) => x.property == mainId)
  let mainBase = mainData.base
  let mainStep = mainData.step
  let mainValue = mainBase + mainStep * enhance
  main = {
    stat: parsedMainStat,
    value: Utils.truncate10000ths(mainValue * (Utils.isFlat(parsedMainStat) ? 1 : 100)),
  }

  return {
    main,
    substats: parsedSubstats,
  }
}

let relicSetList = Object.entries(Sets)
for (let set of relicSetList) {
  set[2] = set[1]
  set[1] = lowerAlphaNumeric(set[1])
}

function lowerAlphaNumeric(str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
}
