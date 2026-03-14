import { Flex } from '@mantine/core'
import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { RecentRelicCard } from 'lib/tabs/tabRelics/RecentRelicCard'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import { memo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useRelicStore } from 'lib/stores/relicStore'

function padArray<T>(array: T[], length: number, filler: T): T[] {
  return [...array, ...Array(length - array.length).fill(filler)]
}

export const RecentRelics = memo(() => {
  const { focusCharacter: scoringCharacter, selectedRelicId, setSelectedRelicsIds } = useRelicsTabStore(
    useShallow((s) => ({
      focusCharacter: s.focusCharacter,
      selectedRelicId: s.selectedRelicId,
      setSelectedRelicsIds: s.setSelectedRelicsIds,
    })),
  )
  const { recentRelics: recentRelicIDs } = useScannerState()
  const allRelics = useRelicStore((s) => s.relicsById)

  const recentRelics = recentRelicIDs
    .map((id) => allRelics[id])
    .filter((relic) => relic != null)

  const setSelectedRelicID = (id: string) => {
    setSelectedRelicsIds([id])
  }

  return (
    <Flex
      gap={10}
      justify='space-between'
      style={{
        padding: 10,
      }}
    >
      {padArray(recentRelics.slice(0, 6), 6, undefined).map((relic, i) => (
        <RecentRelicCard
          key={relic?.id ?? i}
          relic={relic}
          isSelected={relic?.id === selectedRelicId}
          scoringCharacter={scoringCharacter}
          setSelectedRelicID={setSelectedRelicID}
        />
      ))}
    </Flex>
  )
})
RecentRelics.displayName = 'RecentRelics'
