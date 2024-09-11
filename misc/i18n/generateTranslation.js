import { writeFile } from 'fs'
import AvatarConfig from './AvatarConfig.json' assert {type: 'json'}
import skillConfig from './AvatarSkillConfig.json' assert {type: 'json'}
import lightconeConfig from './ItemConfigEquipment.json' assert {type: 'json'}
import relicsetConfig from './RelicSetConfig.json' assert {type: 'json'}
import damageConfig from './DamageType.json' assert {type: 'json'}
import pathConfig from './AvatarBaseType.json' assert {type: 'json'}
import TextMapZH from './TextMapCHS.json' assert {type: 'json'}
import TextMapDE from './TextMapDE.json' assert {type: 'json'}
import TextMapEN from './TextMapEN.json' assert {type: 'json'}
import TextMapES from './TextMapES.json' assert {type: 'json'}
import TextMapFR from './TextMapFR.json' assert {type: 'json'}
import TextMapID from './TextMapID.json' assert {type: 'json'}
import TextMapJP from './TextMapJP.json' assert {type: 'json'}
import TextMapKR from './TextMapKR.json' assert {type: 'json'}
import TextMapPT from './TextMapPT.json' assert {type: 'json'}
import TextMapRU from './TextMapRU.json' assert {type: 'json'}

const trailblazerpaths = ['Warrior', 'Knight', 'Shaman']

for (const locale of ['zh','de','en','es','fr','id','jp','kr','pt','ru']){

  const textmap = ((locale) => {switch (locale) {
    case 'zh':
      return TextMapZH
    case 'de':
      return TextMapDE
    case 'en':
      return TextMapEN
    case 'es':
      return TextMapES
    case 'fr':
      return TextMapFR
    case 'id':
      return TextMapID
    case 'jp':
      return TextMapJP
    case 'kr':
      return TextMapKR
    case 'pt':
      return TextMapPT
    case 'ru':
      return TextMapRU
  }})(locale)

  const output = {characters: {}, relicsets: {}, lightcones: {}, paths: {}, elements: {}}

  for (const avatar of AvatarConfig) {
    output.characters[avatar.AvatarID] = {
      name: avatar.AvatarID > 8000 ? cleanString(locale, tbIdToNativeName(avatar.AvatarID, textmap, pathConfig, locale)) : cleanString(locale, textmap[avatar.AvatarName.Hash]),
      abilities: {
        [avatar.SkillList[0]]: avatar.SkillList[0],
        [avatar.SkillList[1]]: avatar.SkillList[0],
        [avatar.SkillList[2]]: avatar.SkillList[0],
        [avatar.SkillList[3]]: avatar.SkillList[0],
        [avatar.SkillList[4]]: avatar.SkillList[0],
        [avatar.SkillList[5]]: avatar.SkillList[0],
      }
    }
    for (const abilityKey of Object.keys(output.characters[avatar.AvatarID].abilities)) {
      output.characters[avatar.AvatarID].abilities[abilityKey] = ((key) => {
        for (const skill of skillConfig) {
          if(skill.SkillID == key) {
            return cleanString(locale, textmap[skill.SkillName.Hash])
          }
        }
      })(abilityKey)
    }
  }

  for (const set of relicsetConfig) {
    output.relicsets[set.SetID] = cleanString(locale, textmap[set.SetName.Hash])
  }

  for (const lightcone of lightconeConfig) {
    output.lightcones[lightcone.ID] = cleanString(locale, textmap[lightcone.ItemName.Hash])
  }

  for (const path of pathConfig) {
    output.paths[path.ID] = cleanString(locale, textmap[path.BaseTypeText.Hash])
  }

  for (const element of damageConfig) {
    output.elements[element.ID] = cleanString(locale, textmap[element.DamageTypeName.Hash])
  }

  writeFile(`TextMap${(locale == 'zh' ? 'chs' : locale).toUpperCase()}.json`, JSON.stringify(textmap), (err) => {
    if (err)
      console.log(err);
    else {
      console.log("File written successfully\n");
    }
  })

  writeFile(`../../public/locales/${locale}/gameData.json`, JSON.stringify(output), (err) => {
    if (err)
      console.log(err);
    else {
      console.log("File written successfully\n");
    }
  })
}

writeFile(`./AvatarConfig.json`, JSON.stringify(AvatarConfig), (err) => {
  if (err)
    console.log(err);
  else {
    console.log("File written successfully\n");
  }
})

writeFile(`AvatarSkillConfig.json`, JSON.stringify(skillConfig), (err) => {
  if (err)
    console.log(err);
  else {
    console.log("File written successfully\n");
  }
})

writeFile(`./ItemConfigEquipment.json`, JSON.stringify(lightconeConfig), (err) => {
  if (err)
    console.log(err);
  else {
    console.log("File written successfully\n");
  }
})

writeFile(`./RelicSetConfig.json`, JSON.stringify(relicsetConfig), (err) => {
  if (err)
    console.log(err);
  else {
    console.log("File written successfully\n");
  }
})

writeFile(`./AvatarBaseType.json`, JSON.stringify(pathConfig), (err) => {
  if (err)
    console.log(err);
  else {
    console.log("File written successfully\n");
  }
})

writeFile(`./DamageType.json`, JSON.stringify(damageConfig), (err) => {
  if (err)
    console.log(err);
  else {
    console.log("File written successfully\n");
  }
})

function cleanString (locale, string) {
  if (locale !== 'jp') {
    return string
  }
  const regex = /({[^}]*})/g
  return string.replace(regex, '')
}

function tbIdToNativeName (id, textmap, pathmap, locale) {
  const isCaelus = id % 2
  const path = ((id)=>{
    const pathIndex = Math.ceil((id - 8000) / 2) - 1
    const pathT = trailblazerpaths[pathIndex]
    let hash = ''
    for (const path of pathmap) {
      if (path.ID == pathT) {
        hash = path.BaseTypeText.Hash
      }
    }
    return textmap[hash]
  })(id)
  let nativeName = getTbName(locale, isCaelus)
  return nativeName + ' ' + '(' + path + ')'
}

function getTbName (locale, isCaelus) {
  const TB_NAMES = {
    de: {
      stelle: 'Stelle',
      caelus: 'Caelus'
    },
    en: {
      stelle: 'Stelle',
      caelus: 'Caelus'
    },
    es: {
      stelle: 'Stelle',
      caelus: 'Caelus'
    },
    fr: {
      stelle: 'Stelle',
      caelus: 'Caelus'
    },
    id: {
      stelle: 'Stelle',
      caelus: 'Caelus'
    },
    jp: {
      stelle: 'Stelle',
      caelus: 'Caelus'
    },
    kr: {
      stelle: 'Stelle',
      caelus: 'Caelus'
    },
    pt: {
      stelle: 'Stelle',
      caelus: 'Caelus'
    },
    ru: {
      stelle: 'Stelle',
      caelus: 'Caelus'
    },
    zh: {
      stelle: 'Stelle',
      caelus: 'Caelus'
    },
  }
  if (isCaelus) return TB_NAMES[locale].caelus
  return TB_NAMES[locale].stelle
}