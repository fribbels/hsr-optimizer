import {
  Accordion,
  Flex,
} from '@mantine/core'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export function FormRow({ id, label, children }: { id: string, label?: string, children: ReactNode }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'FormRowLabels' })
  const isOpen = useOptimizerDisplayStore((s) => s.menuState[id])

  function onChange(value: string[]) {
    const { menuState, setMenuState } = useOptimizerDisplayStore.getState()
    setMenuState({ ...menuState, [id]: value.length > 0 })
  }

  return (
    <Flex
      direction='column'
      style={{
        minWidth: '100%',
      }}
    >
      <Accordion
        multiple
        defaultValue={isOpen ? [id] : []}
        onChange={onChange}
        chevronPosition='right'
        variant='default'
        transitionDuration={200}
        styles={{
          control: { fontSize: 20, alignItems: 'baseline' },
          content: { paddingBlock: 0, paddingBottom: 10 },
          chevron: { paddingInlineStart: 12 },
        }}
      >
        <Accordion.Item value={id}>
          <Accordion.Control>
            {label ?? t(`${id}` as never)}
          </Accordion.Control>
          <Accordion.Panel>
            <Flex gap={10}>
              {children}
            </Flex>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Flex>
  )
}

export function TeammateFormRow({ id, children }: { id: string, children: ReactNode }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TeammateRow' })

  return (
    <FormRow id={id} label={t('Header')}>
      {children}
    </FormRow>
  )
}
