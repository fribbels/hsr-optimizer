import {
  IconCircleMinus,
  IconCirclePlus,
} from '@tabler/icons-react'
import { Button, Flex } from '@mantine/core'
import { buttonStyle } from 'lib/tabs/tabOptimizer/combo/comboDrawerConstants'
import { getTeammateIndex, handlePartitionButtonClick } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import { useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import { FormSelectWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSelect'
import { ColorizeNumbers } from 'lib/ui/ColorizeNumbers'
import type { ContentItem } from 'types/conditionals'
import type { SelectOptionContent } from 'types/setConfig'

export function NumberSelect({ contentItem, value, sourceKey, partitionIndex }: {
  contentItem: ContentItem & { options?: SelectOptionContent[] }
  value: number
  sourceKey: string
  partitionIndex: number
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
        onChange={(val: number) => {
          useComboDrawerStore.getState().setNumberDefault(sourceKey, contentItem.id, partitionIndex, val)
        }}
        value={value}
        removeForm={true}
        fullWidth={!sourceKey.includes('comboCharacterRelicSets')}
      />
      <Button
        variant='transparent'
        leftSection={partitionIndex === 0
          ? <IconCirclePlus style={buttonStyle} />
          : <IconCircleMinus style={buttonStyle} />}
        onClick={() => {
          handlePartitionButtonClick(sourceKey, contentItem.id, partitionIndex, () => {
            return (contentItem.options ?? []).map((opt) => opt.value)
          })
        }}
      />
    </Flex>
  )
}
