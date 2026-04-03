import { Flex } from '@mantine/core'
import { ComboConditionalsGroupRow } from 'lib/tabs/tabOptimizer/combo/ComboConditionalsGroupRow'
import { useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import { DeferCreate } from 'lib/ui/DeferredRender'

const EMPTY_SETS: string[] = []

export function SetDisplayRows({ actionCount }: { actionCount: number }) {
  const displayedRelicSets = useComboDrawerStore((s) => s.comboCharacter?.displayedRelicSets ?? EMPTY_SETS)
  const displayedOrnamentSets = useComboDrawerStore((s) => s.comboCharacter?.displayedOrnamentSets ?? EMPTY_SETS)

  const allSets = [...displayedRelicSets, ...displayedOrnamentSets]
  if (allSets.length === 0) return null

  return (
    <Flex direction="column" gap={8}>
      {allSets.map((setName) => (
        <DeferCreate key={setName}>
          <ComboConditionalsGroupRow
            conditionalType={setName}
            actionCount={actionCount}
            originKey='comboCharacterRelicSets'
          />
        </DeferCreate>
      ))}
    </Flex>
  )
}
