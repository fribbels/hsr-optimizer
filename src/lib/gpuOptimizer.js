import { GPU } from 'gpu.js';
const gpu = new GPU({
  // 'mode': 'webgl2'
  mode: 'cpu'
});

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
  createKernel2: function(
    consts
  ) {
    const kernel = gpu.createKernel(function(skip) {
      let x = this.thread.y * this.constants.HEIGHT + this.thread.x + skip;
  
      let l = 0 + (x % this.constants.lSize);
      let p = 0 + (((x - l) / this.constants.lSize) % this.constants.pSize);
      let f = 0 + (((x - p * this.constants.lSize - l) / (this.constants.lSize * this.constants.pSize)) % this.constants.fSize);
      let b = 0 + (((x - f * this.constants.pSize * this.constants.lSize - p * this.constants.lSize - l) / (this.constants.lSize * this.constants.pSize * this.constants.fSize)) % this.constants.bSize);
      let g = 0 + (((x - b * this.constants.fSize * this.constants.pSize * this.constants.lSize - f * this.constants.pSize * this.constants.lSize - p * this.constants.lSize - l) / (this.constants.lSize * this.constants.pSize * this.constants.fSize * this.constants.bSize)) % this.constants.gSize);
      let h = 0 + (((x - g * this.constants.bSize * this.constants.fSize * this.constants.pSize * this.constants.lSize - b * this.constants.fSize * this.constants.pSize * this.constants.lSize - f * this.constants.pSize * this.constants.lSize - p * this.constants.lSize - l) / (this.constants.lSize * this.constants.pSize * this.constants.fSize * this.constants.bSize * this.constants.gSize)) % this.constants.hSize);
  
      let setH = this.constants.relicsHead[h][this.constants.set]
      let setG = this.constants.relicsHands[g][this.constants.set]
      let setB = this.constants.relicsBody[b][this.constants.set]
      let setF = this.constants.relicsFeet[f][this.constants.set]


      let setP = this.constants.relicsPlanarSphere[p][this.constants.set]
      let setL = this.constants.relicsLinkRope[l][this.constants.set]
      
      let relicSetIndex = setH + setB * this.constants.relicSetCount + setG * this.constants.relicSetCount * this.constants.relicSetCount + setF * this.constants.relicSetCount * this.constants.relicSetCount * this.constants.relicSetCount
      let ornamentSetIndex = setP + setL * this.constants.ornamentSetCount;

      let relicSet0 =  (1 >> (setH ^ 0)) +  (1 >> (setG ^ 0)) +  (1 >> (setB ^ 0)) +  (1 >> (setF ^ 0)) // Passerby of Wandering Cloud - 10% OHB 
      let relicSet1 =  (1 >> (setH ^ 1)) +  (1 >> (setG ^ 1)) +  (1 >> (setB ^ 1)) +  (1 >> (setF ^ 1)) // Musketeer of Wild Wheat - 12% ATK, 6% SPD
      let relicSet2 =  (1 >> (setH ^ 2)) +  (1 >> (setG ^ 2)) +  (1 >> (setB ^ 2)) +  (1 >> (setF ^ 2)) // Knight of Purity Palace - 15% DEF
      let relicSet3 =  (1 >> (setH ^ 3)) +  (1 >> (setG ^ 3)) +  (1 >> (setB ^ 3)) +  (1 >> (setF ^ 3)) // Hunter of Glacial Forest - 10% Ice DMG
      let relicSet4 =  (1 >> (setH ^ 4)) +  (1 >> (setG ^ 4)) +  (1 >> (setB ^ 4)) +  (1 >> (setF ^ 4)) // Champion of Streetwise Boxing - 10% Physical DMG
      let relicSet5 =  (1 >> (setH ^ 5)) +  (1 >> (setG ^ 5)) +  (1 >> (setB ^ 5)) +  (1 >> (setF ^ 5)) // Guard of Wuthering Snow - N/A
      let relicSet6 =  (1 >> (setH ^ 6)) +  (1 >> (setG ^ 6)) +  (1 >> (setB ^ 6)) +  (1 >> (setF ^ 6)) // Firesmith Of Lava-Forging - 10% Fire DMG
      let relicSet7 =  (1 >> (setH ^ 7)) +  (1 >> (setG ^ 7)) +  (1 >> (setB ^ 7)) +  (1 >> (setF ^ 7)) // Genius of Brilliant Stars - 10% Quantum DMG
      let relicSet8 =  (1 >> (setH ^ 8)) +  (1 >> (setG ^ 8)) +  (1 >> (setB ^ 8)) +  (1 >> (setF ^ 8)) // Band of Sizzling Thunder - 10% Lightning DMG
      let relicSet9 =  (1 >> (setH ^ 9)) +  (1 >> (setG ^ 9)) +  (1 >> (setB ^ 9)) +  (1 >> (setF ^ 9)) // Eagle of Twilight Line - 10% Wind DMG
      let relicSet10 = (1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10)) // Thief of Shooting Meteor - 16% BE, 16% BE
      let relicSet11 = (1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11)) // Wastelander of Banditry Desert - 10% Imaginary DMG
      let relicSet12 = (1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12)) // Longevous Disciple - 12% HP
      let relicSet13 = (1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13)) // Messenger Traversing Hackerspace - 6% SPD
      let relicSet14 = (1 >> (setH ^ 14)) + (1 >> (setG ^ 14)) + (1 >> (setB ^ 14)) + (1 >> (setF ^ 14)) // The Ashblazing Grand Duke - N/A
      let relicSet15 = (1 >> (setH ^ 15)) + (1 >> (setG ^ 15)) + (1 >> (setB ^ 15)) + (1 >> (setF ^ 15)) // Prisoner in Deep Confinement - 12% ATK

      let ornamentSet0 =  (1 >> (setP ^ 0)) +  (1 >> (setL ^ 0)) // Space Sealing Station - 12% ATK
      let ornamentSet1 =  (1 >> (setP ^ 1)) +  (1 >> (setL ^ 1)) // Fleet of the Ageless - 12% HP
      let ornamentSet2 =  (1 >> (setP ^ 2)) +  (1 >> (setL ^ 2)) // Pan-Cosmic Commercial Enterprise - 10% EHR
      let ornamentSet3 =  (1 >> (setP ^ 3)) +  (1 >> (setL ^ 3)) // Belobog of the Architects - 15% DEF
      let ornamentSet4 =  (1 >> (setP ^ 4)) +  (1 >> (setL ^ 4)) // Celestial Differentiator - 16% CD
      let ornamentSet5 =  (1 >> (setP ^ 5)) +  (1 >> (setL ^ 5)) // Inert Salsotto - 8% CR
      let ornamentSet6 =  (1 >> (setP ^ 6)) +  (1 >> (setL ^ 6)) // Talia: Kingdom of Banditry - 16% BE
      let ornamentSet7 =  (1 >> (setP ^ 7)) +  (1 >> (setL ^ 7)) // Sprightly Vonwacq - 5% ERR
      let ornamentSet8 =  (1 >> (setP ^ 8)) +  (1 >> (setL ^ 8)) // Rutilant Arena - 8% CR
      let ornamentSet9 =  (1 >> (setP ^ 9)) +  (1 >> (setL ^ 9)) // Broken Keel - 10% RES
      let ornamentSet10 = (1 >> (setP ^ 10)) + (1 >> (setL ^ 10)) // Firmament Frontline: Glamoth - 12% ATK
      let ornamentSet11 = (1 >> (setP ^ 11)) + (1 >> (setL ^ 11)) // Penacony, Land of the Dreams - 5% ERR

      let hp = (this.constants.charBase[this.constants.HP] + this.constants.charLc[this.constants.HP]) * 
        (
          1 
          + this.constants.relicsHead[h][this.constants.HP_P]  
          + this.constants.relicsHands[g][this.constants.HP_P] 
          + this.constants.relicsBody[b][this.constants.HP_P]  
          + this.constants.relicsFeet[f][this.constants.HP_P] 
          + this.constants.relicsPlanarSphere[p][this.constants.HP_P]
          + this.constants.relicsLinkRope[l][this.constants.HP_P]
          + this.constants.charTrace[this.constants.HP_P]
          + this.constants.charLc[this.constants.HP_P]
          + 0.12 * Math.min(1, ornamentSet1 >> 1) // Fleet of the Ageless
          + 0.12 * Math.min(1, relicSet12 >> 1) // Longevous Disciple
        ) + 
        (
          0
          + this.constants.relicsHead[h][this.constants.HP]
          + this.constants.relicsHands[g][this.constants.HP] 
          + this.constants.relicsBody[b][this.constants.HP] 
          + this.constants.relicsFeet[f][this.constants.HP] 
          + this.constants.relicsPlanarSphere[p][this.constants.HP] 
          + this.constants.relicsLinkRope[l][this.constants.HP]
          + this.constants.charTrace[this.constants.HP]
        )
  
      let atk = (this.constants.charBase[this.constants.ATK] + this.constants.charLc[this.constants.ATK]) * 
      (
        1 
        + this.constants.relicsHead[h][this.constants.ATK_P]  
        + this.constants.relicsHands[g][this.constants.ATK_P] 
        + this.constants.relicsBody[b][this.constants.ATK_P] 
        + this.constants.relicsFeet[f][this.constants.ATK_P]  
        + this.constants.relicsPlanarSphere[p][this.constants.ATK_P] 
        + this.constants.relicsLinkRope[l][this.constants.ATK_P]
        + this.constants.charTrace[this.constants.ATK_P]
        + this.constants.charLc[this.constants.ATK_P]
        + 0.12 * Math.min(1, relicSet1 >> 1) + // Musketeer of Wild Wheat
        + 0.12 * Math.min(1, relicSet15 >> 1) + // Prisoner in Deep Confinement
        + 0.12 * Math.min(1, ornamentSet0  >> 1) // Space Sealing Station
        + 0.12 * Math.min(1, ornamentSet10  >> 1) // Firmament Frontline: Glamoth
      ) + 
      (
        0
        + this.constants.relicsHead[h][this.constants.ATK]
        + this.constants.relicsHands[g][this.constants.ATK] 
        + this.constants.relicsBody[b][this.constants.ATK] 
        + this.constants.relicsFeet[f][this.constants.ATK] 
        + this.constants.relicsPlanarSphere[p][this.constants.ATK]
        + this.constants.relicsLinkRope[l][this.constants.ATK]
        + this.constants.charTrace[this.constants.ATK]
      )
        
        
      let def = (this.constants.charBase[this.constants.DEF] + this.constants.charLc[this.constants.DEF]) * 
      (
        1
        + this.constants.relicsHead[h][this.constants.DEF_P]  
        + this.constants.relicsHands[g][this.constants.DEF_P] 
        + this.constants.relicsBody[b][this.constants.DEF_P]  
        + this.constants.relicsFeet[f][this.constants.DEF_P] 
        + this.constants.relicsPlanarSphere[p][this.constants.DEF_P] 
        + this.constants.relicsLinkRope[l][this.constants.DEF_P]
        + this.constants.charTrace[this.constants.DEF_P]
        + this.constants.charLc[this.constants.DEF_P]
        + 0.15 * Math.min(1, ornamentSet3 >> 1) // Belobog of the Architects
        + 0.15 * Math.min(1, relicSet2 >> 1) // Knight of Purity Palace
      ) + 
      (
        0
        + this.constants.relicsHead[h][this.constants.DEF]  
        + this.constants.relicsHands[g][this.constants.DEF] 
        + this.constants.relicsBody[b][this.constants.DEF]  
        + this.constants.relicsFeet[f][this.constants.DEF] 
        + this.constants.relicsPlanarSphere[p][this.constants.DEF] 
        + this.constants.relicsLinkRope[l][this.constants.DEF] 
        + this.constants.charTrace[this.constants.DEF]
      )
        
      let spd = (this.constants.charBase[this.constants.SPD] + this.constants.charLc[this.constants.SPD]) * 
      (
        1
        + this.constants.relicsHead[h][this.constants.SPD_P]  
        + this.constants.relicsHands[g][this.constants.SPD_P] 
        + this.constants.relicsBody[b][this.constants.SPD_P]  
        + this.constants.relicsFeet[f][this.constants.SPD_P] 
        + this.constants.relicsPlanarSphere[p][this.constants.SPD_P] 
        + this.constants.relicsLinkRope[l][this.constants.SPD_P]
        + this.constants.charTrace[this.constants.SPD_P]
        + this.constants.charLc[this.constants.SPD_P]
        + 0.06 * Math.min(1, relicSet13 >> 1) // Messenger Traversing Hackerspace
        + 0.06 * (relicSet1 >> 2) // Musketeer of Wild Wheat
      ) + 
      (
        0
        + this.constants.relicsHead[h][this.constants.SPD]  
        + this.constants.relicsHands[g][this.constants.SPD] 
        + this.constants.relicsBody[b][this.constants.SPD] 
        + this.constants.relicsFeet[f][this.constants.SPD] 
        + this.constants.relicsPlanarSphere[p][this.constants.SPD] 
        + this.constants.relicsLinkRope[l][this.constants.SPD]
        + this.constants.charTrace[this.constants.SPD]
      )

      let crSum = this.constants.relicsHead[h][this.constants.CR] + this.constants.relicsHands[g][this.constants.CR] + this.constants.relicsBody[b][this.constants.CR] + this.constants.relicsFeet[f][this.constants.CR] + this.constants.relicsPlanarSphere[p][this.constants.CR] + this.constants.relicsLinkRope[l][this.constants.CR]
      let cdSum = this.constants.relicsHead[h][this.constants.CD] + this.constants.relicsHands[g][this.constants.CD] + this.constants.relicsBody[b][this.constants.CD] + this.constants.relicsFeet[f][this.constants.CD] + this.constants.relicsPlanarSphere[p][this.constants.CD] + this.constants.relicsLinkRope[l][this.constants.CD]
      // Inert Salsotto, Rutilant Arena
      let cr = 0.08 * Math.min(1, ornamentSet5 >> 1) + 0.08 * Math.min(1, ornamentSet8 >> 1) + this.constants.charBase[this.constants.CR] + this.constants.charLc[this.constants.CR] + this.constants.charTrace[this.constants.CR] + crSum;
      // Celestial Differentiator
      let cd = 0.16 * Math.min(1, ornamentSet4 >> 1) + this.constants.charBase[this.constants.CD] + this.constants.charLc[this.constants.CD] + this.constants.charTrace[this.constants.CD] + cdSum;
      // Pan-Cosmic Commercial Enterprise
      let ehr = 0.10 * Math.min(1, ornamentSet2 >> 1) + this.constants.charBase[this.constants.EHR] + this.constants.charLc[this.constants.EHR] + this.constants.charTrace[this.constants.EHR] + this.constants.relicsHead[h][this.constants.EHR] + this.constants.relicsHands[g][this.constants.EHR] + this.constants.relicsBody[b][this.constants.EHR] + this.constants.relicsFeet[f][this.constants.EHR] + this.constants.relicsPlanarSphere[p][this.constants.EHR] + this.constants.relicsLinkRope[l][this.constants.EHR];
      // Broken Keel
      let res = 0.10 * Math.min(1, ornamentSet9 >> 1) + this.constants.charBase[this.constants.RES] + this.constants.charLc[this.constants.RES] + this.constants.charTrace[this.constants.RES] + this.constants.relicsHead[h][this.constants.RES] + this.constants.relicsHands[g][this.constants.RES] + this.constants.relicsBody[b][this.constants.RES] + this.constants.relicsFeet[f][this.constants.RES] + this.constants.relicsPlanarSphere[p][this.constants.RES] + this.constants.relicsLinkRope[l][this.constants.RES];
      // Talia: Kingdom of Banditry, Thief of Shooting Meteor, Thief of Shooting Meteor
      let be = 0.16 * Math.min(1, ornamentSet6 >> 1) + 0.16 * Math.min(1, relicSet10 >> 1) + 0.16 * (relicSet10 >> 2) + this.constants.charBase[this.constants.BE] + this.constants.charLc[this.constants.BE] + this.constants.charTrace[this.constants.BE] + this.constants.relicsHead[h][this.constants.BE] + this.constants.relicsHands[g][this.constants.BE] + this.constants.relicsBody[b][this.constants.BE] + this.constants.relicsFeet[f][this.constants.BE] + this.constants.relicsPlanarSphere[p][this.constants.BE] + this.constants.relicsLinkRope[l][this.constants.BE];

      // Champion of Streetwise Boxing
      let physical_DMG = this.constants.elementalMultipliers[0] * (0.1 * Math.min(1, relicSet4 >> 1) + this.constants.charBase[this.constants.Physical_DMG] + this.constants.charLc[this.constants.Physical_DMG] + this.constants.charTrace[this.constants.Physical_DMG] + this.constants.relicsHead[h][this.constants.Physical_DMG] + this.constants.relicsHands[g][this.constants.Physical_DMG] + this.constants.relicsBody[b][this.constants.Physical_DMG] + this.constants.relicsFeet[f][this.constants.Physical_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Physical_DMG] + this.constants.relicsLinkRope[l][this.constants.Physical_DMG]);
      // Firesmith Of Lava-Forging
      let fire_DMG = this.constants.elementalMultipliers[1] * (0.1 * Math.min(1, relicSet6 >> 1) + this.constants.charBase[this.constants.Fire_DMG] + this.constants.charLc[this.constants.Fire_DMG] + this.constants.charTrace[this.constants.Fire_DMG] + this.constants.relicsHead[h][this.constants.Fire_DMG] + this.constants.relicsHands[g][this.constants.Fire_DMG] + this.constants.relicsBody[b][this.constants.Fire_DMG] + this.constants.relicsFeet[f][this.constants.Fire_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Fire_DMG] + this.constants.relicsLinkRope[l][this.constants.Fire_DMG]);
      // Hunter of Glacial Forest
      let ice_DMG = this.constants.elementalMultipliers[2] * (0.1 * Math.min(1, relicSet3 >> 1) + this.constants.charBase[this.constants.Ice_DMG] + this.constants.charLc[this.constants.Ice_DMG] + this.constants.charTrace[this.constants.Ice_DMG] + this.constants.relicsHead[h][this.constants.Ice_DMG] + this.constants.relicsHands[g][this.constants.Ice_DMG] + this.constants.relicsBody[b][this.constants.Ice_DMG] + this.constants.relicsFeet[f][this.constants.Ice_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Ice_DMG] + this.constants.relicsLinkRope[l][this.constants.Ice_DMG]);
      // Band of Sizzling Thunder
      let lightning_DMG = this.constants.elementalMultipliers[3] * (0.1 * Math.min(1, relicSet8 >> 1) + this.constants.charBase[this.constants.Lightning_DMG] + this.constants.charLc[this.constants.Lightning_DMG] + this.constants.charTrace[this.constants.Lightning_DMG] + this.constants.relicsHead[h][this.constants.Lightning_DMG] + this.constants.relicsHands[g][this.constants.Lightning_DMG] + this.constants.relicsBody[b][this.constants.Lightning_DMG] + this.constants.relicsFeet[f][this.constants.Lightning_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Lightning_DMG] + this.constants.relicsLinkRope[l][this.constants.Lightning_DMG]);
      // Eagle of Twilight Line
      let wind_DMG = this.constants.elementalMultipliers[4] * (0.1 * Math.min(1, relicSet9 >> 1) + this.constants.charBase[this.constants.Wind_DMG] + this.constants.charLc[this.constants.Wind_DMG] + this.constants.charTrace[this.constants.Wind_DMG] + this.constants.relicsHead[h][this.constants.Wind_DMG] + this.constants.relicsHands[g][this.constants.Wind_DMG] + this.constants.relicsBody[b][this.constants.Wind_DMG] + this.constants.relicsFeet[f][this.constants.Wind_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Wind_DMG] + this.constants.relicsLinkRope[l][this.constants.Wind_DMG]);
      // Genius of Brilliant Stars
      let quantum_DMG = this.constants.elementalMultipliers[5] * (0.1 * Math.min(1, relicSet7 >> 1) + this.constants.charBase[this.constants.Quantum_DMG] + this.constants.charLc[this.constants.Quantum_DMG] + this.constants.charTrace[this.constants.Quantum_DMG] + this.constants.relicsHead[h][this.constants.Quantum_DMG] + this.constants.relicsHands[g][this.constants.Quantum_DMG] + this.constants.relicsBody[b][this.constants.Quantum_DMG] + this.constants.relicsFeet[f][this.constants.Quantum_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Quantum_DMG] + this.constants.relicsLinkRope[l][this.constants.Quantum_DMG]);
      // Wastelander of Banditry Desert
      let imaginary_DMG = this.constants.elementalMultipliers[6] * (0.1 * Math.min(1, relicSet11 >> 1) + this.constants.charBase[this.constants.Imaginary_DMG] + this.constants.charLc[this.constants.Imaginary_DMG] + this.constants.charTrace[this.constants.Imaginary_DMG] + this.constants.relicsHead[h][this.constants.Imaginary_DMG] + this.constants.relicsHands[g][this.constants.Imaginary_DMG] + this.constants.relicsBody[b][this.constants.Imaginary_DMG] + this.constants.relicsFeet[f][this.constants.Imaginary_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Imaginary_DMG] + this.constants.relicsLinkRope[l][this.constants.Imaginary_DMG]);
  
      let elementalDmg = physical_DMG + fire_DMG + ice_DMG + lightning_DMG + wind_DMG + quantum_DMG + imaginary_DMG

      let cappedCrit = Math.min(cr + this.constants.buffCr, 1)

      let dmg = (atk + this.constants.buffAtk + (this.constants.buffAtkP * this.constants.charBase[this.constants.ATK] + this.constants.charLc[this.constants.ATK])) * (1 + cd + this.constants.buffCd) * cappedCrit * (1 + elementalDmg)
      let mcd = (atk + this.constants.buffAtk + (this.constants.buffAtkP * this.constants.charBase[this.constants.ATK] + this.constants.charLc[this.constants.ATK])) * (1 + cd + this.constants.buffCd) * (1 + elementalDmg)
      let ehp = hp / (1 - def / (def + 200 + 10 * 80))
      let cv = 100 * (crSum * 2 + cdSum)

      let result = 
        hp >= this.constants.minHp && hp <= this.constants.maxHp && 
        atk >= this.constants.minAtk && atk <= this.constants.maxAtk && 
        def >= this.constants.minDef && def <= this.constants.maxDef && 
        spd >= this.constants.minSpd && spd <= this.constants.maxSpd && 
        cr >= this.constants.minCr && cr <= this.constants.maxCr && 
        cd >= this.constants.minCd && cd <= this.constants.maxCd && 
        ehr >= this.constants.minEhr && ehr <= this.constants.maxEhr && 
        res >= this.constants.minRes && res <= this.constants.maxRes && 
        be >= this.constants.minBe && be <= this.constants.maxBe &&
        cv >= this.constants.minCv && cv <= this.constants.maxCv &&
        dmg >= this.constants.minDmg && dmg <= this.constants.maxDmg &&
        mcd >= this.constants.minMcd && be <= this.constants.maxMcd && 
        ehp >= this.constants.minEhp && ehp <= this.constants.maxEhp 
      ;

      return (result && (this.constants.relicSetSolutions[relicSetIndex] == 1) && (this.constants.ornamentSetSolutions[ornamentSetIndex] == 1)) ? 1 : 0;
      // return this.constants.relicsPlanarSphere[p][this.constants.CR] + this.constants.relicsLinkRope[l][this.constants.CR]
    }, { 
      output: [consts.HEIGHT, consts.WIDTH],
      constants: consts,
      pipeline: true,
      immutable: true,
    });
    return kernel
  },
}
