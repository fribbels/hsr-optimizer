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
      characterID: string
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
  for (let i = 0; i < json.data.avatar_list.length; i++) {
    const character = json.data.avatar_list[i]
    if (character.equip != null) {
      output.characters.push({
        characterEidolon: character.rank,
        characterID: (character.id).toString(),
        characterLevel: character.level,
        lightCone: (character.equip.id).toString(),
        lightConeLevel: character.equip.level,
        lightConeSuperimposition: character.equip.rank,
      })
    } else {
      output.characters.push({
        characterEidolon: character.rank,
        characterID: (character.id).toString(),
        characterLevel: character.level,
        lightCone: null,
        lightConeLevel: 80,
        lightConeSuperimposition: 1,
      })
    }
    for (let j = 0; j < character.relics.length; j++) {
      const relic = character.relics[j]
      const substats: {
        stat: SubStats
        value: number
        addedRolls: number
      }[] = []
      for (let k = 0; k < relic.properties.length; k++) {
        const substat = {
          stat: getStat(relic.properties[k].property_type),
          value: readValue(relic.properties[k].value),
          addedRolls: relic.properties[k].times - 1,
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
    for (let j = 0; j < character.ornaments.length; j++) {
      const relic = character.ornaments[j]
      const substats: {
        stat: SubStats
        value: number
        addedRolls: number
      }[] = []
      for (let k = 0; k < relic.properties.length; k++) {
        const substat = {
          stat: getStat(relic.properties[k].property_type),
          value: readValue(relic.properties[k].value),
          addedRolls: relic.properties[k].times - 1,
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
  console.log(output)
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
  let set = ''
  switch (Math.floor((id % 10000) / 10)) { // Set
    case 101:
      set = Sets.PasserbyOfWanderingCloud
      break
    case 102:
      set = Sets.MusketeerOfWildWheat
      break
    case 103:
      set = Sets.KnightOfPurityPalace
      break
    case 104:
      set = Sets.HunterOfGlacialForest
      break
    case 105:
      set = Sets.ChampionOfStreetwiseBoxing
      break
    case 106:
      set = Sets.GuardOfWutheringSnow
      break
    case 107:
      set = Sets.FiresmithOfLavaForging
      break
    case 108:
      set = Sets.GeniusOfBrilliantStars
      break
    case 109:
      set = Sets.BandOfSizzlingThunder
      break
    case 110:
      set = Sets.EagleOfTwilightLine
      break
    case 111:
      set = Sets.ThiefOfShootingMeteor
      break
    case 112:
      set = Sets.WastelanderOfBanditryDesert
      break
    case 113:
      set = Sets.LongevousDisciple
      break
    case 114:
      set = Sets.MessengerTraversingHackerspace
      break
    case 115:
      set = Sets.TheAshblazingGrandDuke
      break
    case 116:
      set = Sets.PrisonerInDeepConfinement
      break
    case 117:
      set = Sets.PioneerDiverOfDeadWaters
      break
    case 118:
      set = Sets.WatchmakerMasterOfDreamMachinations
      break
    case 301:
      set = Sets.SpaceSealingStation
      break
    case 302:
      set = Sets.FleetOfTheAgeless
      break
    case 303:
      set = Sets.PanCosmicCommercialEnterprise
      break
    case 304:
      set = Sets.BelobogOfTheArchitects
      break
    case 305:
      set = Sets.CelestialDifferentiator
      break
    case 306:
      set = Sets.InertSalsotto
      break
    case 307:
      set = Sets.TaliaKingdomOfBanditry
      break
    case 308:
      set = Sets.SprightlyVonwacq
      break
    case 309:
      set = Sets.RutilantArena
      break
    case 310:
      set = Sets.BrokenKeel
      break
    case 311:
      set = Sets.FirmamentFrontlineGlamoth
      break
    case 312:
      set = Sets.PenaconyLandOfTheDreams
      break
    case 313:
      set = Sets.SigoniaTheUnclaimedDesolation
      break
    case 314:
      set = Sets.IzumoGenseiAndTakamaDivineRealm
      break
  }
  return set
}
