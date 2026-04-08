import { RelicContainer } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { useRelicById } from 'lib/stores/relic/relicStore'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { memo } from 'react'

export const EstbpCard = memo(() => {
  const selectedRelicId = useRelicsTabStore((s) => s.selectedRelicId)
  const focusCharacter = useRelicsTabStore((s) => s.focusCharacter)
  const selectedRelic = useRelicById(selectedRelicId)

  const weights = useScoringMetadata(focusCharacter)

  return <RelicContainer relic={selectedRelic} weights={weights?.stats ?? null} characterId={focusCharacter} withoutPreview />
})
