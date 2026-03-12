import { Flex } from '@mantine/core'
import { getTeammateIndex } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import { FormSwitchWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSwitch'
import { ColorizeNumbers } from 'lib/ui/ColorizeNumbers'
import { ContentItem } from 'types/conditionals'

export function BooleanSwitch({ contentItem, sourceKey, value }: {
  contentItem: ContentItem
  sourceKey: string
  value: boolean
}) {
  const isDisabled = (sourceKey.includes('Teammate') && sourceKey.includes('Set')) || contentItem.disabled

  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center' gap={0}>
      <Flex style={{ width: 210 }} align='center'>
        {/* @ts-expect-error: FormSwitchWithPopover spread has loose prop types */}
        <FormSwitchWithPopover
          {...contentItem}
          title={contentItem.text}
          teammateIndex={getTeammateIndex(sourceKey)}
          content={ColorizeNumbers(contentItem.content)}
          text={contentItem.text}
          removeForm={false}
          set={sourceKey.includes('comboCharacterRelicSets')}
          value={value}
          disabled={isDisabled}
        />
      </Flex>
    </Flex>
  )
}
