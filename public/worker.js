// const workerpool = require('workerpool');
// import workerpool from 'workerpool'
// importScripts(
//   "https://cdn.jsdelivr.net/npm/gpu.js@latest/dist/gpu-browser.min.js",
//   "https://cdn.jsdelivr.net/npm/workerpool@6.5.1/dist/workerpool.min.js"
// );
workerpool.worker({
  test: function() {

    const gpu = new GPU();
    console.log('a', gpu);
  },
  calcResults: function() {
    console.log("Message received from main script", e.data);
    let data = e.data;
    let relics = data.relics;
    let character = data.character;
    let Constants = data.Constants;
    Stats = Constants.Stats;
    additiveStats = [Stats.SPD, Stats.CR, Stats.CD, Stats.EHR, Stats.RES, Stats.BE, Stats.ERR, Stats.OHB, 
      Stats.Physical_DMG, Stats.Fire_DMG, Stats.Ice_DMG, Stats.Lightning_DMG, Stats.Wind_DMG, Stats.Quantum_DMG, Stats.Imaginary_DMG]

    let rows = []
    let lSize = data.consts.lSize
    let pSize = data.consts.pSize
    let fSize = data.consts.fSize
    let bSize = data.consts.bSize
    let gSize = data.consts.gSize
    let hSize = data.consts.hSize

    let trace = character.traces
    let lc = character.lightCone
    let base = character.base

    for (let row = 0; row < data.HEIGHT; row++) {
      for (let col = 0; col < data.WIDTH; col++) {
        let result = data.successes[row][col]
        if (!result) continue

        let x = data.skip + row * data.HEIGHT + col

        let l = (x % lSize);
        let p = (((x - l) / lSize) % pSize);
        let f = (((x - p * lSize - l) / (lSize * pSize)) % fSize);
        let b = (((x - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize);
        let g = (((x - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize);
        let h = (((x - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize);

        let acc = {}
        addItemToAccumulator(acc, relics.Head[h])
        addItemToAccumulator(acc, relics.Hands[g])
        addItemToAccumulator(acc, relics.Body[b])
        addItemToAccumulator(acc, relics.Feet[f])
        addItemToAccumulator(acc, relics.PlanarSphere[p])
        addItemToAccumulator(acc, relics.LinkRope[l])

        let hero = {
          [Stats.HP]:  (base[Stats.HP]  + lc[Stats.HP])  * (1 + acc[Stats.HP_P]  + trace[Stats.HP_P])  + acc[Stats.HP],
          [Stats.ATK]: (base[Stats.ATK] + lc[Stats.ATK]) * (1 + acc[Stats.ATK_P] + trace[Stats.ATK_P]) + acc[Stats.ATK],
          [Stats.DEF]: (base[Stats.DEF] + lc[Stats.DEF]) * (1 + acc[Stats.DEF_P] + trace[Stats.DEF_P]) + acc[Stats.DEF],
        }

        for (let additiveStat of additiveStats) {
          hero[additiveStat] = (base[additiveStat]  + lc[additiveStat] + acc[additiveStat] + trace[additiveStat])
        }
        hero.id = x
        rows.push(hero);
      }
    }

    console.log('Rows: ', rows.length)
    return rows;
  },
});

// let Stats
// let additiveStats
// onmessage = function(e) {
//   console.log("Message received from main script", e.data);
//   let data = e.data;
//   let relics = data.relics;
//   let character = data.character;
//   let Constants = data.Constants;
//   Stats = Constants.Stats;
//   additiveStats = [Stats.SPD, Stats.CR, Stats.CD, Stats.EHR, Stats.RES, Stats.BE, Stats.ERR, Stats.OHB, 
//     Stats.Physical_DMG, Stats.Fire_DMG, Stats.Ice_DMG, Stats.Lightning_DMG, Stats.Wind_DMG, Stats.Quantum_DMG, Stats.Imaginary_DMG]

//   let rows = []
//   let lSize = data.consts.lSize
//   let pSize = data.consts.pSize
//   let fSize = data.consts.fSize
//   let bSize = data.consts.bSize
//   let gSize = data.consts.gSize
//   let hSize = data.consts.hSize

//   let trace = character.traces
//   let lc = character.lightCone
//   let base = character.base

//   for (let row = 0; row < data.HEIGHT; row++) {
//     for (let col = 0; col < data.WIDTH; col++) {
//       let result = data.successes[row][col]
//       if (!result) continue

//       let x = data.skip + row * data.HEIGHT + col

//       let l = (x % lSize);
//       let p = (((x - l) / lSize) % pSize);
//       let f = (((x - p * lSize - l) / (lSize * pSize)) % fSize);
//       let b = (((x - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize);
//       let g = (((x - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize);
//       let h = (((x - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize);

//       let acc = {}
//       addItemToAccumulator(acc, relics.Head[h])
//       addItemToAccumulator(acc, relics.Hands[g])
//       addItemToAccumulator(acc, relics.Body[b])
//       addItemToAccumulator(acc, relics.Feet[f])
//       addItemToAccumulator(acc, relics.PlanarSphere[p])
//       addItemToAccumulator(acc, relics.LinkRope[l])

//       let hero = {
//         [Stats.HP]:  (base[Stats.HP]  + lc[Stats.HP])  * (1 + acc[Stats.HP_P]  + trace[Stats.HP_P])  + acc[Stats.HP],
//         [Stats.ATK]: (base[Stats.ATK] + lc[Stats.ATK]) * (1 + acc[Stats.ATK_P] + trace[Stats.ATK_P]) + acc[Stats.ATK],
//         [Stats.DEF]: (base[Stats.DEF] + lc[Stats.DEF]) * (1 + acc[Stats.DEF_P] + trace[Stats.DEF_P]) + acc[Stats.DEF],
//       }

//       for (let additiveStat of additiveStats) {
//         hero[additiveStat] = (base[additiveStat]  + lc[additiveStat] + acc[additiveStat] + trace[additiveStat])
//       }
//       hero.id = x
//       rows.push(hero);
//     }
//   }

//   console.log('Rows: ', rows.length)
//   postMessage(rows);
// }

// oldonmessage = function(e) {
//   console.log("Message received from main script", e.data);
//   let data = e.data;
//   let relics = data.relics;
//   let character = data.character;
//   let Constants = data.Constants;
//   Stats = Constants.Stats;
//   let rows = []

//   let trace = character.traces
//   let lc = character.lightCone
//   let base = character.base

//   function permutations() {
//     // relics.Hands = relics.Hands.concat(relics.Hands);
//     // relics.Head = relics.Head.concat(relics.Head);
//     // relics.Body = relics.Body.concat(relics.Body);
//     // relics.Feet = relics.Feet.concat(relics.Feet);
//     // relics.PlanarSphere = relics.PlanarSphere.concat(relics.PlanarSphere);
//     // relics.LinkRope = relics.LinkRope.concat(relics.LinkRope);

//     let i = 0;
//     for (let hand of relics.Hands) {
//       for (let head of relics.Head) {
//         for (let body of relics.Body) {
//           for (let feet of relics.Feet) {
//             for (let planarSphere of relics.PlanarSphere) {
//               for (let linkRope of relics.LinkRope) {

//                 let acc = {}
//                 addItemToAccumulator(acc, hand)
//                 addItemToAccumulator(acc, head)
//                 addItemToAccumulator(acc, body)
//                 addItemToAccumulator(acc, feet)
//                 addItemToAccumulator(acc, planarSphere)
//                 addItemToAccumulator(acc, linkRope)

//                 let hero = {
//                   [Stats.HP]:  (base[Stats.HP]  + lc[Stats.HP])  * (1 + acc[Stats.HP_P]  + trace[Stats.HP_P])  + acc[Stats.HP],
//                   [Stats.ATK]: (base[Stats.ATK] + lc[Stats.ATK]) * (1 + acc[Stats.ATK_P] + trace[Stats.ATK_P]) + acc[Stats.ATK],
//                   [Stats.DEF]: (base[Stats.DEF] + lc[Stats.DEF]) * (1 + acc[Stats.DEF_P] + trace[Stats.DEF_P]) + acc[Stats.DEF],
//                 }

//                 for (let additiveStat of additiveStats) {
//                   hero[additiveStat] = (base[additiveStat]  + lc[additiveStat] + acc[additiveStat] + trace[additiveStat])
//                 }
//                 rows.push(hero);
//               }
//             }
//           }
//         }
//       }
//     }
//   }

//   function calculateStats() {
//     for (let x of data.successes) {
//       if (!x) continue
//       let l = relics.LinkRope[x[0]]
//       let p = relics.PlanarSphere[x[1]]
//       let f = relics.Feet[x[2]]
//       let b = relics.Body[x[3]]
//       let g = relics.Hands[x[4]]
//       let h = relics.Head[x[5]]

//       let acc = {}
//       addItemToAccumulator(acc, g)
//       addItemToAccumulator(acc, h)
//       addItemToAccumulator(acc, b)
//       addItemToAccumulator(acc, f)
//       addItemToAccumulator(acc, p)
//       addItemToAccumulator(acc, l)

//       let hero = {
//         [Stats.HP]:  (base[Stats.HP]  + lc[Stats.HP])  * (1 + acc[Stats.HP_P]  + trace[Stats.HP_P])  + acc[Stats.HP],
//         [Stats.ATK]: (base[Stats.ATK] + lc[Stats.ATK]) * (1 + acc[Stats.ATK_P] + trace[Stats.ATK_P]) + acc[Stats.ATK],
//         [Stats.DEF]: (base[Stats.DEF] + lc[Stats.DEF]) * (1 + acc[Stats.DEF_P] + trace[Stats.DEF_P]) + acc[Stats.DEF],
//       }

//       for (let additiveStat of additiveStats) {
//         hero[additiveStat] = (base[additiveStat]  + lc[additiveStat] + acc[additiveStat] + trace[additiveStat])
//       }
//       rows.push(hero);
//     }
//   }

//   if (!data.successes) {
//     permutations()
//   } else {
//     calculateStats()
//   }

//   console.log('Successes: ', rows.length)
//   postMessage(rows);
// };

// function preprocessCharacter(character) {
//   for (let entry of Object.entries(Stats)) {
//     if (!character.traces[entry[1]]) {
//       character.traces[entry[1]] = 0
//     }
//     if (!character.base[entry[1]]) {
//       character.base[entry[1]] = 0
//     }
//     if (!character.lightCone[entry[1]]) {
//       character.lightCone[entry[1]] = 0
//     }

//     if (entry[1] != Stats.HP && 
//         entry[1] != Stats.ATK && 
//         entry[1] != Stats.DEF && 
//         entry[1] != Stats.SPD) {
//       character.traces[entry[1]] = character.traces[entry[1]] / 100
//       character.base[entry[1]] = character.base[entry[1]] / 100
//     }
//   }
// }

// function preprocessRelic(relic) {
//   for (let entry of Object.entries(Stats)) {
//     relic.augmentedStats[entry[1]] = relic.augmentedStats[entry[1]] || 0
    
//     if (entry[1] != Stats.HP && 
//         entry[1] != Stats.ATK && 
//         entry[1] != Stats.DEF && 
//         entry[1] != Stats.SPD) {
//       relic.augmentedStats[entry[1]] = relic.augmentedStats[entry[1]] / 100
//     }
//   }
// }

// function addItemToAccumulator(acc, relic) {
//   for (let entry of Object.entries(relic.augmentedStats)) {
//     let stat = entry[0]
//     let value = entry[1]

//     if (!acc[stat]) {
//       acc[stat] = 0
//     }
//     acc[stat] += value;
//   }
// }