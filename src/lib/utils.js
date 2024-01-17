import * as htmlToImage from 'html-to-image';
import DB from "./db";
import { Constants } from "./constants";

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
  screenshotElement: async (element) => {
    return await htmlToImage.toPng(element, { pixelRatio: 1.5 })
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
  precisionRound(number, precision = 8) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  },
  flipMapping: (obj) => {
    return Object.fromEntries(Object.entries(obj).map(a => a.reverse()))
  },
  clone: (obj) => {
    return structuredClone(obj)
  },
  characterNameFilterOption: (input, option) => {
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
}