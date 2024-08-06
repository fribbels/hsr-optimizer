import { ComputedStatsObject } from "lib/conditionals/conditionalConstants";
import { Stats } from "lib/constants";

export type NewConditional = {
  id: string
  activationKey: number
  statDependencies: string[]
  evaluate: (x: ComputedStatsObject, params) => void
  condition: (x: ComputedStatsObject) => boolean
  cpu: (x: ComputedStatsObject, params) => void
  gpu: (x: ComputedStatsObject, params) => void
}

export type ConditionalMetadata = {
  activationKeys: number[]
}

export const RutilantArenaConditional: NewConditional = {
  id: "Rutilant Arena",
  activationKey: 1,
  statDependencies: [Stats.CR],
  evaluate: function(x: ComputedStatsObject, params) {
    if (params.conditionalMetadata && params.conditionalMetadata.activationKeys[this.activationKey]) {
      return
    }

    if (this.condition(x)) {
      this.cpu(x, params)
      if (params.conditionalMetadata) {
        params.conditionalMetadata.activationKeys[this.activationKey] = 1
      }
    }
  },
  condition: function (x: ComputedStatsObject) {
    return x[Stats.CR] >= 0.70
  },
  cpu: (x: ComputedStatsObject) => {
    x.BASIC_BOOST += 0.20
    x.SKILL_BOOST += 0.20
  },
  gpu: () => {

  }
}

export const AventurineConversionConditional: NewConditional = {
  id: "AventurineConversionConditional",
  activationKey: 2,
  statDependencies: [Stats.DEF],
  evaluate: function(x: ComputedStatsObject, params) {
    const metadata = params.conditionalMetadata
    if (metadata && metadata.activationKeys[this.activationKey]) {
      return
    }

    if (this.condition(x)) {
      this.cpu(x, params)
      if (metadata) {
        metadata.activationKeys[this.activationKey] = 1
      }
    }
  },
  condition: function (x: ComputedStatsObject) {
    return x[Stats.DEF] > 1600
  },
  cpu: (x: ComputedStatsObject, params) => {
    buffStat(x, params, Stats.CR, Math.min(0.48, 0.02 * Math.floor((x[Stats.DEF] - 1600) / 100)))
  },
  gpu: () => {

  }
}

export function buffStat(x: ComputedStatsObject, params, stat: string, value: number) {
  x[stat] += value

  for (const conditional of RegisteredConditionals[stat] || []) {
    conditional.evaluate(x, params)
  }
}

const RegisteredConditionals = {
  [Stats.CR]: [
    RutilantArenaConditional
  ]
}

// export const LanternConditional = {
//   id: "Lantern",
//   activationKey: 1,
//   statDependencies: [],
//   execute: function() {
//     if (this.condition) {
//
//     }
//   },
//   condition: function(x: ComputedStatsObject) {
//     if (!this.activationKey) {
//       // Check if the conditional is already activated
//       return
//     }
//
//     return true
//   },
//   cpu: (x: ComputedStatsObject) => {
//     x[Stats.BE] += 0.40
//   },
//   gpu: () => {
//
//   }
// }