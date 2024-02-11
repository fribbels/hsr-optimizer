import stringSimilarity from 'string-similarity'
import { Parts, Sets, Stats } from './constants.ts'
import { RelicAugmenter } from './relicAugmenter'

export const OcrParserFribbels1 = {
  parse: (json) => {
    let relics = json.relics

    let parsedRelics = []
    for (let relic of relics) {
      // console.log(relic)
      let result = readRelic(relic)
      let output = RelicAugmenter.augment(result)

      // Temporarily skip broken imports
      if (output) {
        parsedRelics.push(result)
      }
      // console.log(result);
    }

    return parsedRelics
  },
}

function readRelic(relic) {
  let partMatches = stringSimilarity.findBestMatch(relic.part, Object.values(Parts))
  // console.log('partMatches', partMatches);
  let part = partMatches.bestMatch.target

  let setMatches = stringSimilarity.findBestMatch(lowerAlphaNumeric(relic.set), relicSetList.map((x) => x[1]))
  // console.log('setMatches', setMatches, setMatches.bestMatchIndex);
  let set = relicSetList[setMatches.bestMatchIndex][2]
  // console.log('set', set);

  let enhance = Math.min(Math.max(parseInt(relic.enhance), 0), 15)
  let grade = Math.min(Math.max(parseInt(relic.grade), 2), 5)

  let parsedStats = readStats(relic)
  // console.log(parsedStats);

  return {
    part: part,
    set: set,
    enhance: enhance,
    grade: grade,
    main: parsedStats.main,
    substats: parsedStats.substats,
  }
}

function readStats(relic) {
  let stats = relic.stats
  let main
  let substats = []
  for (let stat of stats) {
    let rest = stat.substring(0, stat.lastIndexOf(' ') + 1).trim()
    let last = stat.substring(stat.lastIndexOf(' ') + 1, stat.length).trim()

    let percent = last.includes('%')
    let value = parseFloat(last)

    let statMatches = stringSimilarity.findBestMatch(lowerAlphaNumeric(rest), statList.map((x) => lowerAlphaNumericPercent(x[1])))
    let statResult = statList[statMatches.bestMatchIndex][1]

    if (statResult == Stats.ATK_P && !percent) statResult = Stats.ATK
    if (statResult == Stats.ATK && percent) statResult = Stats.ATK_P

    if (statResult == Stats.HP_P && !percent) statResult = Stats.HP
    if (statResult == Stats.HP && percent) statResult = Stats.HP_P

    if (statResult == Stats.DEF_P && !percent) statResult = Stats.DEF
    if (statResult == Stats.DEF && percent) statResult = Stats.DEF_P

    let parsedStat = {
      stat: statResult,
      value: value,
    }

    // TODO not sure if accurate anymore - check on its decimals
    if (!main) {
      main = fixMainStat(parsedStat, relic)
    } else {
      substats.push(parsedStat)
    }
  }
  return {
    main,
    substats,
  }
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

function fixMainStat(parsedStat) {
  return parsedStat
}

/*
 * TODO these don't account for 4th decimal scaling
 * function generateMainStatsByLevelAndRank() {
 *   return {
 *     [Constants.Stats.SPD]: generateFromBaseLevel([1.613,2.419,3.226,4.032], [1.000,1.000,1.100,1.400]),
 *     [Constants.Stats.HP]: generateFromBaseLevel([45.158,67.738,90.317,112.896], [15.805,23.708,31.611,39.514]),
 *     [Constants.Stats.ATK]: generateFromBaseLevel([22.579,33.869,45.158,56.448], [7.903,11.854,15.805,19.757]),
 *     [Constants.Stats.HP_P]: generateFromBaseLevel([2.765,4.147,5.530,6.912], [0.968,1.451,1.935,2.419]),
 *     [Constants.Stats.ATK_P]: generateFromBaseLevel([2.765,4.147,5.530,6.912], [0.968,1.451,1.935,2.419]),
 *     [Constants.Stats.DEF_P]: generateFromBaseLevel([3.456,5.184,6.912,8.640], [1.210,1.814,2.419,3.024]),
 *     [Constants.Stats.CR]: generateFromBaseLevel([2.074,3.110,4.147,5.184], [0.726,1.089,1.451,1.814]),
 *     [Constants.Stats.CD]: generateFromBaseLevel([4.147,6.221,8.294,10.368], [1.451,2.177,2.903,3.629]),
 *     [Constants.Stats.OHB]: generateFromBaseLevel([2.212,3.318,4.424,5.530], [0.774,1.161,1.548,1.935]),
 *     [Constants.Stats.EHR]: generateFromBaseLevel([2.765,4.147,5.530,6.912], [0.968,1.451,1.935,2.419]),
 *     [Constants.Stats.BE]: generateFromBaseLevel([4.147,6.221,8.294,10.368], [1.451,2.177,2.903,3.629]),
 *     [Constants.Stats.ERR]: generateFromBaseLevel([1.244,1.866,2.488,3.110], [0.436,0.653,0.871,1.089]),
 *     [Constants.Stats.Physical_DMG]: generateFromBaseLevel([2.488,3.732,4.977,6.221], [0.871,1.306,1.742,2.177]),
 *     [Constants.Stats.Fire_DMG]: generateFromBaseLevel([2.488,3.732,4.977,6.221], [0.871,1.306,1.742,2.177]),
 *     [Constants.Stats.Ice_DMG]: generateFromBaseLevel([2.488,3.732,4.977,6.221], [0.871,1.306,1.742,2.177]),
 *     [Constants.Stats.Lightning_DMG]: generateFromBaseLevel([2.488,3.732,4.977,6.221], [0.871,1.306,1.742,2.177]),
 *     [Constants.Stats.Wind_DMG]: generateFromBaseLevel([2.488,3.732,4.977,6.221], [0.871,1.306,1.742,2.177]),
 *     [Constants.Stats.Quantum_DMG]: generateFromBaseLevel([2.488,3.732,4.977,6.221], [0.871,1.306,1.742,2.177]),
 *     [Constants.Stats.Imaginary_DMG]: generateFromBaseLevel([2.488,3.732,4.977,6.221], [0.871,1.306,1.742,2.177]),
 *   }
 * }
 */

/*
 * function generateFromBaseLevel(bases, levels) {
 *   let valuesByGrade = {}
 *   for (let i = 2; i <= 5; i++) {
 *     valuesByGrade[i] = []
 *     for (let j = 0; j <= 15; j++) {
 *       valuesByGrade[i][j] = bases[i-2] + levels[i-2] * j
 *     }
 *   }
 *   return valuesByGrade
 * }
 */
