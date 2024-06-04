import stringSimilarity from 'string-similarity'
import { Constants, Parts, Sets } from '../constants.ts'
import { RelicAugmenter } from '../relicAugmenter'

import characters from '../../data/characters.json'
import lightCones from '../../data/light_cones.json'
import DB from '../db'
import { Utils } from '../utils'
import semver from 'semver'
import { Typography } from 'antd'
import { Message } from 'lib/message'

const { Text } = Typography

const characterList = Object.values(characters)
const lightConeList = Object.values(lightCones)
let relicSetList = Object.entries(Sets)
for (let set of relicSetList) {
  set[2] = set[1]
  set[1] = lowerAlphaNumeric(set[1])
}

export class KelzFormatParser { // TODO abstract class
  constructor(config) {
    this.config = config
  }

  parse(json) {
    let parsed = {
      metadata: {
        trailblazer: 'Stelle',
        current_trailblazer_path: 'Destruction'
      },
      characters: [],
      relics: [],
    }

    if (json.source != this.config.sourceString) {
      throw new Error(`Incorrect source string, was '${json.source}', expected '${this.config.sourceString}'`)
    }

    if (json.version != this.config.latestOutputVersion) {
      throw new Error(`Incorrect json version, was '${json.version}', expected '${this.config.latestOutputVersion}'`)
    }

    const buildVersion = json.build || 'v0.0.0'
    const isOutOfDate = semver.lt(buildVersion, this.config.latestBuildVersion)

    if (isOutOfDate) {
      console.log(`Current: ${buildVersion}, Latest: ${this.config.latestBuildVersion}`)
      Message.warning((
        <Text>
          {`Your scanner version ${buildVersion} is out of date and may result in incorrect imports! Please update to the latest version from Github:`}
          {' '}
          <a target="_blank" style={{ color: '#3f8eff' }} href={this.config.releases} rel="noreferrer">{this.config.releases}</a>
        </Text>
      ), 15)
    }

    parsed.metadata.trailblazer = json.metadata.trailblazer || 'Stelle'
    parsed.metadata.current_trailblazer_path = json.metadata.current_trailblazer_path || 'Stelle'

    if (json.relics) {
      parsed.relics = json.relics
        .map((r) => readRelic(r, parsed.metadata.trailblazer, parsed.metadata.current_trailblazer_path, this.config))
        .map((r) => RelicAugmenter.augment(r))
        .filter((r) => {
          if (!r) {
            console.warn('Could not parse relic')
          }
          return r
        })
    }

    if (json.characters) {
      parsed.characters = json.characters
        .map((c) => readCharacter(c, json.light_cones, parsed.metadata.trailblazer, parsed.metadata.current_trailblazer_path))
        .filter((c) => {
          if (!c) {
            console.warn('Could not parse character')
          }
          return c
        })
    }

    return parsed
  }
}

function readCharacter(character, lightCones, trailblazer, path) {
  let lightCone = undefined
  if (lightCones) {
    if (character.key.startsWith('Trailblazer')) {
      lightCone = lightCones.find((x) => x.location.startsWith('Trailblazer'))
    } else {
      lightCone = lightCones.find((x) => x.location === character.key)
    }
  }


  let characterId
  if (character.key.startsWith('Trailblazer')) {
    characterId = getTrailblazerId(character.key, trailblazer, path)
  } else {
    characterId = characterList.find((x) => x.name === character.key)?.id
  }

  let lcKey = lightCone?.key
  const lightConeId = lightConeList.find((x) => x.name === lcKey)?.id

  if (!characterId) return null

  return {
    characterId: characterId,
    characterLevel: character.level || 80,
    characterEidolon: character.eidolon || 0,
    lightCone: lightConeId || null,
    lightConeLevel: lightCone?.level || 80,
    lightConeSuperimposition: lightCone?.superimposition || 1,
  }
}

function readRelic(relic, trailblazer, path, config) {
  let partMatches = stringSimilarity.findBestMatch(relic.slot, Object.values(Parts))
  let part = partMatches.bestMatch.target

  let setMatches = stringSimilarity.findBestMatch(lowerAlphaNumeric(relic.set), relicSetList.map((x) => x[1]))
  let set = relicSetList[setMatches.bestMatchIndex][2]

  let enhance = Math.min(Math.max(parseInt(relic.level), 0), 15)
  let grade = Math.min(Math.max(parseInt(relic.rarity), 2), 5)

  let { main, substats } = readRelicStats(relic, part, grade, enhance)

  let equippedBy = undefined
  if (relic.location !== '') {
    let lookup = characterList.find((x) => x.name == relic.location)?.id
    if (lookup) {
      equippedBy = lookup
    } else if (relic.location.startsWith('Trailblazer')) {
      equippedBy = getTrailblazerId(relic.location, trailblazer, path)
    }
  }

  return {
    part,
    set,
    enhance,
    grade,
    main,
    substats,
    equippedBy,
    verified: config.speedVerified,
  }
}

function readRelicStats(relic, part, grade, enhance) {
  let mainStat
  if (part === 'Hands') {
    mainStat = Constants.Stats.ATK
  } else if (part === 'Head') {
    mainStat = Constants.Stats.HP
  } else {
    mainStat = mapMainStatToId(relic.mainstat)
  }

  let partId = mapPartIdToIndex(part)
  let query = `${grade}${partId}`
  let affixes = Object.values(DB.getMetadata().relics.relicMainAffixes[query].affixes)

  let mainId = mapAffixIdToString(mainStat)
  let mainData = affixes.find((x) => x.property === mainId)
  let mainValue = mainData.base + mainData.step * enhance

  let substats = relic.substats
    .map((s) => ({
      stat: mapSubstatToId(s.key),
      value: s.value,
    }))

  return {
    main: {
      stat: mainStat,
      value: Utils.truncate10000ths(mainValue * (Utils.isFlat(mainStat) ? 1 : 100)),
    },
    substats: substats,
  }
}

function mapSubstatToId(substat) {
  switch (substat) {
    case 'ATK':
      return Constants.Stats.ATK
    case 'HP':
      return Constants.Stats.HP
    case 'DEF':
      return Constants.Stats.DEF
    case 'ATK_':
      return Constants.Stats.ATK_P
    case 'HP_':
      return Constants.Stats.HP_P
    case 'DEF_':
      return Constants.Stats.DEF_P
    case 'SPD':
      return Constants.Stats.SPD
    case 'CRIT Rate_':
      return Constants.Stats.CR
    case 'CRIT DMG_':
      return Constants.Stats.CD
    case 'Effect Hit Rate_':
      return Constants.Stats.EHR
    case 'Effect RES_':
      return Constants.Stats.RES
    case 'Break Effect_':
      return Constants.Stats.BE
    default:
      return null
  }
}

function mapMainStatToId(mainStat) {
  switch (mainStat) {
    case 'ATK':
      return Constants.Stats.ATK_P
    case 'HP':
      return Constants.Stats.HP_P
    case 'DEF':
      return Constants.Stats.DEF_P
    case 'SPD':
      return Constants.Stats.SPD
    case 'CRIT Rate':
      return Constants.Stats.CR
    case 'CRIT DMG':
      return Constants.Stats.CD
    case 'Effect Hit Rate':
      return Constants.Stats.EHR
    case 'Break Effect':
      return Constants.Stats.BE
    case 'Energy Regeneration Rate':
      return Constants.Stats.ERR
    case 'Outgoing Healing Boost':
      return Constants.Stats.OHB
    case 'Physical DMG Boost':
      return Constants.Stats.Physical_DMG
    case 'Fire DMG Boost':
      return Constants.Stats.Fire_DMG
    case 'Ice DMG Boost':
      return Constants.Stats.Ice_DMG
    case 'Lightning DMG Boost':
      return Constants.Stats.Lightning_DMG
    case 'Wind DMG Boost':
      return Constants.Stats.Wind_DMG
    case 'Quantum DMG Boost':
      return Constants.Stats.Quantum_DMG
    case 'Imaginary DMG Boost':
      return Constants.Stats.Imaginary_DMG
    default:
      return null
  }
}

function mapAffixIdToString(affixId) {
  switch (affixId) {
    case Constants.Stats.HP_P:
      return 'HPAddedRatio'
    case Constants.Stats.ATK_P:
      return 'AttackAddedRatio'
    case Constants.Stats.DEF_P:
      return 'DefenceAddedRatio'
    case Constants.Stats.HP:
      return 'HPDelta'
    case Constants.Stats.ATK:
      return 'AttackDelta'
    case Constants.Stats.DEF:
      return 'DefenceDelta'
    case Constants.Stats.SPD:
      return 'SpeedDelta'
    case Constants.Stats.CD:
      return 'CriticalDamageBase'
    case Constants.Stats.CR:
      return 'CriticalChanceBase'
    case Constants.Stats.EHR:
      return 'StatusProbabilityBase'
    case Constants.Stats.RES:
      return 'StatusResistanceBase'
    case Constants.Stats.BE:
      return 'BreakDamageAddedRatioBase'
    case Constants.Stats.ERR:
      return 'SPRatioBase'
    case Constants.Stats.OHB:
      return 'HealRatioBase'
    case Constants.Stats.Physical_DMG:
      return 'PhysicalAddedRatio'
    case Constants.Stats.Fire_DMG:
      return 'FireAddedRatio'
    case Constants.Stats.Ice_DMG:
      return 'IceAddedRatio'
    case Constants.Stats.Lightning_DMG:
      return 'ThunderAddedRatio'
    case Constants.Stats.Wind_DMG:
      return 'WindAddedRatio'
    case Constants.Stats.Quantum_DMG:
      return 'QuantumAddedRatio'
    case Constants.Stats.Imaginary_DMG:
      return 'ImaginaryAddedRatio'
    default:
      return null
  }
}

function mapPartIdToIndex(slotId) {
  switch (slotId) {
    case Constants.Parts.Head:
      return 1
    case Constants.Parts.Hands:
      return 2
    case Constants.Parts.Body:
      return 3
    case Constants.Parts.Feet:
      return 4
    case Constants.Parts.PlanarSphere:
      return 5
    case Constants.Parts.LinkRope:
      return 6
    default:
      return null
  }
}

function lowerAlphaNumeric(str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
}

function getTrailblazerId(name, trailblazer, path) {
  let id = '8002'
  if (name === 'TrailblazerDestruction') {
    id = trailblazer === 'Stelle' ? '8002' : '8001'
  }
  if (name === 'TrailblazerPreservation') {
    id = trailblazer === 'Stelle' ? '8004' : '8003'
  }
  if (name === 'TrailblazerHarmony') {
    id = trailblazer === 'Stelle' ? '8006' : '8005'
  }

  if (path === 'Destruction') {
    id = trailblazer === 'Stelle' ? '8002' : '8001'
  }
  if (path === 'Preservation') {
    id = trailblazer === 'Stelle' ? '8004' : '8003'
  }
  if (path === 'Harmony') {
    id = trailblazer === 'Stelle' ? '8006' : '8005'
  }

  return id
}
