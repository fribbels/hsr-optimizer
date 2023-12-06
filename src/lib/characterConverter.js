import { RelicAugmenter } from "./relicAugmenter"

let statConversion
let partConversion
let gradeConversion 

export const CharacterConverter = {
  convert: (character) => {
    console.log(character)
    if (!statConversion) CharacterConverter.setConstantConversions()

    let preRelics = character.relic_list
    let preLightCone = character.equipment
    let characterLevel = character.level
    let characterEidolon = character.promotion
    let id = '' + character.avatar_id
    let lightConeId = '' + preLightCone.tid;
    let lightConeLevel = preLightCone.level;
    let lightConeSuperimposition = preLightCone.promotion

    let relics = preRelics.map(x => convertRelic(x)).filter(x => !!x)
    let equipped = {}
    for (let relic of relics) {
      relic.equippedBy = id
      equipped[relic.part] = relic
    }
    console.log(relics)

    return {
      id: id,
      form: {
        characterLevel: 80,
        characterId: id,
        characterEidolon: characterEidolon,
        lightCone: lightConeId,
        lightConeLevel: lightConeLevel,
        lightConeSuperimposition: lightConeSuperimposition,
      },
      equipped: equipped
    }
  },
  
  getConstantConversions: () => {
    if (!statConversion) CharacterConverter.setConstantConversions()
    return {
      statConversion,
      partConversion,
      gradeConversion
    }
  },

  setConstantConversions: () => {
    statConversion = {
      'HPAddedRatio': Constants.Stats.HP_P,
      'AttackAddedRatio': Constants.Stats.ATK_P,
      'DefenceAddedRatio': Constants.Stats.DEF_P,
      'HPDelta': Constants.Stats.HP,
      'AttackDelta': Constants.Stats.ATK,
      'DefenceDelta': Constants.Stats.DEF,
      'SpeedDelta': Constants.Stats.SPD,
      'CriticalDamageBase': Constants.Stats.CD,
      'CriticalChanceBase': Constants.Stats.CR,
      'StatusProbabilityBase': Constants.Stats.EHR,
      'StatusResistanceBase': Constants.Stats.RES,
      'BreakDamageAddedRatioBase': Constants.Stats.BE,
      'SPRatioBase': Constants.Stats.ERR,
      'HealRatioBase': Constants.Stats.OHB,
      'PhysicalAddedRatio': Constants.Stats.Physical_DMG,
      'FireAddedRatio': Constants.Stats.Fire_DMG,
      'IceAddedRatio': Constants.Stats.Ice_DMG,
      'ThunderAddedRatio': Constants.Stats.Lightning_DMG,
      'WindAddedRatio': Constants.Stats.Wind_DMG,
      'QuantumAddedRatio': Constants.Stats.Quantum_DMG,
      'ImaginaryAddedRatio': Constants.Stats.Imaginary_DMG,
    }

    partConversion = {
      1: Constants.Parts.Head,
      2: Constants.Parts.Hands,
      3: Constants.Parts.Body,
      4: Constants.Parts.Feet,
      5: Constants.Parts.PlanarSphere,
      6: Constants.Parts.LinkRope,
    }

    gradeConversion = {
      6: 5,
      5: 4,
      4: 3,
      3: 2
    }
  }
}

function convertRelic(preRelic) {
  try {
    console.log('!! DEBUG', preRelic)
    let metadata = DB.getMetadata().relics
    let tid = '' + preRelic.tid

    let enhance = preRelic.level

    let setId = tid.substring(1, 4)
    let setName = metadata.relicSets[setId].name

    let partId = tid.substring(4, 5)
    let partName = partConversion[partId]

    let gradeId = tid.substring(0, 1)
    let grade = gradeConversion[gradeId]

    let mainId = preRelic.main_affix_id
    let mainData = metadata.relicMainAffixes[`${grade}${partId}`].affixes[mainId]

    let mainStat = statConversion[mainData.property]
    let mainBase = mainData.base
    let mainStep = mainData.step
    let mainValue = mainBase + mainStep * enhance

    let main = {
      stat: mainStat,
      value: mainValue * (Utils.isFlat(mainStat) ? 1 : 100)
    }

    let substats = []
    for (let sub of preRelic.sub_affix_list) {
      let subId = sub.affix_id
      let count = sub.cnt
      let step = sub.step

      let subData = metadata.relicSubAffixes[grade].affixes[subId]
      let subStat = statConversion[subData.property]
      let subBase = subData.base
      let subStep = subData.step
      let subValue = subBase * count + subStep * step

      substats.push({
        stat: subStat,
        value: subValue * (Utils.isFlat(subStat) ? 1 : 100)
      })
    }

    let relic = {
      part: partName,
      set: setName,
      enhance: enhance,
      grade: grade,
      main: main,
      substats: substats
    }

    return RelicAugmenter.augment(relic)
  } catch (e) {
    console.error(e)
    return null
  }
}


/*
{
    "id": "1212",
    "form": {
        "characterId": "1212",
        "characterLevel": 80,
        "characterEidolon": 1,
        "lightCone": "23014",
        "lightConeLevel": 80,
        "lightConeSuperimposition": 1,
        "mainBody": [
            "CRIT DMG"
        ],
        "mainFeet": [
            "SPD"
        ],
        "mainPlanarSphere": [
            "Ice DMG Boost"
        ],
        "mainLinkRope": [
            "ATK%"
        ],
        "ornamentSets": [
            "Rutilant Arena"
        ],
        "relicSets": [
            [
                "4 Piece",
                "Hunter of Glacial Forest"
            ]
        ],
        "minAtk": 0,
        "maxAtk": 2147483647,
        "minHp": 0,
        "maxHp": 2147483647,
        "minDef": 0,
        "maxDef": 2147483647,
        "minSpd": 134,
        "maxSpd": 2147483647,
        "minCr": 0,
        "maxCr": 2147483647,
        "minCd": 0,
        "maxCd": 2147483647,
        "minEhr": 0,
        "maxEhr": 2147483647,
        "minRes": 0,
        "maxRes": 2147483647,
        "minBe": 0,
        "maxBe": 2147483647,
        "minCv": 0,
        "maxCv": 2147483647,
        "minDmg": 11000,
        "maxDmg": 2147483647,
        "minMcd": 0,
        "maxMcd": 2147483647,
        "minEhp": 0,
        "maxEhp": 2147483647,
        "buffAtk": 0,
        "buffAtkP": 0,
        "buffCr": 0.5,
        "buffCd": 0,
        "rankFilter": true,
        "predictMaxedMainStat": true,
        "keepCurrentRelics": false,
        "enhance": 15,
        "grade": 5,
        "mainHead": [],
        "mainHands": []
    },
    "equipped": {
        "Head": {
            "part": "Head",
            "set": "Hunter of Glacial Forest",
            "enhance": 15,
            "grade": 5,
            "main": {
                "stat": "HP",
                "value": 705
            },
            "substats": [
                {
                    "stat": "CRIT Rate",
                    "value": 11
                },
                {
                    "stat": "CRIT DMG",
                    "value": 10.3
                },
                {
                    "stat": "Effect RES",
                    "value": 3.4
                },
                {
                    "stat": "Break Effect",
                    "value": 5.1
                }
            ],
            "id": "cd85c14c-a662-4413-a149-a379e6d538d3",
            "augmentedStats": {
                "mainStat": "HP",
                "mainValue": 705,
                "CRIT Rate": 0.11,
                "CRIT DMG": 0.10300000000000001,
                "Effect RES": 0.034,
                "Break Effect": 0.051,
                "HP%": 0,
                "ATK%": 0,
                "DEF%": 0,
                "SPD%": 0,
                "HP": 0,
                "ATK": 0,
                "DEF": 0,
                "SPD": 0,
                "Effect Hit Rate": 0,
                "Energy Regeneration Rate": 0,
                "Outgoing Healing Boost": 0,
                "Physical DMG Boost": 0,
                "Fire DMG Boost": 0,
                "Ice DMG Boost": 0,
                "Lightning DMG Boost": 0,
                "Wind DMG Boost": 0,
                "Quantum DMG Boost": 0,
                "Imaginary DMG Boost": 0
            },
            "os": 32.3,
            "ss": 5.1000000000000005,
            "ds": 5.1,
            "cs": 32.3,
            "equippedBy": "1212"
        },  "rank": 0
}
*/