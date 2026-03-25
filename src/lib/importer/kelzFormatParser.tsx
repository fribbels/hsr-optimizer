import gameData from 'data/game_data.json' with { type: 'json' }
import i18next from 'i18next'
import {
  Constants,
  PathNames,
} from 'lib/constants/constants'
import type {
  MainStats,
  Parts,
  PathName,
  Sets,
  SubStats,
} from 'lib/constants/constants'
import { rollCounter } from 'lib/importer/characterConverter'
import type { ScannerConfig } from 'lib/importer/importConfig'
import { Message } from 'lib/interactions/message'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { isVersionOutdated } from 'lib/utils/miscUtils'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { Form } from 'types/form'
import type {
  Relic,
  RelicSubstatMetadata,
  UnaugmentedRelic,
} from 'types/relic'
import { isFlat } from 'lib/utils/statUtils'
import { truncate10000ths } from 'lib/utils/mathUtils'

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
  preview_substats?: V4ParserSubstat[],
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

function filterNullWithWarn<T>(label: string) {
  return (item: T | null | undefined): item is T => {
    if (!item) {
      console.warn(`Could not parse ${label}`)
      return false
    }
    return true
  }
}

export type ScannerParserJson = {
  source: string,
  build: string,
  version: number,
  metadata: {
    uid: number,
    trailblazer: 'Stelle' | 'Caelus',
    current_trailblazer_path?: PathName,
  },
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
    const isOutOfDate = isVersionOutdated(buildVersion, this.config.latestBuildVersion)

    if (isOutOfDate) {
      console.log(`Current: ${buildVersion}, Latest: ${this.config.latestBuildVersion}`)
      Message.warning(
        (
          <div>
            {/* `Your scanner version ${buildVersion} is out of date and may result in incorrect imports! Please update to the latest version from Github:` */}
            {tError('OutdatedVersion', { buildVersion })}{' '}
            <a target='_blank' style={{ color: '#3f8eff' }} href={this.config.releases} rel='noreferrer'>{this.config.releases}</a>
          </div>
        ),
        15,
      )
    }

    parsed.metadata.trailblazer = json.metadata.trailblazer || 'Stelle'
    parsed.metadata.current_trailblazer_path = json.metadata.current_trailblazer_path ?? PathNames.Destruction

    // Reset bad roll info
    this.badRollInfo = false

    const activatedBuffs = getActivatedBuffs(json.characters)

    if (json.relics) {
      parsed.relics = json.relics
        .map((r) => {
          try {
            return this.parseRelic(r, activatedBuffs)
          } catch (e) {
            console.warn('Failed to parse relic, skipping', r._uid, e)
            return null
          }
        })
        .filter((r): r is Relic => r !== null)
    }
    // "Scanner file is outdated / may contain invalid information. Please update your scanner."
    if (this.badRollInfo) {
      Message.warning(tWarning('BadRollInfo'), 10)
    }

    if (json.characters) {
      parsed.characters = json.characters
        .map((c) => this.parseCharacter(c, activatedBuffs, json.light_cones))
        .filter(filterNullWithWarn('character'))
    }

    return parsed
  }

  parseRelic(parserRelic: V4ParserRelic, activatedBuffs: Record<string, CharacterId>, substatListOverride?: V4ParserSubstat[]) {
    const unaugmented = readRelic(parserRelic, substatListOverride ?? parserRelic.substats, this)
    if (!unaugmented) return null
    const relic = RelicAugmenter.augment(unaugmented)

    if (relic === null) return null

    const owner = relic.equippedBy ?? 'NONE'
    if (activatedBuffs[owner]) {
      relic.equippedBy = activatedBuffs[owner]
    }

    return relic
  }

  parseCharacter(character: V4ParserCharacter, activatedBuffs: Record<string, CharacterId>, lightCones: V4ParserLightCone[]) {
    const parsed = readCharacter(character, lightCones) as Form | null

    const id = parsed?.characterId
    if (id && activatedBuffs[id]) {
      parsed.characterId = activatedBuffs[id]
    }

    return parsed
  }
}

function generateBuffedCharacterIdMap() {
  // id of buffed characters follows the layout `${unbuffedId}b${buffRevision}`
  // where unbuffedId is a 4 digit identifier
  const buffedChars = (Object.keys(gameData.characters) as CharacterId[]).filter((id) => id.at(4) === 'b')
  return buffedChars.reduce((record, id) => {
    const unbuffedId = id.replace(/b\d+/g, '') as CharacterId
    record[unbuffedId] = id
    return record
  }, {} as Partial<Record<CharacterId, CharacterId>>)
}

export const buffedCharacters = generateBuffedCharacterIdMap()

export function getMappedCharacterId(character: V4ParserCharacter): CharacterId {
  const id = character.id as CharacterId
  const abilityVersion = character.ability_version
  if (abilityVersion == null && buffedCharacters[id]) {
    // We don't have a defined abilityVersion in this case, assume buffed version
    return buffedCharacters[id]
  } else if (abilityVersion != null && abilityVersion > 0 && buffedCharacters[id]) {
    // When it is defined, only apply the buff when abilityVersion is explicitly not set to 0
    return buffedCharacters[id]
  }

  return id
}

export function getActivatedBuffs(rawCharacters: V4ParserCharacter[]): Record<string, CharacterId> {
  const activatedBuffs: Record<string, CharacterId> = {}
  for (const character of rawCharacters) {
    const id = character.id
    const mappedId = getMappedCharacterId(character)
    if (mappedId !== id) {
      activatedBuffs[id] = mappedId
    }
  }

  return activatedBuffs
}

// ================================================== V4 ==================================================

function readCharacter(character: V4ParserCharacter, lightCones: V4ParserLightCone[]) {
  if (!character.id) return null

  const lightCone = lightCones?.find((x) => x.location === character.id)

  return {
    characterId: character.id,
    characterLevel: character.level || 80,
    characterEidolon: character.eidolon || 0,
    lightCone: lightCone?.id ?? null,
    lightConeLevel: lightCone?.level ?? 80,
    lightConeSuperimposition: lightCone?.superimposition ?? 1,
  }
}

function readRelic(parserRelic: V4ParserRelic, substatList: V4ParserSubstat[], scanner: KelzFormatParser): UnaugmentedRelic | null {
  const part = parserRelic.slot.replace(/\s+/g, '') as Parts

  const setId = parserRelic.set_id
  const setEntry = relicSetMapping[setId]
  if (!setEntry) {
    console.warn('Unknown relic set_id, skipping:', setId)
    return null
  }
  const set = setEntry.name

  const enhance = Math.min(Math.max(parserRelic.level, 0), 15)
  const grade = Math.min(Math.max(parserRelic.rarity, 2), 5)

  const { main, substats } = readRelicStats(parserRelic, substatList, part, grade, enhance, scanner)

  let equippedBy: CharacterId | undefined
  if (parserRelic.location !== '') {
    const lookup = characterList.find((x) => x.id === parserRelic.location)?.id
    if (lookup) {
      equippedBy = lookup as CharacterId
    }
  }

  const previewSubstats: RelicSubstatMetadata[] = parserRelic.preview_substats?.map((s) => ({
    stat: mapSubstatToId(s.key),
    value: s.value,
    addedRolls: 0,
    rolls: {
      high: s.step === 2 ? 1 : 0,
      mid: s.step === 1 ? 1 : 0,
      low: s.step === 0 ? 1 : 0,
    },
  })) ?? []

  const relic: UnaugmentedRelic = {
    part,
    set,
    enhance,
    grade,
    main,
    substats,
    previewSubstats,
    equippedBy,
    verified: scanner.config.speedVerified,
    id: parserRelic._uid,
    ageIndex: parseInt(parserRelic._uid),
  }

  return relic
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
  const affixes: Affixes[] = Object.values(getGameMetadata().relics.relicMainAffixes[query].affixes)

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
      value: truncate10000ths(mainValue * (isFlat(mainStat) ? 1 : 100)),
    },
    substats: substats,
  }
}

const substatLookup: Record<string, SubStats> = {
  'ATK': Constants.Stats.ATK,
  'HP': Constants.Stats.HP,
  'DEF': Constants.Stats.DEF,
  'ATK_': Constants.Stats.ATK_P,
  'HP_': Constants.Stats.HP_P,
  'DEF_': Constants.Stats.DEF_P,
  'SPD': Constants.Stats.SPD,
  'CRIT Rate_': Constants.Stats.CR,
  'CRIT DMG_': Constants.Stats.CD,
  'Effect Hit Rate_': Constants.Stats.EHR,
  'Effect RES_': Constants.Stats.RES,
  'Break Effect_': Constants.Stats.BE,
}

function mapSubstatToId(substat: string) {
  return substatLookup[substat] ?? null as never
}

const mainStatLookup: Record<string, MainStats> = {
  'ATK': Constants.Stats.ATK_P,
  'HP': Constants.Stats.HP_P,
  'DEF': Constants.Stats.DEF_P,
  'SPD': Constants.Stats.SPD,
  'CRIT Rate': Constants.Stats.CR,
  'CRIT DMG': Constants.Stats.CD,
  'Effect Hit Rate': Constants.Stats.EHR,
  'Break Effect': Constants.Stats.BE,
  'Energy Regeneration Rate': Constants.Stats.ERR,
  'Outgoing Healing Boost': Constants.Stats.OHB,
  'Physical DMG Boost': Constants.Stats.Physical_DMG,
  'Fire DMG Boost': Constants.Stats.Fire_DMG,
  'Ice DMG Boost': Constants.Stats.Ice_DMG,
  'Lightning DMG Boost': Constants.Stats.Lightning_DMG,
  'Wind DMG Boost': Constants.Stats.Wind_DMG,
  'Quantum DMG Boost': Constants.Stats.Quantum_DMG,
  'Imaginary DMG Boost': Constants.Stats.Imaginary_DMG,
}

function mapMainStatToId(mainStat: string) {
  return mainStatLookup[mainStat] ?? null as never
}

const affixIdLookup: Record<string, string> = {
  [Constants.Stats.HP_P]: 'HPAddedRatio',
  [Constants.Stats.ATK_P]: 'AttackAddedRatio',
  [Constants.Stats.DEF_P]: 'DefenceAddedRatio',
  [Constants.Stats.HP]: 'HPDelta',
  [Constants.Stats.ATK]: 'AttackDelta',
  [Constants.Stats.DEF]: 'DefenceDelta',
  [Constants.Stats.SPD]: 'SpeedDelta',
  [Constants.Stats.CD]: 'CriticalDamageBase',
  [Constants.Stats.CR]: 'CriticalChanceBase',
  [Constants.Stats.EHR]: 'StatusProbabilityBase',
  [Constants.Stats.RES]: 'StatusResistanceBase',
  [Constants.Stats.BE]: 'BreakDamageAddedRatioBase',
  [Constants.Stats.ERR]: 'SPRatioBase',
  [Constants.Stats.OHB]: 'HealRatioBase',
  [Constants.Stats.Physical_DMG]: 'PhysicalAddedRatio',
  [Constants.Stats.Fire_DMG]: 'FireAddedRatio',
  [Constants.Stats.Ice_DMG]: 'IceAddedRatio',
  [Constants.Stats.Lightning_DMG]: 'ThunderAddedRatio',
  [Constants.Stats.Wind_DMG]: 'WindAddedRatio',
  [Constants.Stats.Quantum_DMG]: 'QuantumAddedRatio',
  [Constants.Stats.Imaginary_DMG]: 'ImaginaryAddedRatio',
}

function mapAffixIdToString(affixId: string) {
  return affixIdLookup[affixId] ?? null as never
}

const partIdLookup: Record<string, number> = {
  [Constants.Parts.Head]: 1,
  [Constants.Parts.Hands]: 2,
  [Constants.Parts.Body]: 3,
  [Constants.Parts.Feet]: 4,
  [Constants.Parts.PlanarSphere]: 5,
  [Constants.Parts.LinkRope]: 6,
}

function mapPartIdToIndex(slotId: string) {
  return partIdLookup[slotId] ?? null as never
}
