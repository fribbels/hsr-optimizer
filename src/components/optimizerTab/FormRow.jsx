import { Collapse, Flex } from 'antd'
import React from 'react'
import PropTypes from 'prop-types'

export default function FormRow(props) {
  const items = [
    {
      key: '1',
      label:
  <Flex style={{ paddingTop: 8 }}>
    {props.title}
  </Flex>,
      children:
  <Flex
    style={{
      paddingLeft: 10,
      marginTop: 10,
      paddingRight: 10,
    }}
    gap={10}
  >
    {props.children}
  </Flex>,
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
        defaultActiveKey={['1']}
        items={items}
        // collapsible='icon'
        expandIconPosition="end"
        ghost
      />
    </Flex>
  )
}
FormRow.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
}
