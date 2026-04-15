import {
  Button,
  Flex,
} from '@mantine/core'
import {
  IconCircleMinus,
  IconCirclePlus,
} from '@tabler/icons-react'
import { buttonStyle } from 'lib/tabs/tabOptimizer/combo/comboDrawerConstants'
import {
  getTeammateIndex,
  handlePartitionButtonClick,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import { useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import { FormSliderWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSlider'
import { ColorizeNumbers } from 'lib/ui/ColorizeNumbers'
import type { ContentItem } from 'types/conditionals'

export function NumberSlider({ contentItem, value, sourceKey, partitionIndex }: {
  contentItem: ContentItem & { min: number, max: number },
  value: number,
  sourceKey: string,
  partitionIndex: number,
}) {
  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center'>
      <Flex w={210} align='center'>
        <FormSliderWithPopover
          key={value + partitionIndex}
          {...contentItem}
          title={contentItem.text}
          content={ColorizeNumbers(contentItem.content)}
          teammateIndex={getTeammateIndex(sourceKey)}
          text={contentItem.text}
          onChange={(val: number) => {
            useComboDrawerStore.getState().setNumberDefault(sourceKey, contentItem.id, partitionIndex, val)
          }}
          value={value}
          removeForm={true}
        />
      </Flex>
      <Button
        variant='transparent'
        leftSection={partitionIndex === 0
          ? <IconCirclePlus style={buttonStyle} />
          : <IconCircleMinus style={buttonStyle} />}
        onClick={() => {
          handlePartitionButtonClick(sourceKey, contentItem.id, partitionIndex, () => {
            const candidates: number[] = []
            for (let v = contentItem.min; v <= contentItem.max; v++) candidates.push(v)
            return candidates
          })
        }}
      />
    </Flex>
  )
}
