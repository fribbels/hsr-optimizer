import { Flex } from '@mantine/core'
import { BoxArray } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/BoxArray'
import { BooleanSwitch } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/BooleanSwitch'
import { ContentItem } from 'types/conditionals'

export function BooleanConditionalActivationRow(props: {
  contentItem: ContentItem
  activations: boolean[]
  actionCount: number
  sourceKey: string
}) {
  const dataKeys: string[] = []

  for (let i = 0; i < props.activations.length; i++) {
    dataKeys.push(JSON.stringify({
      id: props.contentItem.id,
      source: props.sourceKey,
      index: i,
    }))
  }

  return (
    <Flex key={props.contentItem.id} style={{ height: 45 }}>
      <BooleanSwitch contentItem={props.contentItem} sourceKey={props.sourceKey} value={props.activations[0]} />
      <BoxArray
        activations={props.activations}
        actionCount={props.actionCount}
        dataKeys={dataKeys}
        partition={false}
        unselectable={props.contentItem.disabled}
      />
    </Flex>
  )
}
