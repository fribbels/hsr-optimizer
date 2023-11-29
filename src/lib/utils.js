import html2canvas from 'html2canvas';

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
    console.log(html2canvas)
    let canvas = await html2canvas(element)

    var MIME_TYPE = "image/png";
    var imgURL = canvas.toDataURL(MIME_TYPE);
    // var dlLink = document.createElement('a');
    // dlLink.download = 'relic-scorer.png';
    // dlLink.href = imgURL;
    // dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

    // document.body.appendChild(dlLink);
    // dlLink.click();
    // document.body.removeChild(dlLink);

    return imgURL
  }
}