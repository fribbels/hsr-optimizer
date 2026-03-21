import { Flex } from '@mantine/core'
import { ComboConditionalsGroupRow } from 'lib/tabs/tabOptimizer/combo/ComboConditionalsGroupRow'
import type { ComboCharacter } from 'lib/tabs/tabOptimizer/combo/comboDrawerTypes'

export function SetDisplays({ comboOrigin, actionCount, originKey }: {
  comboOrigin: ComboCharacter | null
  actionCount: number
  originKey: string
}) {
  if (!comboOrigin) return null

  const relicSets = comboOrigin.displayedRelicSets ?? []
  const ornamentSets = comboOrigin.displayedOrnamentSets ?? []

  return (
    <Flex direction="column" gap={8}>
      {[...relicSets, ...ornamentSets].map((setName) => (
        <ComboConditionalsGroupRow
          key={setName}
          comboOrigin={comboOrigin}
          conditionalType={setName}
          actionCount={actionCount}
          originKey={originKey}
        />
      ))}
    </Flex>
  )
}
