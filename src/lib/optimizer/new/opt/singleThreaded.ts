import { OptimizationRequest } from '../optimizationRequest'
import { Build, checkSet22, checkSet4, OptimizationResult } from '../optimizer'

import { EarlyConditional, LateConditional } from '../stats/conditional'
import { matchByElement } from '../stats/matcher'

/**
 * Just do the damage calculation etc without WebWorkers
 */
export function __noWorker(request: OptimizationRequest): OptimizationResult {
  const relics = request.relics.sets
  let numBuild: number
  if (request.options?.numberOfBuilds) {
    numBuild = request.options.numberOfBuilds
  } else numBuild = 10
  const builds = new Array(numBuild + 1) as Build[]

  // do we do a 6 level nested loop? lmao this is actually the best way to
  // iterate single thread (very useful for testing) xdd
  for (const head of request.relics.pieces.head) {
    for (const hand of request.relics.pieces.hand) {
      for (const body of request.relics.pieces.body) {
        for (const feet of request.relics.pieces.feet) {
          for (const sphere of request.relics.pieces.sphere) {
            for (const rope of request.relics.pieces.rope) {
              const setEffs: LateConditional[] = []
              const earlyEffs: EarlyConditional[] = []
              // check set 2 planar
              if (sphere.set === rope.set) {
                setEffs.push(...relics[rope.set].set2.late)
                earlyEffs.push(...relics[rope.set].set2.early)
              }
              if (head.set === hand.set) {
                checkSet4(setEffs, earlyEffs, relics, head.set, body, feet)
              } else if (head.set === body.set) {
                checkSet22(setEffs, earlyEffs, relics, head.set, hand, feet)
              } else if (head.set === feet.set) {
                checkSet22(setEffs, earlyEffs, relics, head.set, body, hand)
              } else if (hand.set === body.set) {
                setEffs.push(...relics[hand.set].set2.late)
                earlyEffs.push(...relics[hand.set].set2.early)
              } else if (hand.set === feet.set) {
                setEffs.push(...relics[hand.set].set2.late)
                earlyEffs.push(...relics[hand.set].set2.early)
              } else if (body.set === feet.set) {
                setEffs.push(...relics[body.set].set2.late)
                earlyEffs.push(...relics[body.set].set2.early)
              }
              if (sphere.__dmgBoost) {
                earlyEffs.push(
                  new EarlyConditional(matchByElement(sphere.__dmgBoost.ele), {
                    dmgBoost: sphere.__dmgBoost.value,
                  }),
                )
              }
              const result = request.formula.calculate(
                [head, hand, body, feet, sphere, rope],
                earlyEffs,
                setEffs,
              )
              builds.push({
                head: head,
                hand: hand,
                body: body,
                feet: feet,
                sphere: sphere,
                rope: rope,
                value: result,
              })
              builds.sort((b1, b2) => b2.value - b1.value)
              builds.length = 10
            }
          }
        }
      }
    }
  }
  builds.length = 10

  return {
    builds: builds,
  }
}
