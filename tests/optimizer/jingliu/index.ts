import { OptimizationRequest } from 'lib/optimizer/new/optimizationRequest'
import { formula, formulaWithLimit } from './formula'
import { extendedRelics, allSetEffects, limitedRelics, limitedSetEffects } from './relics'

const limited: OptimizationRequest = {
  relics: {
    pieces: limitedRelics,
    sets: limitedSetEffects,
  },
  formula: formula,
}

const extended: OptimizationRequest = {
  relics: {
    pieces: extendedRelics,
    sets: allSetEffects,
  },
  formula: formula,
}

const extendedWithLimit: OptimizationRequest = {
  relics: {
    pieces: extendedRelics,
    sets: allSetEffects,
  },
  formula: formulaWithLimit,
}
export { extended, extendedWithLimit, limited }
