import {writeFile} from "fs"
import { readFile } from "fs/promises"
import yaml from "js-yaml"
import { TsUtils } from '../../src/lib/TsUtils'
import { betaInformation } from "./betaInformation"
import pathConfig from './AvatarBaseType.json'
import AvatarConfig from './AvatarConfig.json'
import rankConfig from './AvatarRankConfig.json'
import skillConfig from './AvatarSkillConfig.json'
import traceConfig from './AvatarSkillTreeConfig.json' // not currently used, corresponding code not updated for typescript
import statusConfig from './AvatarStatusConfig.json' // not currently used, corresponding code not updated for typescript
import damageConfig from './DamageType.json'
import lightconeConfig from './EquipmentConfig.json'
import lightconeRankConfig from './EquipmentSkillConfig.json'
import relicSetConfig from './RelicSetConfig.json'
import relicEffectConfig from './RelicSetSkillConfig.json'

const precisionRound = TsUtils.precisionRound

const Locales = ['zh', 'de', 'en', 'es', 'fr', 'id', 'ja', 'ko', 'pt', 'ru', 'th', 'vi']

const TrailblazerPaths = ['Warrior', 'Knight', 'Shaman']

const outputLocalesMapping = {
  zh: ['zh'],
  de: ['de'],
  en: ['en'],
  es: ['es'],
  fr: ['fr'],
  id: ['id'],
  ja: ['ja'],
  ko: ['ko'],
  pt: ['pt'],
  ru: ['ru'],
  th: ['th'],
  vi: ['vi'],
}

const Overrides: {[key: string]: {key: string; value: string}[]} = {
  en: [
    {
      key: 'Characters.1213.Name',
      value: 'Imbibitor Lunae',
    }
  ]
}

function formattingFixer(string: string) {
  if (!string) return ''
  string = string.replace(/<color=#([a-f]|[0-9]){8}>/g, "</span><span style='color:#f29e38ff'>").replace(/<\/color>/g, '</span><span>')
  string = string.replace(/<unbreak>/g, "<span style='whiteSpace: \"nowrap\"'>").replace(/<\/unbreak>/g, '</span>')
  string = string.replace(/\\n/g, '<br>')
  return `<span>${string}</span>`
}

function replaceParameters(string: string, parameters: number[]) {
  if (!string) return ''
  let output = string
  for (let i = 0; i < parameters.length; i++) {
    const regexstringpercent = `#${i + 1}\\[(i|f[1-9])\\]%`
    const regexstring = `#${i + 1}\\[(i|f[1-9])\\]<`
    const regex = new RegExp(regexstring, 'g')
    const regexpercent = new RegExp(regexstringpercent, 'g')
    output = output
      .replace(regex, `${precisionRound(parameters[i])}<`)
      .replace(regexpercent, `${precisionRound(parameters[i] * 100)}%`)
  }
  return output
}

function formatEffectParameters(string: string) {
  if (!string) return ''
  let output = string
  const paramMatcher = /\[(i|f[1-9]+)\]/g
  const matches = (string.match(paramMatcher) ?? []).length
  for (let i = 0; i < matches; i++) {
    const regexstringpercent = `#${i + 1}\\[(i|f[1-9])\\]%`
    const regexstring = `#${i + 1}\\[(i|f[1-9])\\]<`
    const regex = new RegExp(regexstring, 'g')
    const regexpercent = new RegExp(regexstringpercent, 'g')
    output = output
      .replace(regex, `{{parameter${i}}}<`)
      .replace(regexpercent, `{{parameter${i}}}%`)
  }
  return output
}

function cleanString(locale: string, string: string): string {
  if (!string) return ''
  if (locale !== 'ja') {
    return string
  }
  const regex = /({[^}]*})/g
  return string.replace(regex, '')
}

async function importTextmap(suffix: string){
  const textmap = await readFile(`./misc/i18n/TextMap${suffix}.json`, 'utf-8')
  return JSON.parse(textmap)
}

async function generateTranslations(){
  for (const locale of Locales) {
    const textmap: TextMap = await (async (locale) => {
      switch (locale) { // en left as default to make typescript happy
        case 'zh':
          return await importTextmap('CHS')
        case 'de':
          return await importTextmap('DE')
        case 'es':
          return await importTextmap('ES')
        case 'fr':
          return await importTextmap('FR')
        case 'id':
          return await importTextmap('ID')
        case 'ja':
          return await importTextmap('JP')
        case 'ko':
          return await importTextmap('KR')
        case 'pt':
          return await importTextmap('PT')
        case 'ru':
          return await importTextmap('RU')
        case 'th':
          return await importTextmap('TH')
        case 'vi':
          return await importTextmap('VI')
        default:
          return await importTextmap('EN')
      }
    })(locale)

    const eidolons = {}
    for (const eidolon of rankConfig) {
      eidolons[eidolon.RankID] = {
        Name: cleanString(locale, translateKey(eidolon.Name, textmap)),
        Desc: translateKey(eidolon.Desc, textmap),
        Values: eidolon.Param.map((x) => x.Value),
      }
      eidolons[eidolon.RankID].Desc = replaceParameters(eidolons[eidolon.RankID].Desc, eidolons[eidolon.RankID].Values)
      eidolons[eidolon.RankID].Desc = formattingFixer(eidolons[eidolon.RankID].Desc.replace(/<\/*unbreak>/g, ``))
      delete eidolons[eidolon.RankID].Values
    }

    const abilities = {}
    /* @ts-expect-error ts unable to detect that skillConfig is an array*/
    for (const ability of skillConfig) {
      if (!abilities[ability.SkillID]) {
        abilities[ability.SkillID] = {
          Name: cleanString(locale, textmap[ability.SkillName.Hash]),
          Desc: formattingFixer(replaceParameters(textmap[ability.SimpleSkillDesc.Hash], ability.SimpleParamList.map((x) => x.Value))),
          Type: textmap[ability.SkillTypeDesc.Hash],
        }
      }
      /*
      switch (ability.MaxLevel) {
        case 1: {// technique / open world attack
          let parameters = ability.ParamList.map((x) => x.Value)
          let description = textmap[ability.SkillDesc.Hash]
          description = replaceParameters(description, parameters)
          abilities[ability.SkillID].LongDesc = formattingFixer(description)
        }
          break;
        case 5: {// basic attack
          if (!(ability.Level === 5 || ability.Level === 6)) break
          let parameters = ability.ParamList.map((x) => x.Value)
          let description = textmap[ability.SkillDesc.Hash]
          description = replaceParameters(description, parameters)
          if (ability.Level === 5) {
            abilities[ability.SkillID].LongDescWithoutEidolon = formattingFixer(description)
          } else {
            abilities[ability.SkillID].LongDescWithEidolon = formattingFixer(description)
          }
        }
          break;
        default: {// skill/talent/ult
          if (!(ability.Level === 10 || ability.Level === 12)) break
          let parameters = ability.ParamList.map((x) => x.Value)
          let description = textmap[ability.SkillDesc.Hash]
          if (!description) break
          description = replaceParameters(description, parameters)
          if (ability.Level === 10) {
            abilities[ability.SkillID].LongDescWithoutEidolon = formattingFixer(description)
          } else {
            abilities[ability.SkillID].LongDescWithEidolon = formattingFixer(description)
          }
        }
          break;
      } */
    }
  /*
    const effectslist: Effect[] = []
    for (const effect of statusConfig) {
      effectslist.push({
        Name: cleanString(locale, textmap[effect.StatusName.Hash]),
        Desc: formatEffectParameters(formattingFixer(textmap[effect.StatusDesc.Hash])),
        Effect: cleanString(locale, textmap[effect.StatusEffect.Hash]),
        Source: Number(String(effect.StatusID).slice(3, -1)),
        ID: effect.StatusID,
      })
    }

    const tracelist: Trace[] = []
    for (const trace of traceConfig) {
      if (trace.PointType == 3) {
        const formattedTrace: Trace = {
          Name: cleanString(locale, translateKey(trace.PointName, textmap)) ?? 'err',
          Desc: translateKey(trace.PointDesc, textmap) ?? 'err',
          Owner: trace.AvatarID,
          ID: trace.PointID,
          Ascension: trace.AvatarPromotionLimit ?? 0,
          values: trace.ParamList.map((x) => x.Value),
        }
        formattedTrace.Desc = replaceParameters(formattedTrace.Desc, formattedTrace.values ?? [])
        formattedTrace.Desc = formattingFixer(formattedTrace.Desc)
        delete formattedTrace.values
        tracelist.push(formattedTrace)
      }
    }*/

    const setEffects = {}
    for (const effect of relicEffectConfig) {
      if (!setEffects[effect.SetID]) {
        setEffects[effect.SetID] = {
          effect2pc: '',
          effect4pc: '',
        }
      }
      if (effect.RequireNum === 2) {
        setEffects[effect.SetID].effect2pc = {
          description: translateKey(effect.SkillDesc, textmap),
          values: effect.AbilityParamList.map((x) => x.Value),
        }
        setEffects[effect.SetID].effect2pc.description = replaceParameters(setEffects[effect.SetID].effect2pc.description, setEffects[effect.SetID].effect2pc.values)
        setEffects[effect.SetID].effect2pc = formattingFixer(setEffects[effect.SetID].effect2pc.description)
      } else {
        setEffects[effect.SetID].effect4pc = {
          description: translateKey(effect.SkillDesc, textmap),
          values: effect.AbilityParamList.map((x) => x.Value),
        }
        setEffects[effect.SetID].effect4pc.description = replaceParameters(setEffects[effect.SetID].effect4pc.description, setEffects[effect.SetID].effect4pc.values)
        setEffects[effect.SetID].effect4pc = formattingFixer(setEffects[effect.SetID].effect4pc.description)
      }
    }

    const output = { Characters: {}, RelicSets: {}, Lightcones: {}, Paths: {}, Elements: {} }

    for (const avatar of AvatarConfig) {
      output.Characters[avatar.AvatarID] = {
        Name: avatar.AvatarID > 8000 ? cleanString(locale, tbIdToNativeName(avatar.AvatarID, textmap, pathConfig, locale)) : cleanString(locale, textmap[avatar.AvatarName.Hash]),
        Abilities: {
          [avatar.SkillList[0]]: abilities[avatar.SkillList[0]],
          [avatar.SkillList[1]]: abilities[avatar.SkillList[1]],
          [avatar.SkillList[2]]: abilities[avatar.SkillList[2]],
          [avatar.SkillList[3]]: abilities[avatar.SkillList[3]],
          [avatar.SkillList[4]]: abilities[avatar.SkillList[4]],
          [avatar.SkillList[5]]: abilities[avatar.SkillList[5]],
        },
        Eidolons: {
          [avatar.RankIDList[0]]: eidolons[avatar.RankIDList[0]],
          [avatar.RankIDList[1]]: eidolons[avatar.RankIDList[1]],
          [avatar.RankIDList[2]]: eidolons[avatar.RankIDList[2]],
          [avatar.RankIDList[3]]: eidolons[avatar.RankIDList[3]],
          [avatar.RankIDList[4]]: eidolons[avatar.RankIDList[4]],
          [avatar.RankIDList[5]]: eidolons[avatar.RankIDList[5]],
        },
      }
      /* Effects: {},
      Traces: {
        A2: {},
        A4: {},
        A6: {}
      }
    for (const effect of effectslist) {
      if(effect.Source == avatar.AvatarID) {
        output.Characters[avatar.AvatarID].Effects[effect.ID] = effect
      }
    }
    for (const trace of tracelist) {
      if (trace.Owner == avatar.AvatarID) {
        switch (trace.Ascension) {
          case 2:
            output.Characters[avatar.AvatarID].Traces.A2 = trace
            break;
          case 4:
            output.Characters[avatar.AvatarID].Traces.A4 = trace
            break;
          case 6:
            output.Characters[avatar.AvatarID].Traces.A6 = trace
            break;
          default:
            console.log('error: trace owned but not located')
            break;
        }
      }
    } */
    }
    if (betaInformation[locale]?.Characters) {
      for (const character of betaInformation[locale].Characters) {
        if (output.Characters[character.key]) continue
        output.Characters[character.key] = character.value
      }
    }

    for (const set of relicSetConfig) {
      output.RelicSets[set.SetID] = {
        Name: cleanString(locale, textmap[set.SetName.Hash]),
        Description2pc: setEffects[set.SetID].effect2pc,
        Description4pc: setEffects[set.SetID].effect4pc,
      }
      if (set.SetID > 300) {
        delete output.RelicSets[set.SetID].Description4pc
      }
    }
    if (betaInformation[locale]?.RelicSets) {
      for (const set of betaInformation[locale].RelicSets) {
        if (output.RelicSets[set.id]) continue
        output.RelicSets[set.id] = set.value
      }
    }

    for (const lightcone of lightconeConfig) {
      const Lightcone: Lightcone = {
        Name: cleanString(locale, textmap[lightcone.EquipmentName.Hash]),
        // EquipmentDesc: cleanString(locale, textmap[lightcone.EquipmentDesc.Hash]), equipment config has a Hash but no corresponding value in textmap
        SkillName: cleanString(locale, textmap[lightconeRankConfig.filter((x) => x.SkillID == lightcone.SkillID)[0]!.SkillName.Hash]),
      }
      output.Lightcones[lightcone.EquipmentID] = Lightcone
    }
    if (betaInformation[locale]?.Lightcones) {
      for (const lightcone of betaInformation[locale].Lightcones) {
        if(output.Lightcones[lightcone.id]) continue
        output.Lightcones[lightcone.id] = lightcone.value
      }
    }

    for (const path of pathConfig) {
      output.Paths[path.ID ?? 'Unknown'] = cleanString(locale, textmap[path.BaseTypeText.Hash])
    }

    for (const element of damageConfig) {
      output.Elements[element.ID] = cleanString(locale, textmap[element.DamageTypeName.Hash])
    }

    applyOverrides(output, locale)

    for (const outputLocale of outputLocalesMapping[locale]) {
      writeFile(`./public/locales/${outputLocale}/gameData.yaml`, yaml.dump(output, {lineWidth: -1, quotingType: "\""}), (err) => {
        if (err)
          console.log(err)
        else {
          console.log(`Wrote locale ${locale} to public/locales/${outputLocale}/gameData.yaml successfully\n`)
        }
      })
    }
  }
}

function applyOverrides(output: object, locale: string) {
  if (!Overrides[locale]) return
  for (const override of Overrides[locale]) {
    const path = (override.key).split('.')
    let target = output, index = -1
    while (++index < path.length) {
      let key = path[index]
      if (index != path.length - 1) {
        target = target[key]
      } else {
        target[key] = override.value
      }
    }
  }
}

function tbIdToNativeName(id: number, textmap: TextMap, pathmap: Path[], locale: string) {
  const isCaelus = id % 2 ? true : false
  const path = ((id) => {
    const pathIndex = Math.ceil((id - 8000) / 2) - 1
    const pathT = TrailblazerPaths[pathIndex]
    let hash = 0
    for (const path of pathmap) {
      if (path.ID == pathT) {
        hash = path.BaseTypeText.Hash
      }
    }
    return textmap[hash]
  })(id)
  let nativeName = getTbName(locale, isCaelus)
  return `${nativeName} (${path})`
}


function getTbName(locale: string, isCaelus: boolean): string {
  const TB_NAMES = {
    de: {
      stelle: 'Stelle',
      caelus: 'Caelus',
    },
    en: {
      stelle: 'Stelle',
      caelus: 'Caelus',
    },
    es: {
      stelle: 'Stelle',
      caelus: 'Caelus',
    },
    fr: {
      stelle: 'Stelle',
      caelus: 'Caelus',
    },
    id: {
      stelle: 'Stelle',
      caelus: 'Caelus',
    },
    ja: {
      stelle: 'Stelle',
      caelus: 'Caelus',
    },
    ko: {
      stelle: 'Stelle',
      caelus: 'Caelus',
    },
    pt: {
      stelle: 'Stelle',
      caelus: 'Caelus',
    },
    ru: {
      stelle: 'Stelle',
      caelus: 'Caelus',
    },
    zh: {
      stelle: 'Stelle',
      caelus: 'Caelus',
    },
    th: {
      stelle: 'Stelle',
      caelus: 'Caelus',
    },
    vi: {
      stelle: 'Stelle',
      caelus: 'Caelus',
    },
  }
  if (isCaelus) return TB_NAMES[locale].caelus
  return TB_NAMES[locale].stelle
}

// from the readme on Dim's repo
function getHash(key: string) {
  var hash1 = 5381
  var hash2 = 5381
  for (let i = 0; i < key.length; i += 2) {
    hash1 = Math.imul((hash1 << 5) + hash1, 1) ^ key.charCodeAt(i)
    if (i === key.length - 1)
      break
    hash2 = Math.imul((hash2 << 5) + hash2, 1) ^ key.charCodeAt(i + 1)
  }
  return Math.imul(hash1 + Math.imul(hash2, 1566083941), 1)
}

function translateHash(hash: number, textmap: TextMap) {
  return textmap[hash]
}

function translateKey(key: string, textmap: TextMap) {
  return translateHash(getHash(key), textmap)
}

type TextMap = {[key: number]: string}

type Path = {
  "ID"?: string,
  "BaseTypeIcon": string,
  "BaseTypeIconMiddle": string,
  "BaseTypeIconSmall": string,
  "EquipmentLightMatPath": string,
  "Equipment3DTgaPath": string,
  "BaseTypeIconPathTalk": string,
  "BgPath": string,
  "BaseTypeText": {
    "Hash": number
  },
  "BaseTypeDesc": {
    "Hash": number
  },
  "FirstWordText": string
}
type Effect = {
  Name: string
  Desc: string
  Effect: string
  Source: number
  ID: number
}

type Trace = {
  Name: string
  Desc: string
  Owner: number
  ID: number
  Ascension: number
  values?: number[]
}

type Lightcone = {
  Name: string
  // EquipmentDesc: string
  SkillName: string
}

await generateTranslations()
