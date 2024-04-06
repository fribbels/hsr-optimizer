import { OptimizationRequest } from 'lib/optimizer/new/request'
import { formula, formulaWithLimit } from './formula'
import { allSetEffects, extendedRelics, limitedRelics, limitedSetEffects } from './relics'

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
