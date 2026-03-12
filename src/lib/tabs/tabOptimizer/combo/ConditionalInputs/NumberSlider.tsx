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
import { ColorizeNumbers } from 'lib/ui/ColorizeNumbers'
import { ContentItem } from 'types/conditionals'

export function NumberSlider({ contentItem, value, sourceKey, partitionIndex, comboState, onComboStateChange }: {
  contentItem: ContentItem
  value: number
  sourceKey: string
  partitionIndex: number
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center'>
      <Flex w={210} align='center'>
        {/* @ts-expect-error - FormSliderWithPopover spread props type mismatch */}
        <FormSliderWithPopover
          key={value + partitionIndex}
          {...contentItem}
          title={contentItem.text}
          content={ColorizeNumbers(contentItem.content)}
          teammateIndex={getTeammateIndex(sourceKey)}
          text={contentItem.text}
          onChange={(val) => {
            const newState = updateNumberDefaultSelection(comboState, sourceKey, contentItem.id, partitionIndex, val)
            if (newState) onComboStateChange(newState)
          }}
          value={value}
          removeForm={partitionIndex > 0}
        />
      </Flex>
      <Button
        variant='transparent'
        leftSection={partitionIndex === 0
          ? <IconCirclePlus style={buttonStyle} />
          : <IconCircleMinus style={buttonStyle} />}
        onClick={() => {
          if (partitionIndex === 0) {
            const newState = updateAddPartition(comboState, sourceKey, contentItem.id, partitionIndex)
            if (newState) onComboStateChange(newState)
          } else {
            const newState = updateDeletePartition(comboState, sourceKey, contentItem.id, partitionIndex)
            if (newState) onComboStateChange(newState)
          }
        }}
      />
    </Flex>
  )
}
