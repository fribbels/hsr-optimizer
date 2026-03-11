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
import { FormSliderWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSlider'
import ColorizeNumbers from 'lib/ui/ColorizeNumbers'
import { ContentItem } from 'types/conditionals'

export function NumberSlider(props: {
  contentItem: ContentItem
  value: number
  sourceKey: string
  partitionIndex: number
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const contentItem = props.contentItem

  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center' gap={0}>
      <Flex style={{ width: 210 }} align='center'>
        {
          // @ts-ignore


            <FormSliderWithPopover
              key={props.value + props.partitionIndex}
              {...contentItem}
              title={contentItem.text}
              content={ColorizeNumbers(contentItem.content)}
              teammateIndex={getTeammateIndex(props.sourceKey)}
              text={contentItem.text}
              onChange={(value) => {
                const newState = updateNumberDefaultSelection(props.comboState, props.sourceKey, contentItem.id, props.partitionIndex, value)
                if (newState) props.onComboStateChange(newState)
              }}
              value={props.value}
              removeForm={props.partitionIndex > 0}
            />

        }
      </Flex>
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
