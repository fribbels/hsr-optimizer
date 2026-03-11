import { Flex } from '@mantine/core'
import { getTeammateIndex } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import { FormSwitchWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSwitch'
import ColorizeNumbers from 'lib/ui/ColorizeNumbers'
import { ContentItem } from 'types/conditionals'

export function BooleanSwitch(props: {
  contentItem: ContentItem
  sourceKey: string
  value: boolean
}) {
  const contentItem = props.contentItem

  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center' gap={0}>
      <Flex style={{ width: 210 }} align='center'>
        {
          // @ts-ignore


            <FormSwitchWithPopover
              {...contentItem}
              title={contentItem.text}
              teammateIndex={getTeammateIndex(props.sourceKey)}
              content={ColorizeNumbers(contentItem.content)}
              text={contentItem.text}
              removeForm={false}
              set={props.sourceKey.includes('comboCharacterRelicSets')}
              value={props.value}
              disabled={props.sourceKey.includes('Teammate') && props.sourceKey.includes('Set') || props.contentItem.disabled}
            />

        }
      </Flex>
    </Flex>
  )
}
