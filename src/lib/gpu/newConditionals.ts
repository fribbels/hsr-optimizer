import { ComputedStatsObject } from "lib/conditionals/conditionalConstants";
import { Stats } from "lib/constants";

export type NewConditional = {
  id: string
  activationKey: number
  statDependencies: string[]
  evaluate: (x: ComputedStatsObject, conditionalMetadata: ConditionalMetadata) => void
  condition: (x: ComputedStatsObject) => boolean
  cpu: (x: ComputedStatsObject) => void
  gpu: (x: ComputedStatsObject) => void
}

export type ConditionalMetadata = {
  activationKeys: number[]
}

export const RutilantArenaConditional: NewConditional = {
  id: "Rutilant Arena",
  activationKey: 1,
  statDependencies: [Stats.CR],
  evaluate: function(x: ComputedStatsObject, conditionalMetadata: ConditionalMetadata) {
    if (conditionalMetadata.activationKeys[this.activationKey]) {
      return
    }

    if (this.condition(x)) {
      this.cpu(x)
      conditionalMetadata.activationKeys[this.activationKey] = 1
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

function buffStat(x: ComputedStatsObject, conditionalMetadata: ConditionalMetadata, stat: string, value: number) {
  x[stat] += value

  for (const conditional of RegisteredConditionals[stat] || []) {
    conditional.evaluate(x, conditionalMetadata)
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