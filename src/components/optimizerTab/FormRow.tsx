import { Collapse, Flex } from 'antd'
import { ReactElement, useMemo } from 'react'

export const OptimizerMenuIds = {
  characterOptions: 'Character options',
  relicAndStatFilters: 'Relic & stat filters',
  teammates: 'Teammates',
  characterStatsSimulation: 'Character custom stats simulation',
}

export function FormRow(props: { id: string; label?: string; children: ReactElement | ReactElement[] }) {
  const optimizerMenuState = window.store((s) => s.optimizerMenuState)
  const setOptimizerMenuState = window.store((s) => s.setOptimizerMenuState)

  function onChange(event) {
    optimizerMenuState[props.id] = event.length > 0
    setOptimizerMenuState(optimizerMenuState)
  }

  const items = [
    {
      key: props.id,
      label: (
        <Flex style={{ paddingTop: 8 }}>
          {props.label || props.id}
        </Flex>
      ),
      forceRender: true,
      children: (
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
      ),
    },
  ]

  return (
    <Flex
      gap={0}
      vertical
      className="form-row"
      style={{
        minWidth: '100%',
      }}
    >
      <Collapse
        defaultActiveKey={optimizerMenuState[props.id] ? props.id : undefined}
        items={items}
        // collapsible='icon'
        onChange={onChange}
        expandIconPosition="end"
        ghost
      />
    </Flex>
  )
}

export function TeammateFormRow(props: { id: string; children: ReactElement | ReactElement[] }) {
  const teammateCount = window.store((s) => s.teammateCount)

  const label = useMemo(() => {
    return `Teammates${teammateCount ? ` (${teammateCount})` : ''}`
  }, [teammateCount])

  return (
    <FormRow id={props.id} label={label}>
      {props.children}
    </FormRow>
  )
}
