import { Constants, Parts, Sets, SubStats } from '../constants.ts'
import { v4 as uuidv4 } from 'uuid'
import { Utils } from '../utils'
import { RelicAugmenter } from '../relicAugmenter'
import { RelicEnhance, RelicGrade } from 'types/Relic.js'

export function hoyolabParser(input) {
  const json = JSON.parse(input)
  const output: {
    metadata: {
      trailblazer: string
      current_trailblazer_path: string
    }
    characters: {
      characterEidolon: number
      characterId: string
      characterLevel: number
      lightCone: string | null
      lightConeLevel: number
      lightConeSuperimposition: number
    }[]
    relics: {
      enhance: RelicEnhance
      equippedBy: string
      grade: RelicGrade
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
        addedRolls: number
      }[]
      verified: boolean
    }[]
  } = {
    metadata: {
      trailblazer: 'Stelle',
      current_trailblazer_path: 'Destruction',
    },
    characters: [],
    relics: [],
  }
  for (const character of json.data.avatar_list) {
    const characterData = {
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
    for (const relic of [...character.relics, ...character.ornaments]) {
      const substats: {
        stat: SubStats
        value: number
        addedRolls: number
      }[] = []
      for (const property of relic.properties) {
        const substat = {
          stat: getStat(property.property_type),
          value: readValue(property.value),
          addedRolls: property.times - 1,
        }
        substats.push(substat)
      }
      output.relics.push({
        enhance: relic.level,
        equippedBy: (character.id).toString(),
        grade: relic.rarity,
        id: uuidv4(),
        part: getSlot(relic.pos),
        set: getSet(relic.id),
        main: {
          stat: getStat(relic.main_property.property_type),
          value: readValue(relic.main_property.value),
        },
        substats: substats,
        verified: false,
      })
    }
    if (character.id == 8002) {
      output.metadata.trailblazer = 'Stelle'
      output.metadata.current_trailblazer_path = 'Destruction'
    }
    if (character.id == 8004) {
      output.metadata.trailblazer = 'Stelle'
      output.metadata.current_trailblazer_path = 'Preservation'
    }
    if (character.id == 8006) {
      output.metadata.trailblazer = 'Stelle'
      output.metadata.current_trailblazer_path = 'Harmony'
    }
    if (character.id == 8001) {
      output.metadata.trailblazer = 'Caelus'
      output.metadata.current_trailblazer_path = 'Destruction'
    }
    if (character.id == 8003) {
      output.metadata.trailblazer = 'Caelus'
      output.metadata.current_trailblazer_path = 'Preservation'
    }
    if (character.id == 8005) {
      output.metadata.trailblazer = 'Caelus'
      output.metadata.current_trailblazer_path = 'Harmony'
    }
  }
  output.relics.map((r) => RelicAugmenter.augment(r))
  return output
}

function readValue(value: string) {
  if (value.endsWith('%')) {
    return Utils.precisionRound(parseFloat(value.slice(0, value.length - 1)))
  }
  return Utils.precisionRound(parseFloat(value))
}

function getStat(id: number) {
  switch (id) {
    case 27:
      return Constants.Stats.HP
    case 32:
      return Constants.Stats.HP_P
    case 29:
      return Constants.Stats.ATK
    case 33:
      return Constants.Stats.ATK_P
    case 31:
      return Constants.Stats.DEF
    case 34:
      return Constants.Stats.DEF_P
    case 51:
      return Constants.Stats.SPD
    case 52:
      return Constants.Stats.CR
    case 53:
      return Constants.Stats.CD
    case 56:
      return Constants.Stats.EHR
    case 57:
      return Constants.Stats.RES
    case 59:
      return Constants.Stats.BE
    case 54:
      return Constants.Stats.ERR
    case 55:
      return Constants.Stats.OHB
    case 12:
      return Constants.Stats.Physical_DMG
    case 14:
      return Constants.Stats.Fire_DMG
    case 16:
      return Constants.Stats.Ice_DMG
    case 18:
      return Constants.Stats.Lightning_DMG
    case 20:
      return Constants.Stats.Wind_DMG
    case 22:
      return Constants.Stats.Quantum_DMG
    case 24:
      return Constants.Stats.Imaginary_DMG
    default:
      return ''
  }
}

function getSlot(id: number) {
  switch (id) {
    case 1:
      return Parts.Head
    case 2:
      return Parts.Hands
    case 3:
      return Parts.Body
    case 4:
      return Parts.Feet
    case 5:
      return Parts.PlanarSphere
    case 6:
      return Parts.LinkRope
    default:
      return ''
  }
}

function getSet(id: number) {
  const setID = Math.floor((id % 10000) / 10)
  const setsJson = JSON.parse('src/data/relic_sets.json')
  for (const set in setsJson) {
    if (setID == parseInt(set.id)) {
      return set.name
    }
  }
  console.log(`=========no matching set found for relic id: ${id}=========`)
  return ''
}
