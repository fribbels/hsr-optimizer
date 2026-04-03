import { RelicContainer } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { enrichSingleRelicAnalysis } from 'lib/characterPreview/summary/statScoringSummaryController'
import { ScoringCache } from 'lib/relics/scoring/relicScorer'
import { useAsyncComputation } from 'lib/tabs/tabRelics/relicInsightsPanel/useAsyncComputation'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { useRelicById } from 'lib/stores/relic/relicStore'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import {
  type EstTbpWorkerOutput,
  handleWork,
} from 'lib/worker/estTbpWorkerRunner'
import { memo, useMemo, useRef } from 'react'

export const EstbpCard = memo(() => {
  const selectedRelicId = useRelicsTabStore((s) => s.selectedRelicId)
  const focusCharacter = useRelicsTabStore((s) => s.focusCharacter)
  const selectedRelic = useRelicById(selectedRelicId)

  const weights = useScoringMetadata(focusCharacter)

  const computeFn = useMemo(() => {
    if (!selectedRelic || !weights?.stats) return null
    return () => handleWork(selectedRelic, weights.stats)
  }, [selectedRelic, weights?.stats])

  const { ready, output } = useAsyncComputation<EstTbpWorkerOutput>(computeFn, [computeFn])

  const needsAnalysis = selectedRelic && weights && focusCharacter

  const analysis = output && needsAnalysis ? enrichSingleRelicAnalysis(selectedRelic, output.days, weights, focusCharacter, new ScoringCache()) : undefined

  // Keep previous analysis visible while worker recomputes to avoid flash
  const prevAnalysis = useRef(analysis)
  if (analysis) prevAnalysis.current = analysis
  const displayAnalysis = analysis ?? prevAnalysis.current

  return (
    <RelicContainer ready={ready || !!displayAnalysis} relicAnalysis={displayAnalysis} withoutPreview />
  )
})
