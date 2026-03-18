import {
  IconCircleMinus,
  IconCirclePlus,
} from '@tabler/icons-react'
import { Button, Flex } from '@mantine/core'
import { buttonStyle } from 'lib/tabs/tabOptimizer/combo/comboDrawerConstants'
import { getTeammateIndex } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import {
  updateAddPartition,
  updateDeletePartition,
  updateNumberDefaultSelection,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import type { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { FormSelectWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSelect'
import { ColorizeNumbers } from 'lib/ui/ColorizeNumbers'
import type { ContentItem } from 'types/conditionals'

export function NumberSelect({ contentItem, value, sourceKey, partitionIndex, comboState, onComboStateChange }: {
  contentItem: ContentItem
  value: number
  sourceKey: string
  partitionIndex: number
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center' gap={5}>
      <FormSelectWithPopover
        {...contentItem}
        title={contentItem.text}
        teammateIndex={getTeammateIndex(sourceKey)}
        content={ColorizeNumbers(contentItem.content)}
        text={contentItem.text}
        set={sourceKey.includes('comboCharacterRelicSets')}
        onChange={(val) => {
          const newState = updateNumberDefaultSelection(comboState, sourceKey, contentItem.id, partitionIndex, val)
          if (newState) onComboStateChange(newState)
        }}
        value={value}
        removeForm={partitionIndex > 0}
        fullWidth={!sourceKey.includes('comboCharacterRelicSets')}
      />
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
