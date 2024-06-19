import { RelicAugmenter } from './relicAugmenter.js'
import { Constants } from './constants.ts'
import { Utils } from './utils.js'
import DB from './db.js'
import { TsUtils } from 'lib/TsUtils'

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

function getStat(affix) {
  const stat = statConversion[affix.type]
  const multiplier = Utils.isFlat(stat) ? 1 : 100

  return {
    stat: stat,
    value: TsUtils.precisionRound(affix.value * multiplier),
  }
}

export const MihomoCharacterConverter = {
  convert: (character) => {
    const metadata = DB.getMetadata().relics

    const id = character.id
    const characterEidolon = character.rank || 0
    const lightCone = character.light_cone.id
    const lightConeSuperimposition = character.light_cone?.rank || 1

    const equipped = {}

    for (const relic of character.relics) {
      const part = partConversion[relic.type]
      const substats = []

      for (const substat of relic.sub_affix) {
        substats.push(getStat(substat))
      }

      const converted = {
        part: part,
        set: metadata.relicSets[relic.set_id].name,
        enhance: relic.level,
        grade: relic.rarity,
        main: getStat(relic.main_affix),
        substats: substats,
        verified: true,
        equippedBy: id,
      }

      equipped[part] = RelicAugmenter.augment(converted)
    }

    const result = {
      id: id,
      key: Utils.randomId(),
      form: {
        characterLevel: 80,
        characterId: id,
        characterEidolon: characterEidolon,
        lightCone: lightCone,
        lightConeLevel: 80,
        lightConeSuperimposition: lightConeSuperimposition,
      },
      equipped: equipped,
    }

    return result
  },
}
