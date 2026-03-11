import { Flex } from '@mantine/core'
import { ComboConditionalsGroupRow } from 'lib/tabs/tabOptimizer/combo/ComboConditionalsGroupRow'
import {
  ComboCharacter,
  ComboState,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'

export function SetDisplays(props: {
  comboOrigin: ComboCharacter
  conditionalType: string
  actionCount: number
  originKey: string
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const relicSets = props.comboOrigin?.displayedRelicSets || []
  const ornamentSets = props.comboOrigin?.displayedOrnamentSets || []
  const setRender = [...relicSets, ...ornamentSets].map((setName) => {
    return (
      <ComboConditionalsGroupRow
        key={setName}
        comboOrigin={props.comboOrigin}
        conditionalType={setName}
        actionCount={props.actionCount}
        originKey={props.originKey}
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
    )
  })

  return (
    <Flex direction="column" gap={8}>
      {setRender}
    </Flex>
  )
}
