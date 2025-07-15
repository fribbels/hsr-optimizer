import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { sortAlphabeticEmojiLast } from 'lib/rendering/displayUtils'
import DB from 'lib/state/db'
import useRelicsTabStore, {
  InsightCharacters,
  RelicInsights,
} from 'lib/tabs/tabRelics/useRelicsTabStore'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'

const BUCKETS_CHARACTERS_COUNT = 10

export function RelicInsightsPanel() {
  const { insightsCharacters, insightsMode, selectedRelicId, excludedRelicPotentialCharacters } = useRelicsTabStore()
  const { t } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const selectedRelic = DB.getRelicById(selectedRelicId ?? '') ?? null

  const scores: Score[] = useMemo(() => {
    if (!selectedRelic) return []
    return Object.values(DB.getMetadata().characters)
      .filter((x) => insightsCharacters === InsightCharacters.All || !excludedRelicPotentialCharacters.includes(x.id))
      .map((x, idx) => ({
        id: x.id,
        name: t(`${x.id}.Name`),
        score: RelicScorer.scoreRelicPotential(selectedRelic, x.id, true),
        owned: DB.getCharacterById(x.id) != undefined,
      }))
      .sort((a, b) => {
        if (b.score.bestPct == a.score.bestPct) {
          return sortAlphabeticEmojiLast('name')(a, b)
        } else return b.score.bestPct - a.score.bestPct
      })
  }, [insightsCharacters, selectedRelic, excludedRelicPotentialCharacters, t])

  if (!selectedRelic) return <></>

  switch (insightsMode) {
    case RelicInsights.Buckets:
      return <BucketsPanel scores={scores.slice(0, BUCKETS_CHARACTERS_COUNT)} insightsCharacters={insightsCharacters} />
    case RelicInsights.Top10:
      return <Top10Panel scores={scores} insightsCharacters={insightsCharacters} />
  }
}

type Score = {
  id: CharacterId,
  name: string,
  score: ReturnType<typeof RelicScorer.scoreRelicPotential>,
  owned: boolean,
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
