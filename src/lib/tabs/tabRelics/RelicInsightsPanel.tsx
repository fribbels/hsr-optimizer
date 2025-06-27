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

  if (!selectedRelic) return <></>

  const scores: Score[] = useMemo(() => {
    return Object.values(DB.getMetadata().characters)
      .filter((x) => insightsCharacters === InsightCharacters.All || !excludedRelicPotentialCharacters.includes(x.id))
      .map((x) => ({
        id: x.id,
        score: RelicScorer.scoreRelicPotential(selectedRelic, x.id, true),
      }))
  }, [insightsCharacters, selectedRelic, excludedRelicPotentialCharacters])

  switch (insightsMode) {
    case RelicInsights.Buckets:
      return <BucketsPanel scores={scores} />
    case RelicInsights.Top10:
      return <Top10Panel scores={scores} />
  }
}

type Score = {
  id: CharacterId,
  score: ReturnType<typeof RelicScorer.scoreRelicPotential>,
}

interface PanelProps {
  scores: Score[]
}

function BucketsPanel({ scores }: PanelProps) {
  return <>buckets</>
}

function Top10Panel({ scores }: PanelProps) {
  return <>top 10</>
}
