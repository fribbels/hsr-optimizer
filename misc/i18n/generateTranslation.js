import { writeFile } from 'fs'
import AvatarConfig from './AvatarConfig.json' assert {type: 'json'}
import skillConfig from './AvatarSkillConfig.json' assert {type: 'json'}
import lightconeConfig from './ItemConfigEquipment.json' assert {type: 'json'}
import relicsetConfig from './RelicSetConfig.json' assert {type: 'json'}
import damageConfig from './DamageType.json' assert {type: 'json'}
import pathConfig from './AvatarBaseType.json' assert {type: 'json'}
import rankConfig from './AvatarRankConfig.json' assert {type: 'json'}
import statusConfig from './AvatarStatusConfig.json' assert {type: 'json'}
import traceConfig from './AvatarSkillTreeConfig.json' assert {type: 'json'}
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
import TextMapTH from './TextMapTH.json' assert {type: 'json'}
import TextMapVI from './TextMapVI.json' assert {type: 'json'}

const trailblazerpaths = ['Warrior', 'Knight', 'Shaman']

for (const locale of ['zh','de','en','es','fr','id','jp','kr','pt','ru','th','vi']){

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
    case 'th':
      return TextMapTH
    case 'vi':
      return TextMapVI
  }})(locale)

  const eidolons = {}
  for (const eidolon of rankConfig) {
    eidolons[eidolon.RankID] = {name: cleanString(locale,translateKey(eidolon.Name, textmap)), desc: translateKey(eidolon.Desc, textmap)}
  }

  const abilities = {}
  for (const ability of skillConfig) {
    abilities[ability.SkillID] = {
      name: cleanString(locale,textmap[ability.SkillName.Hash]),
      desc: textmap[ability.SimpleSkillDesc.Hash],
      longdesc: textmap[ability.SkillDesc.Hash]
    }
  }

  const effectslist = []
  for (const effect of statusConfig) {
    effectslist.push({
      name: textmap[effect.StatusName.Hash],
      desc: textmap[effect.StatusDesc.Hash],
      effect: textmap[effect.StatusEffect.Hash],
      source: Number(String(effect.StatusID).slice(3,-1)),
      ID: effect.StatusID
    })
  }

  const tracelist = []
  for (const trace of traceConfig) {
    if (trace.PointType == 3){
      tracelist.push({
        name: translateKey(trace.PointName, textmap) ?? 'err',
        desc: translateKey(trace.PointDesc, textmap) ?? 'err',
        owner: trace.AvatarID,
        ID: trace.PointID,
        Ascension: trace.AvatarPromotionLimit
      })
    }
  }

  const output = {Characters: {}, RelicSets: {}, Lightcones: {}, Paths: {}, Elements: {}}

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
      Effects: {},
      Traces: {
        A2: {},
        A4: {},
        A6: {}
      }
    }
    for (const effect of effectslist) {
      if(effect.source == avatar.AvatarID) {
        output.Characters[avatar.AvatarID].Effects[effect.ID] = effect
      }
    }
    for (const trace of tracelist) {
      if (trace.owner == avatar.AvatarID) {
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
    }
  }

  for (const set of relicsetConfig) {
    output.RelicSets[set.SetID] = cleanString(locale, textmap[set.SetName.Hash])
  }

  for (const lightcone of lightconeConfig) {
    output.Lightcones[lightcone.ID] = cleanString(locale, textmap[lightcone.ItemName.Hash])
  }

  for (const path of pathConfig) {
    output.Paths[path.ID] = cleanString(locale, textmap[path.BaseTypeText.Hash])
  }

  for (const element of damageConfig) {
    output.Elements[element.ID] = cleanString(locale, textmap[element.DamageTypeName.Hash])
  }

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
    th: {
      stelle: 'Stelle',
      caelus: 'Caelus'
    },
    vi: {
      stelle: 'Stelle',
      caelus: 'Caelus'
    },
  }
  if (isCaelus) return TB_NAMES[locale].caelus
  return TB_NAMES[locale].stelle
}
// shoutout to stargazer for these
function getHash(key) {
  var hash1 = 5381;
  var hash2 = 5381;
  for (let i = 0; i < key.length; i += 2)
  {
    hash1 = Math.imul((hash1 << 5) + hash1, 1) ^ key.charCodeAt(i);
    if (i === key.length - 1)
      break;
    hash2 = Math.imul((hash2 << 5) + hash2, 1) ^ key.charCodeAt(i + 1);
  }
  return Math.imul(hash1 + Math.imul(hash2, 1566083941), 1);
}

function translateHash(hash, textmap) {
    return textmap[hash]
}

function translateKey(key, textmap) {
  return translateHash(getHash(key), textmap)
}