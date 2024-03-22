import { domToBlob as htmlToBlob } from 'modern-screenshot'
import DB from './db'
import { Constants } from './constants.ts'
import { Message } from './message'
import { v4 as uuidv4 } from 'uuid'

console.debug = (...args) => {
  let messageConfig = '%c%s '

  args.forEach((argument) => {
    const type = typeof argument
    switch (type) {
      case 'bigint':
      case 'number':
      case 'boolean':
        messageConfig += '%d '
        break

      case 'string':
        messageConfig += '%s '
        break

      case 'object':
      case 'undefined':
      default:
        messageConfig += '%o '
    }
  })

  console.log(messageConfig, 'color: orange', '[DEBUG]', ...args)
}

export const Utils = {
  // Fill array of size n with 0s
  arrayOfZeroes: (n) => {
    return new Array(n).fill(0)
  },

  // Fill array of size n with value x
  arrayOfValue: (n, x) => {
    return new Array(n).fill(x)
  },

  mergeDefinedValues: (target, source) => {
    for (let key of Object.keys(target)) {
      if (source[key] != null) {
        target[key] = source[key]
      }
    }
    return target
  },

  mergeUndefinedValues: (target, source) => {
    for (let key of Object.keys(source)) {
      if (target[key] == null) {
        target[key] = source[key]
      }
    }
    return target
  },

  // await sleep(ms) to block
  sleep: (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },

  // Store a count of relic sets into an array indexed by the set index
  relicsToSetArrays: (relics) => {
    let relicSets = Utils.arrayOfValue(Object.values(Constants.SetsRelics).length, 0)
    let ornamentSets = Utils.arrayOfValue(Object.values(Constants.SetsOrnaments).length, 0)

    for (let relic of relics) {
      if (!relic) continue
      if (relic.part == Constants.Parts.PlanarSphere || relic.part == Constants.Parts.LinkRope) {
        let set = Constants.OrnamentSetToIndex[relic.set]
        ornamentSets[set]++
      } else {
        let set = Constants.RelicSetToIndex[relic.set]
        relicSets[set]++
      }
    }

    return {
      relicSets: relicSets,
      ornamentSets: ornamentSets,
    }
  },

  // Flat stats HP/ATK/DEF/SPD
  isFlat: (stat) => {
    return stat == Constants.Stats.HP
      || stat == Constants.Stats.ATK
      || stat == Constants.Stats.DEF
      || stat == Constants.Stats.SPD
  },

  // Random element of an array
  randomElement: (arr) => {
    return arr[Math.floor(Math.random() * arr.length)]
  },

  // Util to capture a div and screenshot it to clipboard/file
  screenshotElementById: async (elementId, action, characterName) => {
    return htmlToBlob(document.getElementById(elementId), {
      scale: 1.5,
      drawImageInterval: 0,
    }).then(async (blob) => {
      /*
       * Save to clipboard
       * This is not supported in firefox, possibly other browsers too
       */
      if (action == 'clipboard') {
        try {
          let data = [new window.ClipboardItem({ [blob.type]: blob })]
          await navigator.clipboard.write(data)
          Message.success('Copied screenshot to clipboard')
        } catch (e) {
          Message.error('Unable to save screenshot to clipboard, try the download button to the right')
        }
      }

      // Save to file
      if (action == 'download') {
        const prefix = characterName || 'Hsr-optimizer'
        const date = new Date().toLocaleDateString().replace(/[^apm\d]+/gi, '-')
        const time = new Date().toLocaleTimeString('en-GB').replace(/[^apm\d]+/gi, '-')
        const filename = `${prefix}_${date}_${time}.png`
        const fileUrl = window.URL.createObjectURL(blob)
        const anchorElement = document.createElement('a')
        anchorElement.href = fileUrl
        anchorElement.download = filename
        anchorElement.style.display = 'none'
        document.body.appendChild(anchorElement)
        anchorElement.click()
        anchorElement.remove()
        window.URL.revokeObjectURL(fileUrl)
        Message.success('Downloaded screenshot')
      }
    }).catch((e) => {
      console.error(e)
      Message.error('Unable to take screenshot, please try again')
    })
  },

  // Convert an array to an object keyed by id field
  collectById: (arr) => {
    let byId = {}
    for (let x of arr) {
      byId[x.id] = x
    }
    return byId
  },

  // truncate10ths(16.1999999312682) == 16.9
  truncate10ths: (x) => {
    return Math.floor(x * 10) / 10
  },

  // truncate100ths(16.1999999312682) == 16.99
  truncate100ths: (x) => {
    return Math.floor(x * 100) / 100
  },

  // truncate100ths(16.1999999312682) == 16.999
  truncate1000ths: (x) => {
    return Math.floor(x * 1000) / 1000
  },

  // truncate10000ths(16.1999999312682) == 16.9999
  truncate10000ths: (x) => {
    return Math.floor(x * 10000) / 10000
  },
  // Round a number to a certain precision. Useful for js floats: precisionRound(16.1999999312682. 5) == 16.2
  precisionRound(number, precision = 5) {
    let factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  },

  // Reverse an object's keys/values
  flipMapping: (obj) => {
    return Object.fromEntries(Object.entries(obj).map((a) => a.reverse()))
  },

  // Deep clone an object, different implementations have different browser performance impacts
  clone: (obj) => {
    if (!obj) return null // TODO is this a good idea
    return JSON.parse(JSON.stringify(obj))
  },

  // Used for antd's selects to allow searching by the lowercase label
  labelFilterOption: (input, option) => {
    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
  },

  // Returns body/feet/rope/sphere
  hasMainStat: (part) => {
    return part == Constants.Parts.Body || part == Constants.Parts.Feet || part == Constants.Parts.LinkRope || part == Constants.Parts.PlanarSphere
  },

  // Character selector options from current db metadata
  generateCharacterOptions: () => {
    let characterData = JSON.parse(JSON.stringify(DB.getMetadata().characters))

    for (let value of Object.values(characterData)) {
      value.value = value.id
      value.label = value.displayName
    }

    return Object.values(characterData).sort((a, b) => a.displayName.localeCompare(b.displayName))
  },

  // Light cone selector options from current db metadata
  generateLightConeOptions: (characterId) => {
    let lcData = JSON.parse(JSON.stringify(DB.getMetadata().lightCones))

    let pathFilter = null
    if (characterId) {
      let character = DB.getMetadata().characters[characterId]
      pathFilter = character.path
    }

    for (let value of Object.values(lcData)) {
      value.value = value.id
      value.label = value.name
    }

    return Object.values(lcData)
      .filter((lc) => !pathFilter || lc.path === pathFilter)
      .sort((a, b) => a.label.localeCompare(b.label))
  },

  // Character selector options from current characters with some customization parameters
  generateCurrentCharacterOptions: (currentCharacters, excludeCharacters = [], withNobodyOption = true) => {
    let characterData = DB.getMetadata().characters

    let options = currentCharacters
      .filter((character) => !excludeCharacters.includes(character))
      .map((character) => ({
        value: character.id,
        label: characterData[character.id].displayName,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))

    if (withNobodyOption) {
      options.unshift({ value: 'None', label: 'Nobody' })
    }

    return options
  },

  // Used to convert output formats for relic scorer, snake-case to camelCase
  recursiveToCamel: (item) => {
    if (Array.isArray(item)) {
      return item.map((el) => Utils.recursiveToCamel(el))
    } else if (typeof item === 'function' || item !== Object(item)) {
      return item
    }
    return Object.fromEntries(
      Object.entries(item).map(([key, value]) => [
        key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, '')),
        Utils.recursiveToCamel(value),
      ]),
    )
  },

  // Generate a random uuid
  randomId: () => {
    return uuidv4()
  },

  // 1212 => Jingliu
  getCharacterNameById: (id) => {
    return DB.getMetadata().characters[id]?.displayName
  },

  // hsr-optimizer// => hsr-optimizer
  stripTrailingSlashes: (str) => {
    return str.replace(/\/+$/, '')
  },

  // 5, 4, 3
  sortRarityDesc: (a, b) => {
    return b.rarity - a.rarity
  },
}
