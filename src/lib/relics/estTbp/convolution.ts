// we model substat quality as a model of distributions
// a distribution is mapping of a *value* to a *probability*
// it is to be ensured that a correctly constructed distribution has all probabilities add up to 1
//
// a simple distribution is the uniform distribution U(n), which maps all n *values* to equal *probability* 1/n
// an example of this would be the roll of a 6-sided dice with *values* [1..6], which would have the distributions
//
// {1: 1/6, 2: 1/6, 3: 1/6, 4: 1/6, 5: 1/6, 6: 1/6}
//
// the special part is the convolution. this is the function used to *add* multiple probabilities.
// this would be equal to adding the results of two dice and looks like following:
//
// convolve(d, d) = {2: 1/36, 3: 2/6, ... 11: 2/36, 12: 1/6}
//
// for our purposes, we model a roll into a given substat as a *value* equal to its substat weight.
//
// this function starts out with a relic that already has its substats picked out
// we assume that a roll into any of the 4 given substats is uniform for now

import { TsUtils } from 'lib/utils/TsUtils'

type Distribution = Map<number, number> // TODO: can potentially pick a better data structure
// Needs to be 100 to support 0.75 weight ATK%
const substatWeightRoundingFactor = 100 // will eventually round the substat value to the closest 1/n

const distributionCache = new Map<string, Distribution>()

export function getRollQualityDistribution(substatWeights: number[], numUpgrades: number) {
  const cacheKey = `${substatWeights.join(',')}_${numUpgrades}`

  if (distributionCache.has(cacheKey)) {
    return distributionCache.get(cacheKey)!
  }

  const result = calculateRollQualityDistribution(substatWeights, numUpgrades)
  distributionCache.set(cacheKey, result)

  return result
}

// total probability of all values strictly higher than `threshold`
export function thresholdProbability(dist: Distribution, threshold: number): number {
  return [...dist.entries()]
    .filter(([k, v]) => TsUtils.precisionRound(k) > threshold)
    .reduce((acc, [_k, v]) => acc + v, 0)
}

function calculateRollQualityDistribution(substatWeights: number[], numUpgrades: number): Distribution {
  // floating point numbers are not good to calculate with, we need exact numbers when indexing into the distribution
  // we take the substat weights and round them to a whole number during the calculation, then divide the resulting keys again at the end
  const roundedSubstatWeights = substatWeights.map((w) => Math.floor(w * substatWeightRoundingFactor))

  // the chance of a single roll into a substat having a specific roll quality is uniform on the values [8, 9, 10]
  // same here, we add a factor of 10 to achieve whole numbers
  const rollQualityRoundingFactor = 10
  const rollQuality: Distribution = uniformDistribution([0.8, 0.9, 1.0].map((q) => q * rollQualityRoundingFactor))

  // we have 4 substats that must receive one roll each in order to exist
  const initialDist: Distribution = convolveAddIter(roundedSubstatWeights.map((w) => uniformDistribution([...rollQuality.keys()].map((q) => w * q))))

  // the distribution of the value of a single upgrade into one substat is uniformDistribution(substatWeights).
  // the distribution of the value of a single upgrade including roll quality is that but convolveMultiply
  // with roll quality
  const upgradeDist = convolveMultiply(uniformDistribution(roundedSubstatWeights), rollQuality)

  // there are a total of 4 or 5 total `numUpgrades`, so we convolve it on itself that many times
  const totalUpgradeDist = convolveAddIter(Array(numUpgrades).fill(upgradeDist) as Distribution[])

  // combine the initial and the upgrade dist...
  const totalDist = convolveAdd(initialDist, totalUpgradeDist)

  // console.log([...totalDist.entries()].map(([k, v]) => k).join(', '))

  // now we need to divide the scaling factors we used to avoid floating point calculation
  const unscalingFactor = substatWeightRoundingFactor * rollQualityRoundingFactor
  const trueDist: Distribution = new Map<number, number>()
  for (const [k, v] of totalDist) {
    trueDist.set(k / unscalingFactor, v)
  }

  return trueDist
}

function convolveAddIter(f: Distribution[]): Distribution {
  return f.reduce((acc, d) => convolveAdd(acc, d), uniformDistribution([0]))
}

function convolve(f: Distribution, g: Distribution, keyFunc: (f: number, g: number) => number): Distribution {
  const dist: Distribution = new Map<number, number>()

  for (const [fk, fv] of f) {
    for (const [gk, gv] of g) {
      const k = keyFunc(fk, gk)
      const v = dist.get(k)
      if (v === undefined) {
        dist.set(k, fv * gv)
      } else {
        dist.set(k, v + fv * gv)
      }
    }
  }

  return dist
}

function convolveAdd(f: Distribution, g: Distribution): Distribution {
  return convolve(f, g, (x, y) => x + y)
}

function convolveMultiply(f: Distribution, g: Distribution): Distribution {
  return convolve(f, g, (x, y) => x * y)
}

// if a key is defined multiple times, it scales the probability as such
export function uniformDistribution(keys: number[]): Distribution {
  const dist: Distribution = new Map<number, number>()
  const p = 1.0 / keys.length

  for (const k of keys) {
    const v = dist.get(k)
    if (v === undefined) {
      dist.set(k, p)
    } else {
      dist.set(k, v + p)
    }
  }

  return dist
}
