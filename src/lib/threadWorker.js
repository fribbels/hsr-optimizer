const calculateStats = function(e) {
  // console.log("Message received from main script", e);

  let data = e.data;
  let relics = data.relics;
  let character = data.character;
  let Constants = data.Constants;
  Stats = Constants.Stats;

  let rows = []
  let lSize = data.consts.lSize
  let pSize = data.consts.pSize
  let fSize = data.consts.fSize
  let bSize = data.consts.bSize
  let gSize = data.consts.gSize
  let hSize = data.consts.hSize

  let relicSetToIndex = data.relicSetToIndex
  let ornamentSetToIndex = data.ornamentSetToIndex

  let elementalMultipliers = data.elementalMultipliers

  let trace = character.traces
  let lc = character.lightCone
  let base = character.base

  let request = data.request

  function sum(h, g, b, f, p, l, stat) {
    return relics.Head[h].augmentedStats[stat] +
      relics.Hands[g].augmentedStats[stat] +
      relics.Body[b].augmentedStats[stat] +
      relics.Feet[f].augmentedStats[stat] +
      relics.PlanarSphere[p].augmentedStats[stat] +
      relics.LinkRope[l].augmentedStats[stat]
  }

  for (let row = 0; row < data.HEIGHT; row++) {
    for (let col = 0; col < data.WIDTH; col++) {
      let result = data.successes[row][col]
      if (!result) continue

      let x = data.skip + row * data.HEIGHT + col

      if (x >= data.permutations) {
        continue;
      }

      let l = (x % lSize);
      let p = (((x - l) / lSize) % pSize);
      let f = (((x - p * lSize - l) / (lSize * pSize)) % fSize);
      let b = (((x - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize);
      let g = (((x - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize);
      let h = (((x - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize);

      let setH = relicSetToIndex[relics.Head[h].set]
      let setG = relicSetToIndex[relics.Hands[g].set]
      let setB = relicSetToIndex[relics.Body[b].set]
      let setF = relicSetToIndex[relics.Feet[f].set]
      
      let setP = ornamentSetToIndex[relics.PlanarSphere[p].set]
      let setL = ornamentSetToIndex[relics.LinkRope[l].set]

      let relicSet0 =  (1 >> (setH ^ 0)) +  (1 >> (setG ^ 0)) +  (1 >> (setB ^ 0)) +  (1 >> (setF ^ 0)) // Passerby of Wandering Cloud
      let relicSet1 =  (1 >> (setH ^ 1)) +  (1 >> (setG ^ 1)) +  (1 >> (setB ^ 1)) +  (1 >> (setF ^ 1)) // Musketeer of Wild Wheat
      let relicSet2 =  (1 >> (setH ^ 2)) +  (1 >> (setG ^ 2)) +  (1 >> (setB ^ 2)) +  (1 >> (setF ^ 2)) // Knight of Purity Palace
      let relicSet3 =  (1 >> (setH ^ 3)) +  (1 >> (setG ^ 3)) +  (1 >> (setB ^ 3)) +  (1 >> (setF ^ 3)) // Hunter of Glacial Forest
      let relicSet4 =  (1 >> (setH ^ 4)) +  (1 >> (setG ^ 4)) +  (1 >> (setB ^ 4)) +  (1 >> (setF ^ 4)) // Champion of Streetwise Boxing
      let relicSet5 =  (1 >> (setH ^ 5)) +  (1 >> (setG ^ 5)) +  (1 >> (setB ^ 5)) +  (1 >> (setF ^ 5)) // Guard of Wuthering Snow
      let relicSet6 =  (1 >> (setH ^ 6)) +  (1 >> (setG ^ 6)) +  (1 >> (setB ^ 6)) +  (1 >> (setF ^ 6)) // Firesmith Of Lava-Forging
      let relicSet7 =  (1 >> (setH ^ 7)) +  (1 >> (setG ^ 7)) +  (1 >> (setB ^ 7)) +  (1 >> (setF ^ 7)) // Genius of Brilliant Stars
      let relicSet8 =  (1 >> (setH ^ 8)) +  (1 >> (setG ^ 8)) +  (1 >> (setB ^ 8)) +  (1 >> (setF ^ 8)) // Band of Sizzling Thunder
      let relicSet9 =  (1 >> (setH ^ 9)) +  (1 >> (setG ^ 9)) +  (1 >> (setB ^ 9)) +  (1 >> (setF ^ 9)) // Eagle of Twilight Line
      let relicSet10 = (1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10)) // Thief of Shooting Meteor
      let relicSet11 = (1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11)) // Wastelander of Banditry Desert
      let relicSet12 = (1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12)) // Longevous Disciple
      let relicSet13 = (1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13)) // Messenger Traversing Hackerspace
      let relicSet14 = (1 >> (setH ^ 14)) + (1 >> (setG ^ 14)) + (1 >> (setB ^ 14)) + (1 >> (setF ^ 14)) // The Ashblazing Grand Duke
      let relicSet15 = (1 >> (setH ^ 15)) + (1 >> (setG ^ 15)) + (1 >> (setB ^ 15)) + (1 >> (setF ^ 15)) // Prisoner in Deep Confinement

      let ornamentSet0 =   (1 >> (setP ^ 0)) +  (1 >> (setL ^ 0)) // Space Sealing Station
      let ornamentSet1 =   (1 >> (setP ^ 1)) +  (1 >> (setL ^ 1)) // Fleet of the Ageless
      let ornamentSet2 =   (1 >> (setP ^ 2)) +  (1 >> (setL ^ 2)) // Pan-Cosmic Commercial Enterprise
      let ornamentSet3 =   (1 >> (setP ^ 3)) +  (1 >> (setL ^ 3)) // Belobog of the Architects
      let ornamentSet4 =   (1 >> (setP ^ 4)) +  (1 >> (setL ^ 4)) // Celestial Differentiator
      let ornamentSet5 =   (1 >> (setP ^ 5)) +  (1 >> (setL ^ 5)) // Inert Salsotto
      let ornamentSet6 =   (1 >> (setP ^ 6)) +  (1 >> (setL ^ 6)) // Talia: Kingdom of Banditry
      let ornamentSet7 =   (1 >> (setP ^ 7)) +  (1 >> (setL ^ 7)) // Sprightly Vonwacq
      let ornamentSet8 =   (1 >> (setP ^ 8)) +  (1 >> (setL ^ 8)) // Rutilant Arena
      let ornamentSet9 =   (1 >> (setP ^ 9)) +  (1 >> (setL ^ 9)) // Broken Keel
      let ornamentSet10 =  (1 >> (setP ^ 10)) + (1 >> (setL ^ 10)) // Firmament Frontline: Glamoth
      let ornamentSet11 =  (1 >> (setP ^ 11)) + (1 >> (setL ^ 11)) // Penacony, Land of the Dreams

      let elementalDmg = 0
      if (elementalMultipliers[0]) elementalDmg = 0.1 * Math.min(1, relicSet4 >> 1) + (base[Stats.Physical_DMG]  + lc[Stats.Physical_DMG] + sum(h, g, b, f, p, l, Stats.Physical_DMG) + trace[Stats.Physical_DMG])
      if (elementalMultipliers[1]) elementalDmg = 0.1 * Math.min(1, relicSet6 >> 1) + (base[Stats.Fire_DMG]  + lc[Stats.Fire_DMG] + sum(h, g, b, f, p, l, Stats.Fire_DMG) + trace[Stats.Fire_DMG])
      if (elementalMultipliers[2]) elementalDmg = 0.1 * Math.min(1, relicSet3 >> 1) + (base[Stats.Ice_DMG]  + lc[Stats.Ice_DMG] + sum(h, g, b, f, p, l, Stats.Ice_DMG) + trace[Stats.Ice_DMG])
      if (elementalMultipliers[3]) elementalDmg = 0.1 * Math.min(1, relicSet8 >> 1) + (base[Stats.Lightning_DMG]  + lc[Stats.Lightning_DMG] + sum(h, g, b, f, p, l, Stats.Lightning_DMG) + trace[Stats.Lightning_DMG])
      if (elementalMultipliers[4]) elementalDmg = 0.1 * Math.min(1, relicSet9 >> 1) + (base[Stats.Wind_DMG]  + lc[Stats.Wind_DMG] + sum(h, g, b, f, p, l, Stats.Wind_DMG) + trace[Stats.Wind_DMG])
      if (elementalMultipliers[5]) elementalDmg = 0.1 * Math.min(1, relicSet7 >> 1) + (base[Stats.Quantum_DMG]  + lc[Stats.Quantum_DMG] + sum(h, g, b, f, p, l, Stats.Quantum_DMG) + trace[Stats.Quantum_DMG])
      if (elementalMultipliers[6]) elementalDmg = 0.1 * Math.min(1, relicSet11 >> 1) + (base[Stats.Imaginary_DMG]  + lc[Stats.Imaginary_DMG] + sum(h, g, b, f, p, l, Stats.Imaginary_DMG) + trace[Stats.Imaginary_DMG])

      let hero = {}

      let crSum = sum(h, g, b, f, p, l, Stats.CR)
      let cdSum = sum(h, g, b, f, p, l, Stats.CD)
      hero[Stats.HP] =  (base[Stats.HP]  + lc[Stats.HP])  * (1 + 0.12 * Math.min(1, ornamentSet1 >> 1) + 0.12 * Math.min(1, relicSet12 >> 1) + sum(h, g, b, f, p, l, Stats.HP_P)  + trace[Stats.HP_P])  + sum(h, g, b, f, p, l, Stats.HP)
      hero[Stats.ATK] = (base[Stats.ATK] + lc[Stats.ATK]) * (1 + 0.12 * Math.min(1, ornamentSet0 >> 1) + 0.12 * Math.min(1, ornamentSet10 >> 1) + 0.12 * Math.min(1, relicSet1 >> 1) + 0.12 * Math.min(1, relicSet15 >> 1) + sum(h, g, b, f, p, l, Stats.ATK_P) + trace[Stats.ATK_P]) + sum(h, g, b, f, p, l, Stats.ATK)
      hero[Stats.DEF] = (base[Stats.DEF] + lc[Stats.DEF]) * (1 + 0.15 * Math.min(1, ornamentSet3 >> 1) + 0.15 * Math.min(1, relicSet2 >> 1) + sum(h, g, b, f, p, l, Stats.DEF_P) + trace[Stats.DEF_P]) + sum(h, g, b, f, p, l, Stats.DEF)
      hero[Stats.SPD] = (base[Stats.SPD] + lc[Stats.SPD]) * (1 + 0.06 * Math.min(1, relicSet13 >> 1) + 0.06 * (relicSet1 >> 2) + sum(h, g, b, f, p, l, Stats.SPD_P) + trace[Stats.SPD_P]) + sum(h, g, b, f, p, l, Stats.SPD) + trace[Stats.SPD]
      hero[Stats.CR] =  0.08 * Math.min(1, ornamentSet5 >> 1) + 0.08 * Math.min(1, ornamentSet8 >> 1) + (base[Stats.CR]  + lc[Stats.CR]  + crSum  + trace[Stats.CR])
      hero[Stats.CD] =  0.16 * Math.min(1, ornamentSet4 >> 1) + (base[Stats.CD]  + lc[Stats.CD]  + cdSum  + trace[Stats.CD])
      hero[Stats.EHR] = 0.1 * Math.min(1, ornamentSet2 >> 1) + (base[Stats.EHR] + lc[Stats.EHR] + sum(h, g, b, f, p, l, Stats.EHR) + trace[Stats.EHR])
      hero[Stats.RES] = 0.1 * Math.min(1, ornamentSet9 >> 1) + (base[Stats.RES] + lc[Stats.RES] + sum(h, g, b, f, p, l, Stats.RES) + trace[Stats.RES])
      hero[Stats.BE] =  0.16 * Math.min(1, ornamentSet6 >> 1) + 0.16 * Math.min(1, relicSet12 >> 1) + 0.16 * (relicSet12 >> 2) + (base[Stats.BE]  + lc[Stats.BE]  + sum(h, g, b, f, p, l, Stats.BE)  + trace[Stats.BE])
      hero[Stats.ERR] = 0.05 * Math.min(1, ornamentSet7 >> 1) + 0.05 * Math.min(1, ornamentSet11 >> 1) + (base[Stats.ERR] + lc[Stats.ERR] + sum(h, g, b, f, p, l, Stats.ERR) + trace[Stats.ERR])
      hero[Stats.OHB] = 0.1 * Math.min(1, relicSet0 >> 1) + (base[Stats.OHB] + lc[Stats.OHB] + sum(h, g, b, f, p, l, Stats.OHB) + trace[Stats.OHB])
      hero['ED'] = elementalDmg
      hero['id'] = x
      
      let cappedCrit = Math.min(hero[Stats.CR] + request.buffCr, 1)
      let dmg = (hero[Stats.ATK] + request.buffAtk + (request.buffAtkP * base[Stats.ATK])) * (1 + hero[Stats.CD] + request.buffCd) * cappedCrit * (1 + elementalDmg)
      let mcd = (hero[Stats.ATK] + request.buffAtk + (request.buffAtkP * base[Stats.ATK])) * (1 + hero[Stats.CD] + request.buffCd) * (1 + elementalDmg)
      let ehp = hero[Stats.HP] / (1 - hero[Stats.DEF] / (hero[Stats.DEF] + 200 + 10 * 80))
      let cv = 100 * (crSum * 2 + cdSum)

      hero.CV = cv
      hero.DMG = dmg
      hero.MCD = mcd
      hero.EHP = ehp

      rows.push(hero);
    }
  }

  // postMessage(rows);
  return rows;
}

export const ThreadWorker = {
  calculateStats: calculateStats,
}
