import { BuildCandidate } from './opt/iteration/build'
import { getSetEffects } from './opt/iteration/set'
import { EarlyConditional } from './stats/conditional'
import { matchByElement } from './stats/matcher'
import { RelicContext } from './stats/relic'
import { Formula } from './step/formula'

export function calculateFormula(build: BuildCandidate, formula: Formula, sets: RelicContext['sets']) {
  const { early, late } = getSetEffects(build, sets)
  // Sphere can give element dmg bonus, which is handled by element
  // conditional. The system doesn't track individual dmg bonus.
  if (build.sphere.__dmgBoost) {
    early.push(
      new EarlyConditional(
        matchByElement(build.sphere.__dmgBoost.ele),
        { dmgBoost: build.sphere.__dmgBoost.value },
      ),
    )
  }
  return formula.calculate(
    [build.head, build.hand, build.body, build.feet, build.sphere, build.rope],
    early,
    late,
  )
}
