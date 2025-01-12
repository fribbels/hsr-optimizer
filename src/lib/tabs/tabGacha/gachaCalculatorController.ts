import { lightConeDistribution } from 'lib/tabs/tabGacha/gachaRates'

export function simulateWarps() {
  console.log('simulate Warps')

  let wins = 0
  let counts: Record<string, number> = {}

  // for (let i = 0; i < 100000; i++) {
  //   let e = 0
  //   let s = 0
  //   let eGuarantee = false
  //   let sGuarantee = false
  //   let eCounter = 0
  //   let sCounter = 0
  //
  //   for (let j = 0; j < 90; j++) {
  //     if (Math.random() < chance(eCounter)) {
  //       // Won a 5 star
  //
  //       if (eGuarantee) {
  //         // 50/50 guarantee activated
  //         e++
  //         eGuarantee = false
  //       } else {
  //         // Roll 50/50
  //
  //         if (Math.random() < 0.5625) {
  //           // Won 50/50
  //           e++
  //           eGuarantee = false
  //         } else {
  //           // Lost 50/50
  //           eGuarantee = true
  //         }
  //       }
  //
  //       eCounter = 0
  //     } else {
  //       eCounter++
  //     }
  //   }
  //
  //   if (counts[e] == null) {
  //     counts[e] = 0
  //   }
  //   counts[e]++
  // }
  //
  // let sum = 0
  // for (const [key, value] of Object.entries(counts).reverse()) {
  //   sum = sum + value / 100000 * 100
  //   counts[key] = sum
  //
  //   if (key == '0') {
  //     console.log(`Fail: ${value / 100000 * 100}%`)
  //   } else {
  //     console.log(`E${parseInt(key) - 1}: ${sum}%`)
  //   }
  // }
  const cumulative = []
  for (let i = 0; i < 80; i++) {
    cumulative[i] = i == 0 ? lightConeDistribution[i] : cumulative[i - 1] + lightConeDistribution[i]
  }
  console.log(cumulative)
}

// function getIndex(randomNumber) {
//   let left = 0;
//   let right = cumulativeDistribution.length - 1;
//
//   while (left < right) {
//     const mid = Math.floor((left + right) / 2);
//     if (randomNumber > cumulativeDistribution[mid]) {
//       left = mid + 1;
//     } else {
//       right = mid;
//     }
//   }
//
//   return left;
// }
