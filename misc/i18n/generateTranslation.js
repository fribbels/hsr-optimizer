import { writeFile } from 'fs'
import AvatarConfig from './AvatarConfig.json' assert {type: 'json'}
import skillConfig from './AvatarSkillConfig.json' assert {type: 'json'}
import lightconeConfig from './ItemConfigEquipment.json' assert {type: 'json'}
import relicsetConfig from './RelicSetConfig.json' assert {type: 'json'}
import relicEffectConfig from './RelicSetSkillConfig.json' assert {type: 'json'}
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

function precisionRound(number) {
  const factor = Math.pow(10, 5)
  return Math.round(number * factor) / factor
}

function formattingRemover(string) {
  if (!string) return
  return string.replace(/<\/*u>|(<\/*color[^>]*>)/g, '')
}

function replaceParameters(string, parameters) {
  if (!string) return
  let output = string
  for (let i = 0; i<parameters.length; i++) {
    const regexstringpercent = `<unbreak>#${i+1}\\[(i|f[1-9])\\]%<\\/unbreak>`
    const regexstring = `<unbreak>#${i+1}\\[(i|f[1-9])\\][^%]?<\\/unbreak>`
    const regex = new RegExp(regexstring, 'g')
    const regexpercent = new RegExp(regexstringpercent, 'g')
    output = output
      .replace(regex, `${precisionRound(parameters[i])}`)
      .replace(regexpercent, `${precisionRound(parameters[i] * 100)}%`)
  }
  output = output.replace(/<\/*unbreak>/g, ``)
  return output
}

function formatEffectParameters(string) {
  if (!string) return
  let output = string
  const paramMatcher = /\[(i|f[1-9]+)\]/g
  const matches = (string.match(paramMatcher) ?? []).length
  for (let i = 0; i < matches; i++) {
    const regexstringpercent = `<unbreak>#${i+1}\\[(i|f[1-9])\\]%<\\/unbreak>`
    const regexstring = `<unbreak>#${i+1}\\[(i|f[1-9])\\][^%]?<\\/unbreak>`
    const regex = new RegExp(regexstring, 'g')
    const regexpercent = new RegExp(regexstringpercent, 'g')
    output = output
      .replace(regex, `{{parameter${i}}}`)
      .replace(regexpercent, `{{parameter${i}}}%`)
  }
  output = output.replace(/<\/*unbreak>/g, ``)
  return output
}

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
    eidolons[eidolon.RankID] = {
      Name: cleanString(locale,translateKey(eidolon.Name, textmap)),
      Desc: translateKey(eidolon.Desc, textmap),
      Values: eidolon.Param.map((x) => x.Value),
    }
    eidolons[eidolon.RankID].Desc = replaceParameters(eidolons[eidolon.RankID].Desc, eidolons[eidolon.RankID].Values)
    eidolons[eidolon.RankID].Desc = formattingRemover(eidolons[eidolon.RankID].Desc.replace(/<\/*unbreak>/g, ``))
    delete eidolons[eidolon.RankID].Values
  }

  const abilities = {}
  for (const ability of skillConfig) {
    if (!abilities[ability.SkillID]) {
      abilities[ability.SkillID] = {
      Name: cleanString(locale,textmap[ability.SkillName.Hash]),
      Desc: formattingRemover(replaceParameters(textmap[ability.SimpleSkillDesc.Hash], ability.SimpleParamList)),
      Type: textmap[ability.SkillTypeDesc.Hash],
      }
    }
    switch (ability.MaxLevel) {
      case 1: {// technique / open world attack
        let parameters = ability.ParamList.map((x) => x.Value)
        let description = textmap[ability.SkillDesc.Hash]
        description = replaceParameters(description, parameters)
        abilities[ability.SkillID].LongDesc = formattingRemover(description)
      }
        break;
      case 5: {// basic attack
        if (!(ability.Level === 5 || ability.Level === 6)) break
        let parameters = ability.ParamList.map((x) => x.Value)
        let description = textmap[ability.SkillDesc.Hash]
        description = replaceParameters(description, parameters)
        if (ability.Level === 5) {
          abilities[ability.SkillID].LongDescWithoutEidolon = formattingRemover(description)
        } else {
          abilities[ability.SkillID].LongDescWithEidolon = formattingRemover(description)
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
          abilities[ability.SkillID].LongDescWithoutEidolon = formattingRemover(description)
        } else {
          abilities[ability.SkillID].LongDescWithEidolon = formattingRemover(description)
        }
      }
        break;
    }
  }

  const effectslist = []
  for (const effect of statusConfig) {
    effectslist.push({
      Name: textmap[effect.StatusName.Hash],
      Desc: formatEffectParameters(formattingRemover(textmap[effect.StatusDesc.Hash])),
      Effect: textmap[effect.StatusEffect.Hash],
      Source: Number(String(effect.StatusID).slice(3,-1)),
      ID: effect.StatusID
    })
  }

  const tracelist = []
  for (const trace of traceConfig) {
    if (trace.PointType == 3){
      const formattedTrace = {
        Name: translateKey(trace.PointName, textmap) ?? 'err',
        Desc: translateKey(trace.PointDesc, textmap) ?? 'err',
        Owner: trace.AvatarID,
        ID: trace.PointID,
        Ascension: trace.AvatarPromotionLimit,
        values: trace.ParamList.map((x) => x.Value),
      }
      formattedTrace.Desc = replaceParameters(formattedTrace.Desc, formattedTrace.values)
      formattedTrace.Desc = formattingRemover(formattedTrace.Desc.replace(/<\/*unbreak>/g, ``))
      delete formattedTrace.values
      tracelist.push(formattedTrace)
    }
  }

  const setEffects = {}
  for (const effect of relicEffectConfig) {
    if (!setEffects[effect.SetID]) {
      setEffects[effect.SetID] = {
        effect2pc: '',
        effect4pc: ''
      }
    }
    if (effect.RequireNum === 2) {
      setEffects[effect.SetID].effect2pc = {
        description: translateKey(effect.SkillDesc, textmap),
        values: effect.AbilityParamList.map((x) => x.Value)
      }
      setEffects[effect.SetID].effect2pc.description = replaceParameters(setEffects[effect.SetID].effect2pc.description, setEffects[effect.SetID].effect2pc.values)
      setEffects[effect.SetID].effect2pc = formattingRemover(setEffects[effect.SetID].effect2pc.description)
    } else {
      setEffects[effect.SetID].effect4pc = {
        description: translateKey(effect.SkillDesc, textmap),
        values: effect.AbilityParamList.map((x) => x.Value)
      }
      setEffects[effect.SetID].effect4pc.description = replaceParameters(setEffects[effect.SetID].effect4pc.description, setEffects[effect.SetID].effect4pc.values)
      setEffects[effect.SetID].effect4pc = formattingRemover(setEffects[effect.SetID].effect4pc.description)
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
    }
  }

  for (const set of relicsetConfig) {
    output.RelicSets[set.SetID] = {
      Name: cleanString(locale, textmap[set.SetName.Hash]),
      Description2pc: setEffects[set.SetID].effect2pc,
      Description4pc: setEffects[set.SetID].effect4pc,
    }
    if (set.SetID > 300) {
      delete output.RelicSets[set.SetID].Description4pc
    }
  }

  for (const lightcone of lightconeConfig) {
    output.Lightcones[lightcone.ID] = {
      Name: cleanString(locale, textmap[lightcone.ItemName.Hash])
    }
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
// from the readme on Dim's repo
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