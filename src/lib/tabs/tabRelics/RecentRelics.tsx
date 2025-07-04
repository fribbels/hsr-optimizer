import { Flex } from 'antd'
import React from 'react'
import { CharacterId } from 'types/character'
import { useScannerState } from '../tabImport/ScannerWebsocketClient'
import { RecentRelicCard } from './RecentRelicCard'

function padArray<T>(array: T[], length: number, filler: T): T[] {
  return [...array, ...Array(length - array.length).fill(filler)]
}

export const RecentRelics = React.memo((props: {
  scoringCharacter?: CharacterId
  setSelectedRelicID?: (relicID: string) => void
  selectedRelicID?: string
}): React.JSX.Element => {
  const recentRelicIDs = useScannerState((s) => s.recentRelics)
  const allRelics = window.store((s) => s.relicsById)
  const recentRelics = recentRelicIDs.map((id) => allRelics[id]).filter((relic) => relic != null)

  return (
    <Flex
      gap={10}
      justify='space-between'
      style={{
        padding: 10
      }}
    >
      {
        padArray(recentRelics.slice(0, 6), 6, undefined).map((relic, i) => (
          <RecentRelicCard
            key={relic?.id ?? i}
            relic={relic}
            isSelected={relic?.id === props.selectedRelicID}
            scoringCharacter={props.scoringCharacter}
            setSelectedRelicID={props.setSelectedRelicID}
          />
        ))
      }
    </Flex>
  )
})
RecentRelics.displayName = 'RecentRelics'
