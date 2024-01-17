import { Constants } from "./constants";

// This is a leftover relic of the gpu experiment, all that's left is this which creates a request object to send to
// the worker threads
export const GPUOptimizer = {
  createConstants: function (
    HEIGHT,
    WIDTH,
    request,
    relics,
    character,
    relicSetAllowList,
    relicSetSolutions,
    ornamentSetSolutions,
    elementalMultipliers) {
    let cIndex = 0;
    let consts = {
      'HP_P': cIndex++, // 0
      'ATK_P': cIndex++,
      'DEF_P': cIndex++,
      'SPD_P': cIndex++,
      'HP': cIndex++,
      'ATK': cIndex++,
      'DEF': cIndex++,
      'SPD': cIndex++,
      'CD': cIndex++,
      'CR': cIndex++,
      'EHR': cIndex++,
      'RES': cIndex++,
      'BE': cIndex++,
      'ERR': cIndex++,
      'OHB': cIndex++,
      'Physical_DMG': cIndex++,
      'Fire_DMG': cIndex++,
      'Ice_DMG': cIndex++,
      'Lightning_DMG': cIndex++,
      'Wind_DMG': cIndex++,
      'Quantum_DMG': cIndex++,
      'Imaginary_DMG': cIndex++, // 21
      'part': cIndex++, // 21
      'set': cIndex++, // 21
      'maxHp': request.maxHp,
      'minHp': request.minHp,
      'maxAtk': request.maxAtk,
      'minAtk': request.minAtk,
      'maxDef': request.maxDef,
      'minDef': request.minDef,
      'maxCr': request.maxCr,
      'minCr': request.minCr,
      'maxCd': request.maxCd,
      'minCd': request.minCd,
      'maxSpd': request.maxSpd,
      'minSpd': request.minSpd,
      'maxEhr': request.maxEhr,
      'minEhr': request.minEhr,
      'maxRes': request.maxRes,
      'minRes': request.minRes,
      'maxBe': request.maxBe,
      'minBe': request.minBe,
      'maxCv': request.maxCv,
      'minCv': request.minCv,
      'maxDmg': request.maxDmg,
      'minDmg': request.minDmg,
      'maxMcd': request.maxMcd,
      'minMcd': request.minMcd,
      'minEhp': request.minEhp,
      'maxEhp': request.maxEhp,
      'buffAtk': request.buffAtk,
      'buffAtkP': request.buffAtkP,
      'buffCr': request.buffCr,
      'buffCd': request.buffCd,
      'relicsHead': relics.Head,
      'relicsHands': relics.Hands,
      'relicsBody': relics.Body,
      'relicsFeet': relics.Feet,
      'relicsPlanarSphere': relics.PlanarSphere,
      'relicsLinkRope': relics.LinkRope,
      'hSize': relics.Head.length,
      'gSize': relics.Hands.length,
      'bSize': relics.Body.length,
      'fSize': relics.Feet.length,
      'pSize': relics.PlanarSphere.length,
      'lSize': relics.LinkRope.length,
      'charBase': character.base,
      'charTrace': character.traces,
      'charLc': character.lightCone,
      'relicSetCount': Object.values(Constants.SetsRelics).length,
      'ornamentSetCount': Object.values(Constants.SetsOrnaments).length,
      'relicSetSolutions': relicSetSolutions,
      'ornamentSetSolutions': ornamentSetSolutions,
      'elementalMultipliers': elementalMultipliers,
      'HEIGHT': HEIGHT,
      'WIDTH': WIDTH
    }

    console.log('GPU Constants', consts);
    return consts;
  },
}
