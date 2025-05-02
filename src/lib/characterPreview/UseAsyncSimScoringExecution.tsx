// Custom hook to track AsyncSimScoringExecution state
import { AsyncSimScoringExecution } from 'lib/scoring/dpsScore'
import { useEffect, useState } from 'react'

export function useAsyncSimScoringExecution(asyncSimScoringExecution: AsyncSimScoringExecution | null) {
  const [forceRender, setForceRender] = useState(0)

  useEffect(() => {
    if (asyncSimScoringExecution?.promise) {
      asyncSimScoringExecution.promise.then(() => {
        setForceRender((prev) => prev + 1)
      })
    }
  }, [asyncSimScoringExecution?.promise])

  return asyncSimScoringExecution
}
