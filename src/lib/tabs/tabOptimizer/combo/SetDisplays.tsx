import { Flex } from '@mantine/core'
import { ComboConditionalsGroupRow } from 'lib/tabs/tabOptimizer/combo/ComboConditionalsGroupRow'
import { useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'

export function SetDisplayRows({ actionCount }: { actionCount: number }) {
  const displayedRelicSets = useComboDrawerStore((s) => s.comboCharacter?.displayedRelicSets ?? [])
  const displayedOrnamentSets = useComboDrawerStore((s) => s.comboCharacter?.displayedOrnamentSets ?? [])

  const allSets = [...displayedRelicSets, ...displayedOrnamentSets]
  if (allSets.length === 0) return null

  return (
    <Flex direction="column" gap={8}>
      {allSets.map((setName) => (
        <ComboConditionalsGroupRow
          key={setName}
          conditionalType={setName}
          actionCount={actionCount}
          originKey='comboCharacterRelicSets'
        />
      ))}
    </Flex>
  )
}
