import stringSimilarity from 'string-similarity';
import { Parts, Sets, Stats } from './constants';
import { dblClick } from '@testing-library/user-event/dist/click';
import { RelicAugmenter } from './relicAugmenter';

let substatMapping;
let mainstatMapping;
let partMapping;
let gradeMapping;
let affixMapping;
let metadata

export const OcrParserKelz3 = {
  parse: (json) => {
    OcrParserKelz3.initialize()
    let version = json.version;
    // console.log(stringSimilarity.compareTwoStrings(version, '0.2'))
    let relics = json.relics;

    let parsedRelics = []
    for (let relic of relics) {
      let result = readRelic(relic);
      let output = RelicAugmenter.augment(result)

      // Temporarily skip broken imports
      if (output) {
        parsedRelics.push(result);
      }
      // console.log(result);
    }

    return parsedRelics
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

      gradeMapping = {
        5: 6,
        4: 5,
        3: 4,
        2: 3
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
  }
}

function readRelic(relic) {
  let partMatches = stringSimilarity.findBestMatch(relic.slot, Object.values(Parts));
  // console.log('partMatches', partMatches);
  let part = partMatches.bestMatch.target

  let setMatches = stringSimilarity.findBestMatch(lowerAlphaNumeric(relic.set), relicSetList.map(x => x[1]))
  // console.log('setMatches', setMatches, setMatches.bestMatchIndex);
  let set = relicSetList[setMatches.bestMatchIndex][2];
  // console.log('set', set);

  let enhance = Math.min(Math.max(parseInt(relic.level), 0), 15);
  let grade = Math.min(Math.max(parseInt(relic.rarity), 2), 5);

  let parsedStats = readStats(relic, part, grade, enhance);
  // console.log(parsedStats);

  return {
    part: part,
    set: set,
    enhance: enhance,
    grade: grade,
    main: parsedStats.main,
    substats: parsedStats.substats
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
      value: value
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
  let mainData = Object.values(affixMetadata.affixes).find(x => x.property == mainId)
  let mainBase = mainData.base
  let mainStep = mainData.step
  let mainValue = mainBase + mainStep * enhance
  main = {
    stat: parsedMainStat,
    value: Utils.truncate10000ths(mainValue * (Utils.isFlat(parsedMainStat) ? 1 : 100))
  }

  return {
    main,
    substats: parsedSubstats
  }
}

function readStat(stat) {
  stat = stat.trim().split()
}

let relicSetList = Object.entries(Sets)
for (let set of relicSetList) {
  set[2] = set[1]
  set[1] = lowerAlphaNumeric(set[1])
}


let statList = Object.entries(Stats)

function lowerAlphaNumeric(str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
}
function lowerAlphaNumericPercent(str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9%]/g, '')
}