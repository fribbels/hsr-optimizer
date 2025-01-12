import { characterCumulative } from 'lib/tabs/tabGacha/gachaRates'

export function simulateWarps() {
  console.log('simulate Warps')

  let wins = 0
  let counts: Record<string, number> = {}

  // Adjusted cumulative distribution after 30 pulls

  const n = 10000000
  for (let i = 0; i < n; i++) {
    const pity: number = 0
    // const rand = pity == 0 ? Math.random() * 100 : Math.random() * 100 * (100 - characterCumulative[pity - 1])
    const rand = Math.random()

    const index = getIndex(rand, characterCumulative, pity)

    if (counts[index] == null) counts[index] = 0
    counts[index]++
  }

  for (const [key, value] of Object.entries(counts)) {
    console.log(`${key}: ${value / n * 100}%`)
  }

  console.log(counts)
}

function getIndex(random: number, cumulativeDistribution: number[], pity: number) {
  let left = pity
  let right = cumulativeDistribution.length - 1

  while (left < right) {
    const mid = Math.floor((left + right) / 2)
    if (random > cumulativeDistribution[mid]) {
      left = mid + 1
    } else {
      right = mid
    }
  }

  return left
}

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
