import {
  IconCircleMinus,
  IconCirclePlus,
} from '@tabler/icons-react'
import { Button, Flex } from '@mantine/core'
import { buttonStyle } from 'lib/tabs/tabOptimizer/combo/comboDrawerConstants'
import { getTeammateIndex } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import {
  ComboState,
  updateAddPartition,
  updateDeletePartition,
  updateNumberDefaultSelection,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { FormSelectWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSelect'
import ColorizeNumbers from 'lib/ui/ColorizeNumbers'
import { ContentItem } from 'types/conditionals'

export function NumberSelect(props: {
  contentItem: ContentItem
  value: number
  sourceKey: string
  partitionIndex: number
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const contentItem = props.contentItem

  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center' gap={5}>
      <FormSelectWithPopover
        {...contentItem}
        title={contentItem.text}
        teammateIndex={getTeammateIndex(props.sourceKey)}
        content={ColorizeNumbers(contentItem.content)}
        text={contentItem.text}
        set={props.sourceKey.includes('comboCharacterRelicSets')}
        onChange={(value) => {
          const newState = updateNumberDefaultSelection(props.comboState, props.sourceKey, contentItem.id, props.partitionIndex, value)
          if (newState) props.onComboStateChange(newState)
        }}
        value={props.value}
        removeForm={props.partitionIndex > 0}
        fullWidth={!props.sourceKey.includes('comboCharacterRelicSets')}
      />
      <Button
        variant='transparent'
        leftSection={props.partitionIndex == 0
          ? <IconCirclePlus style={buttonStyle} />
          : <IconCircleMinus style={buttonStyle} />}
        onClick={() => {
          if (props.partitionIndex == 0) {
            const newState = updateAddPartition(props.comboState, props.sourceKey, props.contentItem.id, props.partitionIndex)
            if (newState) props.onComboStateChange(newState)
          } else {
            const newState = updateDeletePartition(props.comboState, props.sourceKey, props.contentItem.id, props.partitionIndex)
            if (newState) props.onComboStateChange(newState)
          }
        }}
      />
    </Flex>
  )
}
