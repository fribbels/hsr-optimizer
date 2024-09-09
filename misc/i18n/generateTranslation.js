import { writeFile } from 'fs'
import AvatarConfig from './AvatarConfig.json' assert {type: 'json'}
import skillConfig from './AvatarSkillConfig.json' assert {type: 'json'}
import lightconeConfig from './ItemConfigEquipment.json' assert {type: 'json'}
import relicsetConfig from './RelicSetConfig.json' assert {type: 'json'}
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

  const output = {characters: {}, relicsets: {}, lightcones: {}}

  for (const avatar of AvatarConfig) {
    output.characters[avatar.AvatarID] = {
      name: cleanString(locale, textmap[avatar.AvatarName.Hash]),
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

function cleanString (locale, string) {
  if (locale !== 'jp') {
    return string
  }
  const regex = /({[^}]*})/g
  return string.replace(regex, '')
}