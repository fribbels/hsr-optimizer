import { Typography } from 'antd'

import gameData from 'data/game_data.json'
import i18next from 'i18next'
import {
  Constants,
  Parts,
  PathName,
  PathNames,
  Sets,
} from 'lib/constants/constants'
import { rollCounter } from 'lib/importer/characterConverter'
import { ScannerConfig } from 'lib/importer/importConfig'
import { Message } from 'lib/interactions/message'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import {
  BLADE,
  BLADE_B1,
  JINGLIU,
  JINGLIU_B1,
  KAFKA,
  KAFKA_B1,
  SILVER_WOLF,
  SILVER_WOLF_B1,
} from 'lib/simulations/tests/testMetadataConstants'
import DB from 'lib/state/db'
import { Utils } from 'lib/utils/utils'
import semver from 'semver'
import {
  Character,
  CharacterId,
} from 'types/character'
import { Form } from 'types/form'
import { Relic } from 'types/relic'

// FIXME HIGH

const { Text } = Typography

const characterList = Object.values(gameData.characters)

export type V4ParserLightCone = {
  id: string,
  name: string,
  level: number,
  ascension: number,
  superimposition: number,
  location: string,
  lock: boolean,
  _uid: string,
}

export type V4ParserCharacter = {
  id: string,
  name: string,
  path: string,
  level: number,
  ascension: number,
  eidolon: number,
  ability_version?: number,
}

export type V4ParserSubstat = {
  key: string,
  value: number,
  count?: number, // only present on reliquary scans
  step?: number, // only present on reliquary scans
}

export type V4ParserRelic = {
  set_id: string,
  name: string,
  slot: string,
  rarity: number,
  level: number,
  mainstat: string,
  substats: V4ParserSubstat[],
  reroll_substats?: V4ParserSubstat[],
  location: string,
  lock: boolean,
  discard: boolean,
  _uid: string,
}

export type V4ParserGachaFunds = {
  stellar_jade: number,
  oneric_shards: number,
}

export type V4ParserMaterial = {
  id: string,
  name: string,
  count: number,
  expire_time?: number,
}

const relicSetMapping = gameData.relics.reduce((map, relic) => {
  map[relic.id] = relic as { id: Relic['id'], name: Sets, skills: string }
  return map
}, {} as Record<string, { id: Relic['id'], name: Sets, skills: string }>)

export type ScannerParserJson = {
  source: string,
  build: string,
  version: number,
  metadata: {
    uid: number,
    trailblazer: 'Stelle' | 'Caelus',
    current_trailblazer_path?: PathName,
  }
  gacha: V4ParserGachaFunds,
  materials: V4ParserMaterial[],
  characters: V4ParserCharacter[],
  light_cones: V4ParserLightCone[],
  relics: V4ParserRelic[],
}

export class KelzFormatParser { // TODO abstract class
  config: ScannerConfig
  badRollInfo: boolean

  constructor(config: ScannerConfig) {
    this.config = config
    this.badRollInfo = false
  }

  parse(json: ScannerParserJson) {
    const tError = i18next.getFixedT(null, 'importSaveTab', 'Import.ParserError')
    const tWarning = i18next.getFixedT(null, 'importSaveTab', 'Import.ParserWarning')
    const parsed = {
      metadata: {
        trailblazer: 'Stelle' as ('Stelle' | 'Caelus'),
        current_trailblazer_path: 'Destruction' as PathName,
      },
      characters: [] as Character['form'][],
      relics: [] as Relic[],
    }

    if (json.source != this.config.sourceString) {
      throw new Error(tError('BadSource', {
        jsonSource: json.source,
        configSource: this.config.sourceString,
      }) /* `Incorrect source string, was '${json.source}', expected '${this.config.sourceString}'` */)
    }

    if (json.version !== this.config.latestOutputVersion) {
      throw new Error(tError('BadVersion', {
        jsonVersion: json.version,
        configVersion: this.config.latestOutputVersion,
      }) /* `Incorrect json version, was '${json.version}', expected '${this.config.latestOutputVersion}'` */)
    }

    const buildVersion = json.build || 'v0.0.0'
    const isOutOfDate = semver.lt(buildVersion, this.config.latestBuildVersion)

    if (isOutOfDate) {
      console.log(`Current: ${buildVersion}, Latest: ${this.config.latestBuildVersion}`)
      Message.warning(
        (
          <Text>
            {/* `Your scanner version ${buildVersion} is out of date and may result in incorrect imports! Please update to the latest version from Github:` */}
            {tError('OutdatedVersion', { buildVersion })}{' '}
            <a target='_blank' style={{ color: '#3f8eff' }} href={this.config.releases} rel='noreferrer'>{this.config.releases}</a>
          </Text>
        ),
        15,
      )
    }

    parsed.metadata.trailblazer = json.metadata.trailblazer || 'Stelle'
    parsed.metadata.current_trailblazer_path = json.metadata.current_trailblazer_path ?? PathNames.Destruction

    // Reset bad roll info
    this.badRollInfo = false

    if (json.relics) {
      parsed.relics = json.relics
        .map((r) => this.parseRelic(r))
        .filter((r): r is NonNullable<typeof r> => {
          if (!r) {
            console.warn('Could not parse relic')
            return false
          }
          return true
        })
    }
    // "Scanner file is outdated / may contain invalid information. Please update your scanner."
    if (this.badRollInfo) {
      Message.warning(tWarning('BadRollInfo'), 10)
    }

    if (json.characters) {
      parsed.characters = json.characters
        .map((c) => readCharacter(c, json.light_cones) as Form | null)
        .filter((c): c is NonNullable<typeof c> => {
          if (!c) {
            console.warn('Could not parse character')
            return false
          }
          return true
        })
    }

    migrateBuffedCharacters(json.characters, parsed.characters, parsed.relics)

    return parsed
  }

  parseRelic(relic: V4ParserRelic, substatListOverride?: V4ParserSubstat[]) {
    const parsed = readRelic(relic, substatListOverride ?? relic.substats, this)
    return RelicAugmenter.augment(parsed) as Relic | null
  }

  parseCharacter(character: V4ParserCharacter, lightCones: V4ParserLightCone[]) {
    return readCharacter(character, lightCones) as Form | null
  }
}

export const buffedCharacters: Record<string, string> = {
  [JINGLIU]: JINGLIU_B1,
  [KAFKA]: KAFKA_B1,
  [BLADE]: BLADE_B1,
  [SILVER_WOLF]: SILVER_WOLF_B1,
}

function migrateBuffedCharacters(rawCharacters: V4ParserCharacter[], characters: Form[], relics: Relic[]) {
  const activatedBuffs: Record<string, string> = {}
  for (const character of rawCharacters) {
    const id = character.id
    const abilityVersion = character.ability_version
    if (abilityVersion == null && buffedCharacters[id]) {
      // We don't have a defined abilityVersion in this case, assume buffed version
      activatedBuffs[id] = buffedCharacters[id]
    } else if (abilityVersion != null && abilityVersion > 0 && buffedCharacters[id]) {
      // When it is defined, only apply the buff when abilityVersion is explicitly not set to 0
      activatedBuffs[id] = buffedCharacters[id]
    }
  }

  for (const character of characters) {
    const id = character.characterId
    if (activatedBuffs[id]) {
      character.characterId = activatedBuffs[id] as CharacterId
    }
  }

  for (const relic of relics) {
    const owner = relic.equippedBy ?? 'NONE'
    if (activatedBuffs[owner]) {
      relic.equippedBy = activatedBuffs[owner] as CharacterId
    }
  }
}

// ================================================== V4 ==================================================

function readCharacter(character: V4ParserCharacter, lightCones: V4ParserLightCone[]) {
  let lightCone: V4ParserLightCone | undefined
  if (lightCones) {
    // TODO: don't search on an array
    lightCone = lightCones.find((x) => x.location === character.id)
  }

  const characterId = character.id

  const lightConeId = lightCone?.id

  if (!characterId) return null

  return {
    characterId: characterId,
    characterLevel: character.level || 80,
    characterEidolon: character.eidolon || 0,
    lightCone: lightConeId ?? null,
    lightConeLevel: lightCone?.level ?? 80,
    lightConeSuperimposition: lightCone?.superimposition ?? 1,
  }
}

function readRelic(relic: V4ParserRelic, substatList: V4ParserSubstat[], scanner: KelzFormatParser): Relic {
  const part = relic.slot.replace(/\s+/g, '') as Parts

  const setId = relic.set_id
  const set = relicSetMapping[setId].name

  const enhance = Math.min(Math.max(relic.level, 0), 15)
  const grade = Math.min(Math.max(relic.rarity, 2), 5)

  const { main, substats } = readRelicStats(relic, substatList, part, grade, enhance, scanner)

  let equippedBy: CharacterId | undefined
  if (relic.location !== '') {
    const lookup = characterList.find((x) => x.id == relic.location)?.id
    if (lookup) {
      equippedBy = lookup as CharacterId
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
    verified: scanner.config.speedVerified,
    id: relic._uid,
    ageIndex: parseInt(relic._uid),
  } as unknown as Relic
}

type MainData = {
  base: number,
  step: number,
}

type Affixes = {
  affix_id: string,
  property: string,
  base: number,
  step: number,
}

function parseMainStat(relic: V4ParserRelic, part: string) {
  switch (part) {
    case 'Hands':
      return Constants.Stats.ATK
    case 'Head':
      return Constants.Stats.HP
    default:
      return mapMainStatToId(relic.mainstat)
  }
}

function readRelicStats(relic: V4ParserRelic, substatList: V4ParserSubstat[], part: string, grade: number, enhance: number, scanner: KelzFormatParser) {
  const mainStat = parseMainStat(relic, part)
  if (!mainStat) {
    throw new Error(i18next.t('importSaveTab:Import.ParserError.BadMainstat', {
      mainstat: relic.mainstat,
      part,
    }) /* `Could not parse mainstat for relic with mainstat ${relic.mainstat} and part ${part}` */)
  }
  const partId = mapPartIdToIndex(part)
  const query = `${grade}${partId}`
  const affixes: Affixes[] = Object.values(DB.getMetadata().relics.relicMainAffixes[query].affixes)

  const mainId = mapAffixIdToString(mainStat)
  const mainData: MainData = affixes.find((x) => x.property === mainId)!
  const mainValue = mainData.base + mainData.step * enhance

  const substats = substatList
    .map((s) => {
      if (!scanner.config.speedVerified) {
        return {
          stat: mapSubstatToId(s.key),
          value: s.value,
        }
      }

      if (
        s.step == undefined
        || s.count == undefined
        || s.count > Math.max(1, relic.rarity * 2 - 4)
        || s.count <= 0
        || s.step > 2 * s.count
        || s.step < 0
      ) {
        scanner.badRollInfo = true
        return {
          stat: mapSubstatToId(s.key),
          value: s.value,
        }
      }

      const { rolls, errorFlag } = rollCounter(s.count, s.step)

      if (errorFlag) scanner.badRollInfo = true

      return {
        stat: mapSubstatToId(s.key),
        value: s.value,
        rolls,
        addedRolls: s.count - 1,
      }
    })

  return {
    main: {
      stat: mainStat,
      value: Utils.truncate10000ths(mainValue * (Utils.isFlat(mainStat) ? 1 : 100)),
    },
    substats: substats,
  }
}

function mapSubstatToId(substat: string) {
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
      return null as never
  }
}

function mapMainStatToId(mainStat: string) {
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
      return null as never
  }
}

function mapAffixIdToString(affixId: string) {
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
      return null as never
  }
}

function mapPartIdToIndex(slotId: string) {
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
      return null as never
  }
}
