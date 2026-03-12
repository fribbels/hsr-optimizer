import { Accordion, Flex } from '@mantine/core'
import {
  ReactNode,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'

export const OptimizerMenuIds = {
  characterOptions: 'Character options',
  relicAndStatFilters: 'Relic & stat filters',
  teammates: 'Teammates',
  characterStatsSimulation: 'Character custom stats simulation',
  analysis: 'Analysis',
}

export function FormRow({ id, label, children }: { id: string; label?: string; children: ReactNode }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'FormRowLabels' })
  const optimizerMenuState = useOptimizerDisplayStore((s) => s.menuState)
  const setOptimizerMenuState = useOptimizerDisplayStore((s) => s.setMenuState)

  function onChange(value: string[]) {
    setOptimizerMenuState({ ...optimizerMenuState, [id]: value.length > 0 })
  }

  return (
    <Flex
      gap={0}
      direction="column"
      style={{
        minWidth: '100%',
      }}
    >
      <Accordion
        multiple
        defaultValue={optimizerMenuState[id] ? [id] : []}
        onChange={onChange}
        chevronPosition='right'
        variant='default'
        styles={{
          control: { paddingTop: 0, paddingBottom: 0, fontSize: 20, alignItems: 'baseline' },
          content: { paddingBlock: 0 },
          chevron: { paddingInlineStart: 12 },
        }}
      >
        <Accordion.Item value={id}>
          <Accordion.Control>
            <Flex style={{ paddingTop: 6 }}>
              {label ?? t(`${id}` as never)}
            </Flex>
          </Accordion.Control>
          <Accordion.Panel>
            <Flex
              style={{
                paddingLeft: 10,
                marginTop: 5,
                paddingRight: 10,
              }}
              gap={10}
            >
              {children}
            </Flex>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Flex>
  )
}

export function TeammateFormRow({ id, children }: { id: string; children: ReactNode }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TeammateRow' })
  const teammateCount = useOptimizerDisplayStore((s) => s.teammateCount)

  const label = useMemo(() => {
    return t('Header', { teammateCount: teammateCount ? ` (${teammateCount})` : '' })
    // Teammates / Teammates (1/2/3)
  }, [teammateCount, t])

  return (
    <FormRow id={id} label={label}>
      {children}
    </FormRow>
  )
}
