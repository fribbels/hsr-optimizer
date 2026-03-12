import { Flex } from '@mantine/core'
import { BoxArray } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/BoxArray'
import { BooleanSwitch } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/BooleanSwitch'
import { ContentItem } from 'types/conditionals'

export function BooleanConditionalActivationRow({ contentItem, activations, actionCount, sourceKey }: {
  contentItem: ContentItem
  activations: boolean[]
  actionCount: number
  sourceKey: string
}) {
  const dataKeys = activations.map((_, i) =>
    JSON.stringify({ id: contentItem.id, source: sourceKey, index: i })
  )

  return (
    <Flex h={45}>
      <BooleanSwitch contentItem={contentItem} sourceKey={sourceKey} value={activations[0]} />
      <BoxArray
        activations={activations}
        actionCount={actionCount}
        dataKeys={dataKeys}
        partition={false}
        unselectable={contentItem.disabled}
      />
    </Flex>
  )
}
