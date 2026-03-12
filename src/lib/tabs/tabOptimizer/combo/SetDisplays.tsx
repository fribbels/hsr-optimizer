import { Flex } from '@mantine/core'
import { ComboConditionalsGroupRow } from 'lib/tabs/tabOptimizer/combo/ComboConditionalsGroupRow'
import {
  ComboCharacter,
  ComboState,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'

export function SetDisplays({ comboOrigin, actionCount, originKey, comboState, onComboStateChange }: {
  comboOrigin: ComboCharacter
  actionCount: number
  originKey: string
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const relicSets = comboOrigin?.displayedRelicSets ?? []
  const ornamentSets = comboOrigin?.displayedOrnamentSets ?? []
  const setRender = [...relicSets, ...ornamentSets].map((setName) => (
    <ComboConditionalsGroupRow
      key={setName}
      comboOrigin={comboOrigin}
      conditionalType={setName}
      actionCount={actionCount}
      originKey={originKey}
      comboState={comboState}
      onComboStateChange={onComboStateChange}
    />
  ))

  return (
    <Flex direction="column" gap={8}>
      {setRender}
    </Flex>
  )
}
