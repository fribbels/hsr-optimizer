import { createContext } from 'react'
import type { Character } from 'types/character'

interface SimScoringContext {
  cacheKey: string | null
  character: Character
}

export const SimScoringContext = createContext<SimScoringContext>({
  cacheKey: null,
  // character is guaranteed to always be properly defined at run time
  character: {} as Character,
})
