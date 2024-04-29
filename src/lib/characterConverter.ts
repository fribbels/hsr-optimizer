import { RelicAugmenter } from './relicAugmenter.js'
import { Constants } from './constants.ts'
import { Utils } from './utils.js'
import DB from './db.js'

const partConversion = {
  1: Constants.Parts.Head,
  2: Constants.Parts.Hands,
  3: Constants.Parts.Body,
  4: Constants.Parts.Feet,
  5: Constants.Parts.PlanarSphere,
  6: Constants.Parts.LinkRope,
}
const gradeConversion = {
  6: 5,
  5: 4,
  4: 3,
  3: 2,
}
const statConversion = {
  HPAddedRatio: Constants.Stats.HP_P,
  AttackAddedRatio: Constants.Stats.ATK_P,
  DefenceAddedRatio: Constants.Stats.DEF_P,
  HPDelta: Constants.Stats.HP,
  AttackDelta: Constants.Stats.ATK,
  DefenceDelta: Constants.Stats.DEF,
  SpeedDelta: Constants.Stats.SPD,
  CriticalDamageBase: Constants.Stats.CD,
  CriticalChanceBase: Constants.Stats.CR,
  StatusProbabilityBase: Constants.Stats.EHR,
  StatusResistanceBase: Constants.Stats.RES,
  BreakDamageAddedRatioBase: Constants.Stats.BE,
  SPRatioBase: Constants.Stats.ERR,
  HealRatioBase: Constants.Stats.OHB,
  PhysicalAddedRatio: Constants.Stats.Physical_DMG,
  FireAddedRatio: Constants.Stats.Fire_DMG,
  IceAddedRatio: Constants.Stats.Ice_DMG,
  ThunderAddedRatio: Constants.Stats.Lightning_DMG,
  WindAddedRatio: Constants.Stats.Wind_DMG,
  QuantumAddedRatio: Constants.Stats.Quantum_DMG,
  ImaginaryAddedRatio: Constants.Stats.Imaginary_DMG,
}
export type PreconvertStatKey = keyof typeof statConversion

export const CharacterConverter = {
  convert: (character) => {
    const preRelics = character.relicList || []
    const preLightCone = character.equipment
    const characterEidolon = character.rank || 0
    const id = '' + character.avatarId
    const lightConeId = preLightCone ? '' + preLightCone.tid : undefined
    const lightConeLevel = preLightCone ? preLightCone.level : 0
    const lightConeSuperimposition = preLightCone ? preLightCone.rank : 0

    const relics = preRelics.map((x) => convertRelic(x)).filter((x) => !!x)
    const equipped = {}
    for (const relic of relics) {
      relic.verified = true
      relic.equippedBy = id
      equipped[relic.part] = relic
    }

    return {
      id: id,
      key: Utils.randomId(),
      form: {
        characterLevel: 80,
        characterId: id,
        characterEidolon: characterEidolon,
        lightCone: lightConeId,
        lightConeLevel: lightConeLevel,
        lightConeSuperimposition: lightConeSuperimposition,
      },
      equipped: equipped,
    }
  },

  getConstantConversions: () => {
    return {
      statConversion,
      partConversion,
      gradeConversion,
    }
  },
}

// Some special relics have a weird id -> set/part/main mapping
const tidOverrides = {
  55001: {set: '101', part: '3', main: '436'},
  55002: {set: '102', part: '4', main: '441'},
  55003: {set: '103', part: '3', main: '434'},
  55004: {set: '104', part: '3', main: '433'},
  55005: {set: '105', part: '4', main: '443'},
  55006: {set: '106', part: '3', main: '434'},
}

function convertRelic(preRelic) {
  try {
    const metadata = DB.getMetadata().relics
    const tid = '' + preRelic.tid

    const enhance = preRelic.level || 0

    let setId = tid.substring(1, 4)
    if (tidOverrides[tid]) {
      setId = tidOverrides[tid].set
    }
    const setName = metadata.relicSets[setId].name

    let partId = tid.substring(4, 5)
    if (tidOverrides[tid]) {
      partId = tidOverrides[tid].part
    }
    const partName = partConversion[partId]

    const gradeId = tid.substring(0, 1)
    const grade = gradeConversion[gradeId]

    const mainId = preRelic.mainAffixId
    let mainData = metadata.relicMainAffixes[`${grade}${partId}`].affixes[mainId]
    if (tidOverrides[tid]) {
      mainData = metadata.relicMainAffixes[tidOverrides[tid].main].affixes[mainId]
    }

    const mainStat = statConversion[mainData.property]
    const mainBase = mainData.base
    const mainStep = mainData.step
    const mainValue = mainBase + mainStep * enhance

    const main = {
      stat: mainStat,
      value: Utils.precisionRound(mainValue * (Utils.isFlat(mainStat) ? 1 : 100), 5),
    }

    const substats: { stat: string; value: number }[] = []
    for (const sub of preRelic.subAffixList) {
      const subId = sub.affixId
      const count = sub.cnt
      const step = sub.step || 0

      const subData = metadata.relicSubAffixes[grade].affixes[subId]
      const subStat = statConversion[subData.property]
      const subBase = subData.base
      const subStep = subData.step

      const subValue = subBase * count + subStep * step

      substats.push({
        stat: subStat,
        value: Utils.precisionRound(subValue * (Utils.isFlat(subStat) ? 1 : 100), 5),
      })
    }

    const relic = {
      part: partName,
      set: setName,
      enhance: enhance,
      grade: grade,
      main: main,
      substats: substats,
    }

    return RelicAugmenter.augment(relic)
  } catch (e) {
    console.error(e)
    return null
  }
}
