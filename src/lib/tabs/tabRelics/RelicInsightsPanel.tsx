import { RelicScorer } from 'lib/relics/relicScorerPotential'
import DB from 'lib/state/db'
import useRelicsTabStore, {
  InsightCharacters,
  RelicInsights,
} from 'lib/tabs/tabRelics/useRelicsTabStore'
import { useMemo } from 'react'
import { CharacterId } from 'types/character'

export function RelicInsightsPanel() {
  const { insightsCharacters, insightsMode, selectedRelic, excludedRelicPotentialCharacters } = useRelicsTabStore()

  const scores: Score[] = useMemo(() => {
    if (!selectedRelic) return []
    return Object.values(DB.getMetadata().characters)
      .filter((x) => insightsCharacters === InsightCharacters.All || !excludedRelicPotentialCharacters.includes(x.id))
      .map((x) => ({
        id: x.id,
        score: RelicScorer.scoreRelicPotential(selectedRelic, x.id, true),
      }))
  }, [insightsCharacters, selectedRelic, excludedRelicPotentialCharacters])

  if (!selectedRelic) return <></>

  switch (insightsMode) {
    case RelicInsights.Buckets:
      return <BucketsPanel scores={scores} insightsCharacters={insightsCharacters} />
    case RelicInsights.Top10:
      return <Top10Panel scores={scores} insightsCharacters={insightsCharacters} />
  }
}

type Score = {
  id: CharacterId,
  score: ReturnType<typeof RelicScorer.scoreRelicPotential>,
}

interface PanelProps {
  scores: Score[]
  insightsCharacters: InsightCharacters
}

function BucketsPanel({ scores, insightsCharacters }: PanelProps) {
  return <>buckets: {insightsCharacters}</>
}

function Top10Panel({ scores, insightsCharacters }: PanelProps) {
  return <>top 10: {insightsCharacters}</>
}
