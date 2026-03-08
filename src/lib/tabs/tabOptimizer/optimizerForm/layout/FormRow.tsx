import { Accordion, Flex } from '@mantine/core'
import {
  ReactElement,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'

export const OptimizerMenuIds = {
  characterOptions: 'Character options',
  relicAndStatFilters: 'Relic & stat filters',
  teammates: 'Teammates',
  characterStatsSimulation: 'Character custom stats simulation',
  analysis: 'Analysis',
}

export function FormRow(props: { id: string, label?: string, children: ReactElement | ReactElement[] }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'FormRowLabels' })
  const optimizerMenuState = window.store((s) => s.optimizerMenuState)
  const setOptimizerMenuState = window.store((s) => s.setOptimizerMenuState)

  function onChange(value: string[]) {
    optimizerMenuState[props.id] = value.length > 0
    setOptimizerMenuState(optimizerMenuState)
  }

  return (
    <Flex
      gap={0}
      direction="column"
      className='form-row'
      style={{
        minWidth: '100%',
      }}
    >
      <Accordion
        multiple
        defaultValue={optimizerMenuState[props.id] ? [props.id] : []}
        onChange={onChange}
        chevronPosition='right'
        variant='default'
      >
        <Accordion.Item value={props.id}>
          <Accordion.Control>
            <Flex style={{ paddingTop: 6 }}>
              {
                // @ts-ignore
                props.label ?? t(`${props.id}`)
              }
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
              {props.children}
            </Flex>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Flex>
  )
}

export function TeammateFormRow(props: { id: string, children: ReactElement | ReactElement[] }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TeammateRow' })
  const teammateCount = window.store((s) => s.teammateCount)

  const label = useMemo(() => {
    return t('Header', { teammateCount: teammateCount ? ` (${teammateCount})` : '' })
    // Teammates / Teammates (1/2/3)
  }, [teammateCount, t])

  return (
    <FormRow id={props.id} label={label}>
      {props.children}
    </FormRow>
  )
}
