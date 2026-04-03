import { useScannerState } from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { RecentRelicCard } from 'lib/tabs/tabRelics/RecentRelicCard'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { memo, useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useRelicStore } from 'lib/stores/relic/relicStore'

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
  const recentRelicIDs = useScannerState((s) => s.recentRelics)
  const allRelics = useRelicStore((s) => s.relicsById)

  const recentRelics = recentRelicIDs
    .map((id) => allRelics[id])
    .filter((relic) => relic != null)

  const setSelectedRelicID = useCallback((id: string) => {
    setSelectedRelicsIds([id])
  }, [setSelectedRelicsIds])

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        justifyContent: 'space-between',
        padding: '0px 10px 10px 10px',
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
    </div>
  )
})
RecentRelics.displayName = 'RecentRelics'
