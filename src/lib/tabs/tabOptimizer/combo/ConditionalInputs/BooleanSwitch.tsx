import { Flex } from '@mantine/core'
import { getTeammateIndex } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import { useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import { FormSwitchWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSwitch'
import { ColorizeNumbers } from 'lib/ui/ColorizeNumbers'
import type { ContentItem } from 'types/conditionals'

// Passes removeForm={true} and onChange that writes to the combo drawer store,
// not the form store, preventing stale local state overwrite on drawer close.
export function BooleanSwitch({ contentItem, sourceKey, value }: {
  contentItem: ContentItem,
  sourceKey: string,
  value: boolean,
}) {
  const isDisabled = (sourceKey.includes('Teammate') && sourceKey.includes('Set')) || contentItem.disabled

  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center'>
      <Flex w={210} align='center'>
        <FormSwitchWithPopover
          {...contentItem}
          title={contentItem.text}
          teammateIndex={getTeammateIndex(sourceKey)}
          content={ColorizeNumbers(contentItem.content)}
          text={contentItem.text}
          removeForm={true}
          set={sourceKey.includes('comboCharacterRelicSets')}
          value={value}
          disabled={isDisabled}
          onChange={(val: boolean) => {
            useComboDrawerStore.getState().setBooleanDefault(sourceKey, contentItem.id, val)
          }}
        />
      </Flex>
    </Flex>
  )
}
