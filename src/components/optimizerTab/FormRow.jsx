import { Collapse, Flex } from 'antd'
import React from 'react'
import PropTypes from 'prop-types'

export const OptimizerMenuIds = {
  characterOptions: 'Character options',
  relicAndStatFilters: 'Relic & stat filters',
  teammates: 'Teammates',
}

export default function FormRow(props) {
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
          {props.id}
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
FormRow.propTypes = {
  id: PropTypes.string,
  children: PropTypes.any,
}
