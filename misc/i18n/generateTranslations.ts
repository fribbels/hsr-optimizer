//@ts-ignore
import { writeFile } from "fs"
//@ts-ignore
import { readFile } from "fs/promises"
import yaml from "js-yaml"
import { TsUtils } from '../../src/lib/TsUtils'
import { betaInformation } from "./betaInformation"
import pathConfig from './AvatarBaseType.json'
import AvatarConfig from './AvatarConfig.json'
import damageConfig from './DamageType.json'
import lightconeConfig from './EquipmentConfig.json'
import relicSetConfig from './RelicSetConfig.json'
import relicEffectConfig from './RelicSetSkillConfig.json'

const precisionRound = TsUtils.precisionRound

const inputLocales = ['zh', 'de', 'en', 'es', 'fr', 'id', 'ja', 'ko', 'pt', 'ru', 'th', 'vi'] as const

const outputLocales = [...inputLocales, 'it'] as const

type InputLocale = typeof inputLocales[number]

type OutputLocale = typeof outputLocales[number]

// keys must correspond to an available textmap, values are the output locales for a given textmap
// e.g. the english textmap is used for both the english and italian gameData files
const outputLocalesMapping: Record<InputLocale, OutputLocale[]> = {
  de: ['de'],
  en: ['en', 'it'],
  es: ['es'],
  fr: ['fr'],
  id: ['id'],
  ja: ['ja'],
  ko: ['ko'],
  pt: ['pt'],
  ru: ['ru'],
  th: ['th'],
  vi: ['vi'],
  zh: ['zh'],
} as const

const tbNames: Record<InputLocale, {stelle: string; caelus: string}> = {
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
    stelle: '星',
    caelus: '穹',
  },
  th: {
    stelle: 'Stelle',
    caelus: 'Caelus',
  },
  vi: {
    stelle: 'Stelle',
    caelus: 'Caelus',
  },
} as const

const overrides: Record<InputLocale, { key: string; value: string }[]> = {
  de: [],
  en: [
    {
      key: 'Characters.1213.Name',
      value: 'Imbibitor Lunae',
    }
  ],
  es: [
    {
      key: 'Characters.1213.Name',
      value: 'Imbibitor Lunae',
    }
  ],
  fr: [],
  id: [],
  ja: [],
  ko: [],
  pt: [
    {
      key: 'Characters.1213.Name',
      value: 'Embebidor Lunae',
    }
  ],
  ru: [],
  th: [],
  zh: [],
  vi: [],
} as const

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

function cleanString(locale: string, string: string): string {
  if (!string) return ''
  if (locale !== 'ja') {
    return string
  }
  const regex = /({[^}]*})/g
  return string.replace(regex, '')
}

async function importTextmap(suffix: string) {
  const textmap = await readFile(`./misc/i18n/TextMap${suffix}.json`, 'utf-8')
  return JSON.parse(textmap)
}

async function generateTranslations() {
  for (const locale of inputLocales) {
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
        Name: avatar.AvatarID > 8000
          ? tbNames[locale][avatar.AvatarID % 2 ? 'caelus' : 'stelle']
          : cleanString(locale, textmap[avatar.AvatarName.Hash]),
      }
      if (betaInformation[locale]?.Characters) {
        for (const character of betaInformation[locale].Characters) {
          if (output.Characters[character.key]) continue
          output.Characters[character.key] = character.value
        }
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
      }
      output.Lightcones[lightcone.EquipmentID] = Lightcone
    }
    if (betaInformation[locale]?.Lightcones) {
      for (const lightcone of betaInformation[locale].Lightcones) {
        if (output.Lightcones[lightcone.id]) continue
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
      writeFile(`./public/locales/${outputLocale}/gameData.yaml`, yaml.dump(output, { lineWidth: -1, quotingType: "\"" }), (err: unknown) => {
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
  if (!overrides[locale]) return
  for (const override of overrides[locale]) {
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

// from the readme on Dim's old github repo
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

type TextMap = { [key: number]: string }

type Lightcone = {
  Name: string
  // EquipmentDesc: string
  // SkillName: string
}

await generateTranslations()
