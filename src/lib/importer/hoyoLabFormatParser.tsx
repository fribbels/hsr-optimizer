import { Constants, Parts, SubStats } from 'lib/constants'
import { Utils } from 'lib/utils'
import { RelicAugmenter } from 'lib/relicAugmenter'
import DB from 'lib/db'

/*

  Sample data:

            "id": 1309,
            "level": 80,
            "name": "Robin",
            "element": "physical",
            "rarity": 5,
            "rank": 0,
            "equip": {
                "id": 22002,
                "level": 70,
                "rank": 5,
                "rarity": 4
            },
            "relics": [{
                "id": 61141,
                "level": 15,
                "pos": 1,
                "rarity": 5,
                "main_property": {
                    "property_type": 27,
                    "value": "705",
                    "times": 0
                },
                "properties": [{
                    "property_type": 29,
                    "value": "33",
                    "times": 2

                    ...
                }]
            }, {
 */

type HoyolabRelic = {
  id: number
  level: number
  pos: number
  rarity: number
  main_property: Property
  properties: Property[]
}

type Property = {
  property_type: number
  value: string
  times: number
}

type Equip = {
  id: number
  level: number
  rank: number
  rarity: number
}

type Avatar = {
  id: number
  level: number
  name: string
  rank: number
  equip: Equip
  relics: HoyolabRelic[]
  ornaments: HoyolabRelic[]
}

type HoyolabData = {
  data: {
    avatar_list: Avatar[]
  }
}

type HoyolabOutput = {
  metadata: {
    trailblazer: string
    current_trailblazer_path: string
  }
  characters: HoyolabCharacter[]
  relics: {
    enhance: number
    equippedBy: string
    grade: number
    id: string
    part: string
    set: string
    main: {
      stat: string
      value: number
    }
    substats: {
      stat: SubStats
      value: number
    }[]
    verified: boolean
  }[]
}

type HoyolabCharacter = {
  characterEidolon: number
  characterId: string
  characterLevel: number
  lightCone: string | null
  lightConeLevel: number
  lightConeSuperimposition: number
}

export function hoyolabParser(json: HoyolabData) {
  const relicData = DB.getMetadata().relics.relicSets

  const output: HoyolabOutput = {
    metadata: {
      trailblazer: 'Stelle',
      current_trailblazer_path: 'Destruction',
    },
    characters: [],
    relics: [],
  }
  for (const character of json.data.avatar_list) {
    const characterData: HoyolabCharacter = {
      characterEidolon: character.rank,
      characterId: character.id.toString(),
      characterLevel: character.level,
      lightCone: null,
      lightConeLevel: 80,
      lightConeSuperimposition: 1,
    }
    if (character.equip != null) {
      characterData.lightCone = character.equip.id.toString()
      characterData.lightConeSuperimposition = character.equip.rank
    }
    output.characters.push(characterData)
    const relics: HoyolabRelic[] = [...character.relics, ...character.ornaments]
    for (const relic of relics) {
      const substats: {
        stat: SubStats
        value: number
      }[] = []
      for (const property of relic.properties) {
        const substat = {
          stat: getStat(property.property_type),
          value: readValue(property.value),
        }
        substats.push(substat)
      }
      output.relics.push({
        enhance: relic.level,
        equippedBy: (character.id).toString(),
        grade: relic.rarity,
        id: Utils.randomId(),
        part: getSlot(relic.pos),
        set: getSet(relic.id, relicData),
        main: {
          stat: getStat(relic.main_property.property_type),
          value: readValue(relic.main_property.value),
        },
        substats: substats,
        verified: false,
      })
    }

    const trailblazerMetadata: TrailblazerMetadata = getTrailblazerMetadata(character.id)
    if (trailblazerMetadata) output.metadata = trailblazerMetadata
  }
  output.relics.map((relic) => RelicAugmenter.augment(relic))
  return output
}

function readValue(value: string) {
  if (value.endsWith('%')) {
    return Utils.precisionRound(parseFloat(value.slice(0, value.length - 1)))
  }
  return Utils.precisionRound(parseFloat(value))
}

type TrailblazerMetadata = { trailblazer: string; current_trailblazer_path: string }
const trailblazerMetadataLookup: { [key: number]: TrailblazerMetadata } = {
  8001: { trailblazer: 'Caelus', current_trailblazer_path: 'Destruction' },
  8002: { trailblazer: 'Stelle', current_trailblazer_path: 'Destruction' },

  8003: { trailblazer: 'Caelus', current_trailblazer_path: 'Preservation' },
  8004: { trailblazer: 'Stelle', current_trailblazer_path: 'Preservation' },

  8006: { trailblazer: 'Stelle', current_trailblazer_path: 'Harmony' },
  8005: { trailblazer: 'Caelus', current_trailblazer_path: 'Harmony' },
}

function getTrailblazerMetadata(id: number) {
  return trailblazerMetadataLookup[id]
}

const statLookup: { [key: number]: string } = {
  27: Constants.Stats.HP,
  32: Constants.Stats.HP_P,
  29: Constants.Stats.ATK,
  33: Constants.Stats.ATK_P,
  31: Constants.Stats.DEF,
  34: Constants.Stats.DEF_P,
  51: Constants.Stats.SPD,
  52: Constants.Stats.CR,
  53: Constants.Stats.CD,
  56: Constants.Stats.EHR,
  57: Constants.Stats.RES,
  59: Constants.Stats.BE,
  54: Constants.Stats.ERR,
  55: Constants.Stats.OHB,
  12: Constants.Stats.Physical_DMG,
  14: Constants.Stats.Fire_DMG,
  16: Constants.Stats.Ice_DMG,
  18: Constants.Stats.Lightning_DMG,
  20: Constants.Stats.Wind_DMG,
  22: Constants.Stats.Quantum_DMG,
  24: Constants.Stats.Imaginary_DMG,
}

function getStat(id: number) {
  return statLookup[id] || ''
}

const slotLookup: { [key: number]: string } = {
  1: Parts.Head,
  2: Parts.Hands,
  3: Parts.Body,
  4: Parts.Feet,
  5: Parts.PlanarSphere,
  6: Parts.LinkRope,
}

function getSlot(id: number) {
  return slotLookup[id] || ''
}

function getSet(id: number, relicData): string {
  const setId = id.toString().substring(1, 4)
  if (tidOverrides[id]) {
    return relicData[tidOverrides[id].set].name
  }

  return relicData[setId].name
}

const tidOverrides = {
  55001: { set: '101', part: '3', main: '436' },
  55002: { set: '101', part: '4', main: '441' },
  55003: { set: '102', part: '3', main: '434' },
  55004: { set: '103', part: '3', main: '433' },
  55005: { set: '103', part: '4', main: '443' },
  55006: { set: '105', part: '3', main: '434' },
}
