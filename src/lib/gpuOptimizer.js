import { GPU } from 'gpu.js';
const gpu = new GPU({
  // 'mode': 'webgl2'
  mode:'cpu'
});

// console.log(gpu.isGPUSupported())
console.log('!!')

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

      let relicSet0 =  (1 >> (setH ^ 0)) +  (1 >> (setG ^ 0)) +  (1 >> (setB ^ 0)) +  (1 >> (setF ^ 0))
      let relicSet1 =  (1 >> (setH ^ 1)) +  (1 >> (setG ^ 1)) +  (1 >> (setB ^ 1)) +  (1 >> (setF ^ 1))
      let relicSet2 =  (1 >> (setH ^ 2)) +  (1 >> (setG ^ 2)) +  (1 >> (setB ^ 2)) +  (1 >> (setF ^ 2))
      let relicSet3 =  (1 >> (setH ^ 3)) +  (1 >> (setG ^ 3)) +  (1 >> (setB ^ 3)) +  (1 >> (setF ^ 3))
      let relicSet4 =  (1 >> (setH ^ 4)) +  (1 >> (setG ^ 4)) +  (1 >> (setB ^ 4)) +  (1 >> (setF ^ 4))
      let relicSet5 =  (1 >> (setH ^ 5)) +  (1 >> (setG ^ 5)) +  (1 >> (setB ^ 5)) +  (1 >> (setF ^ 5))
      let relicSet6 =  (1 >> (setH ^ 6)) +  (1 >> (setG ^ 6)) +  (1 >> (setB ^ 6)) +  (1 >> (setF ^ 6))
      let relicSet7 =  (1 >> (setH ^ 7)) +  (1 >> (setG ^ 7)) +  (1 >> (setB ^ 7)) +  (1 >> (setF ^ 7))
      let relicSet8 =  (1 >> (setH ^ 8)) +  (1 >> (setG ^ 8)) +  (1 >> (setB ^ 8)) +  (1 >> (setF ^ 8))
      let relicSet9 =  (1 >> (setH ^ 9)) +  (1 >> (setG ^ 9)) +  (1 >> (setB ^ 9)) +  (1 >> (setF ^ 9))
      let relicSet10 = (1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10))
      let relicSet11 = (1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11))
      let relicSet12 = (1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12))
      let relicSet13 = (1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13))

    //   {
    //     "Belobog of the Architects": 0,
    //     "Broken Keel": 1,
    //     "Celestial Differentiator": 2,
    //     "Fleet of the Ageless": 3,
    //     "Inert Salsotto": 4,
    //     "Pan-Cosmic Commercial Enterprise": 5,
    //     "Rutilant Arena": 6,
    //     "Space Sealing Station": 7,
    //     "Sprightly Vonwacq": 8,
    //     "Talia: Kingdom of Banditry": 9
    // }

      let ornamentSet0 =  (1 >> (setP ^ 0)) +  (1 >> (setL ^ 0))
      let ornamentSet1 =  (1 >> (setP ^ 1)) +  (1 >> (setL ^ 1))
      let ornamentSet2 =  (1 >> (setP ^ 2)) +  (1 >> (setL ^ 2))
      let ornamentSet3 =  (1 >> (setP ^ 3)) +  (1 >> (setL ^ 3))
      let ornamentSet4 =  (1 >> (setP ^ 4)) +  (1 >> (setL ^ 4))
      let ornamentSet5 =  (1 >> (setP ^ 5)) +  (1 >> (setL ^ 5))
      let ornamentSet6 =  (1 >> (setP ^ 6)) +  (1 >> (setL ^ 6))
      let ornamentSet7 =  (1 >> (setP ^ 7)) +  (1 >> (setL ^ 7))
      let ornamentSet8 =  (1 >> (setP ^ 8)) +  (1 >> (setL ^ 8))
      let ornamentSet9 =  (1 >> (setP ^ 9)) +  (1 >> (setL ^ 9))



      // let hp = 1;
      // let atk = 1;
      // let def = 1;
      // let spd = 1;

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
          + 0.12 * Math.min(1, ornamentSet3 >> 1)
          + 0.12 * Math.min(1, relicSet9 >> 1)
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
        + 0.12 * Math.min(1, ornamentSet7 >> 1) + 
        + 0.12 * Math.min(1, relicSet10 >> 1)
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
        + 0.15 * Math.min(1, ornamentSet0 >> 1)
        + 0.15 * Math.min(1, relicSet6 >> 1)
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
        + 0.06 * Math.min(1, relicSet7 >> 1) 
        + 0.06 * (relicSet10 >> 2)
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

      let cr = 0.08 * Math.min(1, ornamentSet4 >> 1) + 0.08 * Math.min(1, ornamentSet6 >> 1) + this.constants.charBase[this.constants.CR] + this.constants.charLc[this.constants.CR] + this.constants.charTrace[this.constants.CR] + this.constants.relicsHead[h][this.constants.CR] + this.constants.relicsHands[g][this.constants.CR] + this.constants.relicsBody[b][this.constants.CR] + this.constants.relicsFeet[f][this.constants.CR] + this.constants.relicsPlanarSphere[p][this.constants.CR] + this.constants.relicsLinkRope[l][this.constants.CR];
      let cd = 0.16 * Math.min(1, ornamentSet2 >> 1) + this.constants.charBase[this.constants.CD] + this.constants.charLc[this.constants.CD] + this.constants.charTrace[this.constants.CD] + this.constants.relicsHead[h][this.constants.CD] + this.constants.relicsHands[g][this.constants.CD] + this.constants.relicsBody[b][this.constants.CD] + this.constants.relicsFeet[f][this.constants.CD] + this.constants.relicsPlanarSphere[p][this.constants.CD] + this.constants.relicsLinkRope[l][this.constants.CD];
      let ehr = 0.1 * Math.min(1, ornamentSet5 >> 1) + this.constants.charBase[this.constants.EHR] + this.constants.charLc[this.constants.EHR] + this.constants.charTrace[this.constants.EHR] + this.constants.relicsHead[h][this.constants.EHR] + this.constants.relicsHands[g][this.constants.EHR] + this.constants.relicsBody[b][this.constants.EHR] + this.constants.relicsFeet[f][this.constants.EHR] + this.constants.relicsPlanarSphere[p][this.constants.EHR] + this.constants.relicsLinkRope[l][this.constants.EHR];
      let res = 0.1 * Math.min(1, ornamentSet1 >> 1) + this.constants.charBase[this.constants.RES] + this.constants.charLc[this.constants.RES] + this.constants.charTrace[this.constants.RES] + this.constants.relicsHead[h][this.constants.RES] + this.constants.relicsHands[g][this.constants.RES] + this.constants.relicsBody[b][this.constants.RES] + this.constants.relicsFeet[f][this.constants.RES] + this.constants.relicsPlanarSphere[p][this.constants.RES] + this.constants.relicsLinkRope[l][this.constants.RES];
      let be = 0.16 * Math.min(1, ornamentSet9 >> 1) + 0.16 * Math.min(1, relicSet12 >> 1) + 0.16 * (relicSet12 >> 2) + this.constants.charBase[this.constants.BE] + this.constants.charLc[this.constants.BE] + this.constants.charTrace[this.constants.BE] + this.constants.relicsHead[h][this.constants.BE] + this.constants.relicsHands[g][this.constants.BE] + this.constants.relicsBody[b][this.constants.BE] + this.constants.relicsFeet[f][this.constants.BE] + this.constants.relicsPlanarSphere[p][this.constants.BE] + this.constants.relicsLinkRope[l][this.constants.BE];

      let physical_DMG = this.constants.elementalMultipliers[0] * (0.1 * Math.min(1, relicSet1 >> 1) + this.constants.charBase[this.constants.Physical_DMG] + this.constants.charLc[this.constants.Physical_DMG] + this.constants.charTrace[this.constants.Physical_DMG] + this.constants.relicsHead[h][this.constants.Physical_DMG] + this.constants.relicsHands[g][this.constants.Physical_DMG] + this.constants.relicsBody[b][this.constants.Physical_DMG] + this.constants.relicsFeet[f][this.constants.Physical_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Physical_DMG] + this.constants.relicsLinkRope[l][this.constants.Physical_DMG]);
      let fire_DMG = this.constants.elementalMultipliers[1] * (0.1 * Math.min(1, relicSet3 >> 1) + this.constants.charBase[this.constants.Fire_DMG] + this.constants.charLc[this.constants.Fire_DMG] + this.constants.charTrace[this.constants.Fire_DMG] + this.constants.relicsHead[h][this.constants.Fire_DMG] + this.constants.relicsHands[g][this.constants.Fire_DMG] + this.constants.relicsBody[b][this.constants.Fire_DMG] + this.constants.relicsFeet[f][this.constants.Fire_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Fire_DMG] + this.constants.relicsLinkRope[l][this.constants.Fire_DMG]);
      let ice_DMG = this.constants.elementalMultipliers[2] * (0.1 * Math.min(1, relicSet5 >> 1) + this.constants.charBase[this.constants.Ice_DMG] + this.constants.charLc[this.constants.Ice_DMG] + this.constants.charTrace[this.constants.Ice_DMG] + this.constants.relicsHead[h][this.constants.Ice_DMG] + this.constants.relicsHands[g][this.constants.Ice_DMG] + this.constants.relicsBody[b][this.constants.Ice_DMG] + this.constants.relicsFeet[f][this.constants.Ice_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Ice_DMG] + this.constants.relicsLinkRope[l][this.constants.Ice_DMG]);
      let lightning_DMG = this.constants.elementalMultipliers[3] * (0.1 * Math.min(1, relicSet0 >> 1) + this.constants.charBase[this.constants.Lightning_DMG] + this.constants.charLc[this.constants.Lightning_DMG] + this.constants.charTrace[this.constants.Lightning_DMG] + this.constants.relicsHead[h][this.constants.Lightning_DMG] + this.constants.relicsHands[g][this.constants.Lightning_DMG] + this.constants.relicsBody[b][this.constants.Lightning_DMG] + this.constants.relicsFeet[f][this.constants.Lightning_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Lightning_DMG] + this.constants.relicsLinkRope[l][this.constants.Lightning_DMG]);
      let wind_DMG = this.constants.elementalMultipliers[4] * (0.1 * Math.min(1, relicSet2 >> 1) + this.constants.charBase[this.constants.Wind_DMG] + this.constants.charLc[this.constants.Wind_DMG] + this.constants.charTrace[this.constants.Wind_DMG] + this.constants.relicsHead[h][this.constants.Wind_DMG] + this.constants.relicsHands[g][this.constants.Wind_DMG] + this.constants.relicsBody[b][this.constants.Wind_DMG] + this.constants.relicsFeet[f][this.constants.Wind_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Wind_DMG] + this.constants.relicsLinkRope[l][this.constants.Wind_DMG]);
      let quantum_DMG = this.constants.elementalMultipliers[5] * (0.1 * Math.min(1, relicSet4 >> 1) + this.constants.charBase[this.constants.Quantum_DMG] + this.constants.charLc[this.constants.Quantum_DMG] + this.constants.charTrace[this.constants.Quantum_DMG] + this.constants.relicsHead[h][this.constants.Quantum_DMG] + this.constants.relicsHands[g][this.constants.Quantum_DMG] + this.constants.relicsBody[b][this.constants.Quantum_DMG] + this.constants.relicsFeet[f][this.constants.Quantum_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Quantum_DMG] + this.constants.relicsLinkRope[l][this.constants.Quantum_DMG]);
      let imaginary_DMG = this.constants.elementalMultipliers[6] * (0.1 * Math.min(1, relicSet13 >> 1) + this.constants.charBase[this.constants.Imaginary_DMG] + this.constants.charLc[this.constants.Imaginary_DMG] + this.constants.charTrace[this.constants.Imaginary_DMG] + this.constants.relicsHead[h][this.constants.Imaginary_DMG] + this.constants.relicsHands[g][this.constants.Imaginary_DMG] + this.constants.relicsBody[b][this.constants.Imaginary_DMG] + this.constants.relicsFeet[f][this.constants.Imaginary_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Imaginary_DMG] + this.constants.relicsLinkRope[l][this.constants.Imaginary_DMG]);
  
      let elementalDmg = physical_DMG + fire_DMG + ice_DMG + lightning_DMG + wind_DMG + quantum_DMG + imaginary_DMG

      let cappedCrit = Math.min(cr + this.constants.buffCr, 1)

      let dmg = ((this.constants.buffAtkP + 1) * atk + this.constants.buffAtk) * (1 + cd + this.constants.buffCd) * cappedCrit * (1 + elementalDmg)
      let mcd = ((this.constants.buffAtkP + 1) * atk + this.constants.buffAtk) * (1 + cd + this.constants.buffCd) * (1 + elementalDmg)
      let ehp = hp / (1 - def / (def + 200 + 10 * 80))

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
      // dynamicArguments: true
      immutable: true,
    });
    return kernel
  },
  // createKernel: function(
  //   consts
  //   // hSize,
  //   // gSize,
  //   // bSize,
  //   // fSize,
  //   // pSize,
  //   // lSize,
  //   // relicsHead,
  //   // relicsHands,
  //   // relicsBody,
  //   // relicsFeet,
  //   // relicsPlanarSphere,
  //   // relicsLinkRope,
  //   // characterBase,
  //   // this.constants.charTrace,
  //   // characterLightCone
  //   ) {
  //   // Set constants
  //   let cIndex = 0

  //   // Create kernel
  //   const kernel = gpu.createKernel(function(skip) {
  //     let x = this.thread.y * this.constants.HEIGHT + this.thread.x + skip;
  
  //     let l = (x % this.constants.lSize);
  //     let p = (((x - l) / this.constants.lSize) % this.constants.pSize);
  //     let f = (((x - p * this.constants.lSize - l) / (this.constants.lSize * this.constants.pSize)) % this.constants.fSize);
  //     let b = (((x - f * this.constants.pSize * this.constants.lSize - p * this.constants.lSize - l) / (this.constants.lSize * this.constants.pSize * this.constants.fSize)) % this.constants.bSize);
  //     let g = (((x - b * this.constants.fSize * this.constants.pSize * this.constants.lSize - f * this.constants.pSize * this.constants.lSize - p * this.constants.lSize - l) / (this.constants.lSize * this.constants.pSize * this.constants.fSize * this.constants.bSize)) % this.constants.gSize);
  //     let h = (((x - g * this.constants.bSize * this.constants.fSize * this.constants.pSize * this.constants.lSize - b * this.constants.fSize * this.constants.pSize * this.constants.lSize - f * this.constants.pSize * this.constants.lSize - p * this.constants.lSize - l) / (this.constants.lSize * this.constants.pSize * this.constants.fSize * this.constants.bSize * this.constants.gSize)) % this.constants.hSize);
  
  //     let setH = this.constants.relicsHead[h][this.constants.set]
  //     let setG = this.constants.relicsHands[g][this.constants.set]
  //     let setB = this.constants.relicsBody[b][this.constants.set]
  //     let setF = this.constants.relicsFeet[f][this.constants.set]


  //     let setP = this.constants.relicsPlanarSphere[p][this.constants.set]
  //     let setL = this.constants.relicsLinkRope[l][this.constants.set]
      
  //     let relicSetIndex = setH + setB * this.constants.relicSetCount + setG * this.constants.relicSetCount * this.constants.relicSetCount + setF * this.constants.relicSetCount * this.constants.relicSetCount * this.constants.relicSetCount
  //     let ornamentSetIndex = setP + setL * this.constants.ornamentSetCount;

  //     // TODO: Turn set stat multipiers into an array lookup [0, 0, 0.16, 0.16] instead of bitwise shift and multiplication

  //   //   {
  //   //     "Band of Sizzling Thunder": 0,
  //   //     "Champion of Streetwise Boxing": 1,
  //   //     "Eagle of Twilight Line": 2,
  //   //     "Firesmith Of Lava-Forging": 3,
  //   //     "Genius of Brilliant Stars": 4,
  //   //     "Hunter of Glacial Forest": 5,
  //   //     "Knight of Purity Palace": 6,
  //   //     "Messenger Traversing Hackerspace": 7,
  //   //     "Guard of Wuthering Snow": 8,
  //   //     "Longevous Disciple": 9,
  //   //     "Musketeer of Wild Wheat": 10,
  //   //     "Passerby of Wandering Cloud": 11,
  //   //     "Thief of Shooting Meteor": 12,
  //   //     "Wastelander of Banditry Desert": 13
  //   // }
  //     let relicSet0 =  (1 >> (setH ^ 0)) +  (1 >> (setG ^ 0)) +  (1 >> (setB ^ 0)) +  (1 >> (setF ^ 0))
  //     let relicSet1 =  (1 >> (setH ^ 1)) +  (1 >> (setG ^ 1)) +  (1 >> (setB ^ 1)) +  (1 >> (setF ^ 1))
  //     let relicSet2 =  (1 >> (setH ^ 2)) +  (1 >> (setG ^ 2)) +  (1 >> (setB ^ 2)) +  (1 >> (setF ^ 2))
  //     let relicSet3 =  (1 >> (setH ^ 3)) +  (1 >> (setG ^ 3)) +  (1 >> (setB ^ 3)) +  (1 >> (setF ^ 3))
  //     let relicSet4 =  (1 >> (setH ^ 4)) +  (1 >> (setG ^ 4)) +  (1 >> (setB ^ 4)) +  (1 >> (setF ^ 4))
  //     let relicSet5 =  (1 >> (setH ^ 5)) +  (1 >> (setG ^ 5)) +  (1 >> (setB ^ 5)) +  (1 >> (setF ^ 5))
  //     let relicSet6 =  (1 >> (setH ^ 6)) +  (1 >> (setG ^ 6)) +  (1 >> (setB ^ 6)) +  (1 >> (setF ^ 6))
  //     let relicSet7 =  (1 >> (setH ^ 7)) +  (1 >> (setG ^ 7)) +  (1 >> (setB ^ 7)) +  (1 >> (setF ^ 7))
  //     let relicSet8 =  (1 >> (setH ^ 8)) +  (1 >> (setG ^ 8)) +  (1 >> (setB ^ 8)) +  (1 >> (setF ^ 8))
  //     let relicSet9 =  (1 >> (setH ^ 9)) +  (1 >> (setG ^ 9)) +  (1 >> (setB ^ 9)) +  (1 >> (setF ^ 9))
  //     let relicSet10 = (1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10))
  //     let relicSet11 = (1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11))
  //     let relicSet12 = (1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12))
  //     let relicSet13 = (1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13))

  //   //   {
  //   //     "Belobog of the Architects": 0,
  //   //     "Broken Keel": 1,
  //   //     "Celestial Differentiator": 2,
  //   //     "Fleet of the Ageless": 3,
  //   //     "Inert Salsotto": 4,
  //   //     "Pan-Cosmic Commercial Enterprise": 5,
  //   //     "Rutilant Arena": 6,
  //   //     "Space Sealing Station": 7,
  //   //     "Sprightly Vonwacq": 8,
  //   //     "Talia: Kingdom of Banditry": 9
  //   // }

  //     let ornamentSet0 =  (1 >> (setP ^ 0)) +  (1 >> (setL ^ 0))
  //     let ornamentSet1 =  (1 >> (setP ^ 1)) +  (1 >> (setL ^ 1))
  //     let ornamentSet2 =  (1 >> (setP ^ 2)) +  (1 >> (setL ^ 2))
  //     let ornamentSet3 =  (1 >> (setP ^ 3)) +  (1 >> (setL ^ 3))
  //     let ornamentSet4 =  (1 >> (setP ^ 4)) +  (1 >> (setL ^ 4))
  //     let ornamentSet5 =  (1 >> (setP ^ 5)) +  (1 >> (setL ^ 5))
  //     let ornamentSet6 =  (1 >> (setP ^ 6)) +  (1 >> (setL ^ 6))
  //     let ornamentSet7 =  (1 >> (setP ^ 7)) +  (1 >> (setL ^ 7))
  //     let ornamentSet8 =  (1 >> (setP ^ 8)) +  (1 >> (setL ^ 8))
  //     let ornamentSet9 =  (1 >> (setP ^ 9)) +  (1 >> (setL ^ 9))

  //     // final int crSet = min(1, setSolutionBitMasks[setIndex] & (1 << 8)) + min(1, setSolutionBitMasks[setIndex] & (1 << 9)) + min(1, setSolutionBitMasks[setIndex] & (1 << 10));

  //     let hp = (this.constants.charBase[this.constants.HP] + this.constants.charLc[this.constants.HP]) * 
  //       (
  //         1 
  //         + this.constants.relicsHead[h][this.constants.HP_P]  
  //         + this.constants.relicsHands[g][this.constants.HP_P] 
  //         + this.constants.relicsBody[b][this.constants.HP_P]  
  //         + this.constants.relicsFeet[f][this.constants.HP_P] 
  //         + this.constants.relicsPlanarSphere[p][this.constants.HP_P]
  //         + this.constants.relicsLinkRope[l][this.constants.HP_P]
  //         + this.constants.charTrace[this.constants.HP_P]
  //         + 0.15 * (ornamentSet3 >> 1)
  //         + 0.12 * (relicSet8 >> 1)
  //       ) + 
  //       (
  //         0
  //         + this.constants.relicsHead[h][this.constants.HP]
  //         + this.constants.relicsHands[g][this.constants.HP] 
  //         + this.constants.relicsBody[b][this.constants.HP] 
  //         + this.constants.relicsFeet[f][this.constants.HP] 
  //         + this.constants.relicsPlanarSphere[p][this.constants.HP] 
  //         + this.constants.relicsLinkRope[l][this.constants.HP]
  //         + this.constants.charTrace[this.constants.HP]
  //       )
  
  //     let atk = (this.constants.charBase[this.constants.ATK] + this.constants.charLc[this.constants.ATK]) * 
  //     (
  //       1 
  //       + this.constants.relicsHead[h][this.constants.ATK_P]  
  //       + this.constants.relicsHands[g][this.constants.ATK_P] 
  //       + this.constants.relicsBody[b][this.constants.ATK_P] 
  //       + this.constants.relicsFeet[f][this.constants.ATK_P]  
  //       + this.constants.relicsPlanarSphere[p][this.constants.ATK_P] 
  //       + this.constants.relicsLinkRope[l][this.constants.ATK_P]
  //       + this.constants.charTrace[this.constants.ATK_P] 
  //       + 0.12 * (ornamentSet7 >> 1) + 
  //       + 0.12 * (relicSet10 >> 1)
  //     ) + 
  //     (
  //       0
  //       + this.constants.relicsHead[h][this.constants.ATK]
  //       + this.constants.relicsHands[g][this.constants.ATK] 
  //       + this.constants.relicsBody[b][this.constants.ATK] 
  //       + this.constants.relicsFeet[f][this.constants.ATK] 
  //       + this.constants.relicsPlanarSphere[p][this.constants.ATK]
  //       + this.constants.relicsLinkRope[l][this.constants.ATK]
  //       + this.constants.charTrace[this.constants.ATK]
  //     )
        
        
  //     let def = (this.constants.charBase[this.constants.DEF] + this.constants.charLc[this.constants.DEF]) * 
  //     (
  //       1
  //       + this.constants.relicsHead[h][this.constants.DEF_P]  
  //       + this.constants.relicsHands[g][this.constants.DEF_P] 
  //       + this.constants.relicsBody[b][this.constants.DEF_P]  
  //       + this.constants.relicsFeet[f][this.constants.DEF_P] 
  //       + this.constants.relicsPlanarSphere[p][this.constants.DEF_P] 
  //       + this.constants.relicsLinkRope[l][this.constants.DEF_P]
  //       + this.constants.charTrace[this.constants.DEF_P]
  //       + 0.15 * (ornamentSet0 >> 1)
  //       + 0.12 * (relicSet7 >> 1)
  //     ) + 
  //     (
  //       0
  //       + this.constants.relicsHead[h][this.constants.DEF]  
  //       + this.constants.relicsHands[g][this.constants.DEF] 
  //       + this.constants.relicsBody[b][this.constants.DEF]  
  //       + this.constants.relicsFeet[f][this.constants.DEF] 
  //       + this.constants.relicsPlanarSphere[p][this.constants.DEF] 
  //       + this.constants.relicsLinkRope[l][this.constants.DEF] 
  //       + this.constants.charTrace[this.constants.DEF]
  //     )
        
  //     let spd = (this.constants.charBase[this.constants.SPD] + this.constants.charLc[this.constants.SPD]) * 
  //     (
  //       1
  //       + this.constants.relicsHead[h][this.constants.SPD_P]  
  //       + this.constants.relicsHands[g][this.constants.SPD_P] 
  //       + this.constants.relicsBody[b][this.constants.SPD_P]  
  //       + this.constants.relicsFeet[f][this.constants.SPD_P] 
  //       + this.constants.relicsPlanarSphere[p][this.constants.SPD_P] 
  //       + this.constants.relicsLinkRope[l][this.constants.SPD_P]
  //       + this.constants.charTrace[this.constants.SPD_P] 
  //       + 0.06 * (relicSet9 >> 1) 
  //       + 0.06 * (relicSet10 >> 2)
  //     ) + 
  //     (
  //       0
  //       + this.constants.relicsHead[h][this.constants.SPD]  
  //       + this.constants.relicsHands[g][this.constants.SPD] 
  //       + this.constants.relicsBody[b][this.constants.SPD] 
  //       + this.constants.relicsFeet[f][this.constants.SPD] 
  //       + this.constants.relicsPlanarSphere[p][this.constants.SPD] 
  //       + this.constants.relicsLinkRope[l][this.constants.SPD]
  //       + this.constants.charTrace[this.constants.SPD]
  //     )

  //     let cr = 0.08 * (ornamentSet4 >> 1) + 0.08 * (ornamentSet6 >> 1) + this.constants.charBase[this.constants.CR] + this.constants.charLc[this.constants.CR] + this.constants.charTrace[this.constants.CR] + this.constants.relicsHead[h][this.constants.CR] + this.constants.relicsHands[g][this.constants.CR] + this.constants.relicsBody[b][this.constants.CR] + this.constants.relicsFeet[f][this.constants.CR] + this.constants.relicsPlanarSphere[p][this.constants.CR] + this.constants.relicsLinkRope[l][this.constants.CR];
  //     let cd = 0.16 * (ornamentSet2 >> 1) + this.constants.charBase[this.constants.CD] + this.constants.charLc[this.constants.CD] + this.constants.charTrace[this.constants.CD] + this.constants.relicsHead[h][this.constants.CD] + this.constants.relicsHands[g][this.constants.CD] + this.constants.relicsBody[b][this.constants.CD] + this.constants.relicsFeet[f][this.constants.CD] + this.constants.relicsPlanarSphere[p][this.constants.CD] + this.constants.relicsLinkRope[l][this.constants.CD];
  //     let ehr = 0.1 * (ornamentSet5 >> 1) + this.constants.charBase[this.constants.EHR] + this.constants.charLc[this.constants.EHR] + this.constants.charTrace[this.constants.EHR] + this.constants.relicsHead[h][this.constants.EHR] + this.constants.relicsHands[g][this.constants.EHR] + this.constants.relicsBody[b][this.constants.EHR] + this.constants.relicsFeet[f][this.constants.EHR] + this.constants.relicsPlanarSphere[p][this.constants.EHR] + this.constants.relicsLinkRope[l][this.constants.EHR];
  //     let res = 0.1 * (ornamentSet1 >> 1) + this.constants.charBase[this.constants.RES] + this.constants.charLc[this.constants.RES] + this.constants.charTrace[this.constants.RES] + this.constants.relicsHead[h][this.constants.RES] + this.constants.relicsHands[g][this.constants.RES] + this.constants.relicsBody[b][this.constants.RES] + this.constants.relicsFeet[f][this.constants.RES] + this.constants.relicsPlanarSphere[p][this.constants.RES] + this.constants.relicsLinkRope[l][this.constants.RES];
  //     let be = 0.16 * (ornamentSet9 >> 1) + 0.16 * (relicSet12 >> 1) + 0.16 * (relicSet12 >> 2) + this.constants.charBase[this.constants.BE] + this.constants.charLc[this.constants.BE] + this.constants.charTrace[this.constants.BE] + this.constants.relicsHead[h][this.constants.BE] + this.constants.relicsHands[g][this.constants.BE] + this.constants.relicsBody[b][this.constants.BE] + this.constants.relicsFeet[f][this.constants.BE] + this.constants.relicsPlanarSphere[p][this.constants.BE] + this.constants.relicsLinkRope[l][this.constants.BE];

  //     // let err = 0.05 * (ornamentSet8 >> 1) + this.constants.charBase[this.constants.ERR] + this.constants.charLc[this.constants.ERR] + this.constants.charTrace[this.constants.ERR] + this.constants.relicsHead[h][this.constants.ERR] + this.constants.relicsHands[g][this.constants.ERR] + this.constants.relicsBody[b][this.constants.ERR] + this.constants.relicsFeet[f][this.constants.ERR] + this.constants.relicsPlanarSphere[p][this.constants.ERR] + this.constants.relicsLinkRope[l][this.constants.ERR];
  //     // let ohb = 0.1 * (relicSet11 >> 1) + this.constants.charBase[this.constants.OHB] + this.constants.charLc[this.constants.OHB] + this.constants.charTrace[this.constants.OHB] + this.constants.relicsHead[h][this.constants.OHB] + this.constants.relicsHands[g][this.constants.OHB] + this.constants.relicsBody[b][this.constants.OHB] + this.constants.relicsFeet[f][this.constants.OHB] + this.constants.relicsPlanarSphere[p][this.constants.OHB] + this.constants.relicsLinkRope[l][this.constants.OHB];
  //     let physical_DMG = this.constants.elementalMultipliers[0] * (0.1 * (relicSet1 >> 1) + this.constants.charBase[this.constants.Physical_DMG] + this.constants.charLc[this.constants.Physical_DMG] + this.constants.charTrace[this.constants.Physical_DMG] + this.constants.relicsHead[h][this.constants.Physical_DMG] + this.constants.relicsHands[g][this.constants.Physical_DMG] + this.constants.relicsBody[b][this.constants.Physical_DMG] + this.constants.relicsFeet[f][this.constants.Physical_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Physical_DMG] + this.constants.relicsLinkRope[l][this.constants.Physical_DMG]);
  //     let fire_DMG = this.constants.elementalMultipliers[1] * (0.1 * (relicSet3 >> 1) + this.constants.charBase[this.constants.Fire_DMG] + this.constants.charLc[this.constants.Fire_DMG] + this.constants.charTrace[this.constants.Fire_DMG] + this.constants.relicsHead[h][this.constants.Fire_DMG] + this.constants.relicsHands[g][this.constants.Fire_DMG] + this.constants.relicsBody[b][this.constants.Fire_DMG] + this.constants.relicsFeet[f][this.constants.Fire_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Fire_DMG] + this.constants.relicsLinkRope[l][this.constants.Fire_DMG]);
  //     let ice_DMG = this.constants.elementalMultipliers[2] * (0.1 * (relicSet6 >> 1) + this.constants.charBase[this.constants.Ice_DMG] + this.constants.charLc[this.constants.Ice_DMG] + this.constants.charTrace[this.constants.Ice_DMG] + this.constants.relicsHead[h][this.constants.Ice_DMG] + this.constants.relicsHands[g][this.constants.Ice_DMG] + this.constants.relicsBody[b][this.constants.Ice_DMG] + this.constants.relicsFeet[f][this.constants.Ice_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Ice_DMG] + this.constants.relicsLinkRope[l][this.constants.Ice_DMG]);
  //     let lightning_DMG = this.constants.elementalMultipliers[3] * (0.1 * (relicSet0 >> 1) + this.constants.charBase[this.constants.Lightning_DMG] + this.constants.charLc[this.constants.Lightning_DMG] + this.constants.charTrace[this.constants.Lightning_DMG] + this.constants.relicsHead[h][this.constants.Lightning_DMG] + this.constants.relicsHands[g][this.constants.Lightning_DMG] + this.constants.relicsBody[b][this.constants.Lightning_DMG] + this.constants.relicsFeet[f][this.constants.Lightning_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Lightning_DMG] + this.constants.relicsLinkRope[l][this.constants.Lightning_DMG]);
  //     let wind_DMG = this.constants.elementalMultipliers[4] * (0.1 * (relicSet2 >> 1) + this.constants.charBase[this.constants.Wind_DMG] + this.constants.charLc[this.constants.Wind_DMG] + this.constants.charTrace[this.constants.Wind_DMG] + this.constants.relicsHead[h][this.constants.Wind_DMG] + this.constants.relicsHands[g][this.constants.Wind_DMG] + this.constants.relicsBody[b][this.constants.Wind_DMG] + this.constants.relicsFeet[f][this.constants.Wind_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Wind_DMG] + this.constants.relicsLinkRope[l][this.constants.Wind_DMG]);
  //     let quantum_DMG = this.constants.elementalMultipliers[5] * (0.1 * (relicSet4 >> 1) + this.constants.charBase[this.constants.Quantum_DMG] + this.constants.charLc[this.constants.Quantum_DMG] + this.constants.charTrace[this.constants.Quantum_DMG] + this.constants.relicsHead[h][this.constants.Quantum_DMG] + this.constants.relicsHands[g][this.constants.Quantum_DMG] + this.constants.relicsBody[b][this.constants.Quantum_DMG] + this.constants.relicsFeet[f][this.constants.Quantum_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Quantum_DMG] + this.constants.relicsLinkRope[l][this.constants.Quantum_DMG]);
  //     let imaginary_DMG = this.constants.elementalMultipliers[6] * (0.1 * (relicSet13 >> 1) + this.constants.charBase[this.constants.Imaginary_DMG] + this.constants.charLc[this.constants.Imaginary_DMG] + this.constants.charTrace[this.constants.Imaginary_DMG] + this.constants.relicsHead[h][this.constants.Imaginary_DMG] + this.constants.relicsHands[g][this.constants.Imaginary_DMG] + this.constants.relicsBody[b][this.constants.Imaginary_DMG] + this.constants.relicsFeet[f][this.constants.Imaginary_DMG] + this.constants.relicsPlanarSphere[p][this.constants.Imaginary_DMG] + this.constants.relicsLinkRope[l][this.constants.Imaginary_DMG]);
  
  //     let elementalDmg = physical_DMG + fire_DMG + ice_DMG + lightning_DMG + wind_DMG + quantum_DMG + imaginary_DMG

  //     let cappedCrit = Math.min(cr + this.constants.buffCr, 1)
  //     let dmg = ((this.constants.buffAtkP + 1) * atk + this.constants.buffAtk) * (cd + this.constants.buffCd) * cappedCrit * (1 + elementalDmg)
  //     let mcd = ((this.constants.buffAtkP + 1) * atk + this.constants.buffAtk) * (cd + this.constants.buffCd) * (1 + elementalDmg)
  //     let ehp = hp / (1 - def / (def + 200 + 10 * 80))

  //     let result = 
  //       hp >= this.constants.minHp && hp <= this.constants.maxHp && 
  //       atk >= this.constants.minAtk && atk <= this.constants.maxAtk && 
  //       def >= this.constants.minDef && def <= this.constants.maxDef && 
  //       spd >= this.constants.minSpd && spd <= this.constants.maxSpd && 
  //       cr >= this.constants.minCr && cr <= this.constants.maxCr && 
  //       cd >= this.constants.minCd && cd <= this.constants.maxCd && 
  //       ehr >= this.constants.minEhr && ehr <= this.constants.maxEhr && 
  //       res >= this.constants.minRes && res <= this.constants.maxRes && 
  //       be >= this.constants.minBe && be <= this.constants.maxBe &&
  //       dmg >= this.constants.minDmg && dmg <= this.constants.maxDmg &&
  //       mcd >= this.constants.minMcd && be <= this.constants.maxMcd &&
  //       ehp >= this.constants.minEhp && be <= this.constants.maxEhp
  //     ;
  
  //     return (result && (this.constants.relicSetSolutions[relicSetIndex] == 1) && (this.constants.ornamentSetSolutions[ornamentSetIndex] == 1)) ? 1 : 0;
  //     // return cd;
  //    }, { 
  //     output: [consts.HEIGHT, consts.WIDTH],
  //     constants: consts
  //   });
  //   // gpu.destroy()
  //   return kernel;
  // },

  // loadKernel: ()=> {
  //   return new Function('return ' + '')
  // },
}
