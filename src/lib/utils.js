import { toBlob as htmlToBlob } from 'html-to-image';
import DB from "./db";
import { Constants } from "./constants.ts";
import { Message } from "./message";

export const Utils = {
  arrayOfZeroes: (n) => {
    return new Array(n).fill(0);
  },
  arrayOfValue: (n, x) => {
    return new Array(n).fill(x);
  },
  sleep: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
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
      ornamentSets: ornamentSets
    }
  },
  isFlat: (stat) => {
    return stat == Constants.Stats.HP ||
      stat == Constants.Stats.ATK ||
      stat == Constants.Stats.DEF ||
      stat == Constants.Stats.SPD;
  },
  randomElement: (arr) => {
    return arr[Math.floor(Math.random() * arr.length)]
  },
  screenshotElementById: async (elementId, action, characterName) => {
    return htmlToBlob(document.getElementById(elementId), { pixelRatio: 1.5 }).then(async (blob) => {
      // Save to clipboard
      // This is not supported in firefox, possibly other browsers too
      if (action == 'clipboard') {
        try {
          let data = [new window.ClipboardItem({ [blob.type]: blob })];
          await navigator.clipboard.write(data)
          Message.success('Copied screenshot to clipboard')
        } catch (e) {
          console.error('Unable to save screenshot to clipboard')
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
  truncate10ths: (x) => {
    return Math.floor(x * 10) / 10
  },
  collectById: (arr) => {
    let byId = {}
    for (let x of arr) {
      byId[x.id] = x
    }
    return byId
  },
  truncate10000ths: (x) => {
    return Math.floor(x * 10000) / 10000
  },
  precisionRound(number, precision = 5) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  },
  flipMapping: (obj) => {
    return Object.fromEntries(Object.entries(obj).map(a => a.reverse()))
  },
  clone: (obj) => {
    if (!obj) return null // TODO is this a good idea
    return JSON.parse(JSON.stringify(obj))
  },
  labelFilterOption: (input, option) => {
    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
  },
  hasMainStat: (part) => {
    return part == Constants.Parts.Body || part == Constants.Parts.Feet || part == Constants.Parts.LinkRope || part == Constants.Parts.PlanarSphere
  },
  generateCharacterOptions: () => {
    let characterData = JSON.parse(JSON.stringify(DB.getMetadata().characters));

    for (let value of Object.values(characterData)) {
      value.value = value.id;
      value.label = value.displayName;
    }

    return Object.values(characterData).sort((a, b) => a.label.localeCompare(b.label))
  },
  generateLightConeOptions: () => {
    let lcData = JSON.parse(JSON.stringify(DB.getMetadata().lightCones));

    for (let value of Object.values(lcData)) {
      value.value = value.id;
      value.label = value.name;
    }

    return Object.values(lcData).sort((a, b) => a.label.localeCompare(b.label))
  },
}