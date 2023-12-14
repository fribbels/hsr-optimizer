import { Typography } from 'antd';
import * as htmlToImage from 'html-to-image';

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
    if (
      stat == Constants.Stats.HP ||
      stat == Constants.Stats.ATK || 
      stat == Constants.Stats.DEF || 
      stat == Constants.Stats.SPD
    ) {
      return true;
    }
    return false;
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
  }
}