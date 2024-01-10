import { RelicAugmenter } from "./relicAugmenter"

let statConversion
let partConversion
let gradeConversion 

export const CharacterConverter = {
  convert: (character) => {
    console.log(character)
    if (!statConversion) CharacterConverter.setConstantConversions()

    let preRelics = character.relicList || []
    let preLightCone = character.equipment
    let characterLevel = character.level
    let characterEidolon = character.rank || 0
    let id = '' + character.avatarId
    let lightConeId = preLightCone ? '' + preLightCone.tid : undefined;
    let lightConeLevel = preLightCone ? preLightCone.level : 0;
    let lightConeSuperimposition = preLightCone ? preLightCone.rank : 0

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
    let metadata = DB.getMetadata().relics
    let tid = '' + preRelic.tid

    let enhance = preRelic.level || 0

    let setId = tid.substring(1, 4)
    let setName = metadata.relicSets[setId].name

    let partId = tid.substring(4, 5)
    let partName = partConversion[partId]

    let gradeId = tid.substring(0, 1)
    let grade = gradeConversion[gradeId]

    let mainId = preRelic.mainAffixId
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
    for (let sub of preRelic.subAffixList) {
      let subId = sub.affixId
      let count = sub.cnt
      let step = sub.step || 0

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
