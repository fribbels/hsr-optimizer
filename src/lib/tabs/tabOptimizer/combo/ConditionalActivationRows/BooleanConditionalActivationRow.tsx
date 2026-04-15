import { comboRowStyle } from 'lib/tabs/tabOptimizer/combo/comboDrawerConstants'
import { BooleanSwitch } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/BooleanSwitch'
import { BoxArray } from 'lib/tabs/tabOptimizer/combo/ConditionalInputs/BoxArray'
import { useMemo } from 'react'
import type { ContentItem } from 'types/conditionals'

export function BooleanConditionalActivationRow({
  contentItem,
  activations,
  actionCount,
  sourceKey,
}: {
  contentItem: ContentItem,
  activations: boolean[],
  actionCount: number,
  sourceKey: string,
}) {
  const dataKeys = useMemo(
    () => activations.map((_, i) => JSON.stringify({ id: contentItem.id, source: sourceKey, index: i })),
    [contentItem.id, sourceKey, activations.length],
  )

  return (
    <div style={comboRowStyle}>
      <BooleanSwitch contentItem={contentItem} sourceKey={sourceKey} value={activations[0]} />
      <BoxArray
        activations={activations}
        actionCount={actionCount}
        dataKeys={dataKeys}
        partition={false}
        unselectable={contentItem.disabled}
      />
    </div>
  )
}
