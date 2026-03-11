import { Flex } from '@mantine/core'
import React from 'react'

function BoxComponent_(props: {
  active: boolean
  index: number
  disabled: boolean
  dataKey: string
  partition: boolean
  unselectable?: boolean
}) {
  let classnames: string
  if (props.disabled) {
    classnames = 'disabledSelect'
  } else {
    if (props.unselectable) {
      classnames = props.active ? 'unselectable selected defaultShaded' : 'unselectable defaultShaded'
    } else {
      classnames = props.active ? 'selectable selected' : 'selectable'
    }
    if (props.index == 0) {
      classnames += ' defaultShaded'
    }
    if (props.partition && props.active) {
      classnames += ' partitionShaded'
    }
  }

  // console.log('Box')
  return (
    <div
      className={classnames}
      data-key={props.dataKey}
      style={{ width: 90 - 1, marginLeft: -1, marginTop: -1 }}
    >
    </div>
  )
}

export const BoxComponent = React.memo(
  BoxComponent_,
  (prevProps, nextProps) => {
    return prevProps.dataKey === nextProps.dataKey
      && prevProps.active === nextProps.active
      && prevProps.disabled === nextProps.disabled
      && prevProps.index === nextProps.index
      && prevProps.partition === nextProps.partition
      && prevProps.unselectable === nextProps.unselectable
  },
)

export function BoxArray(props: {
  activations: boolean[]
  actionCount: number
  dataKeys: string[]
  partition: boolean
  unselectable?: boolean
}) {
  return (
    <Flex>
      {props.activations.map((value, index) => (
        <BoxComponent
          dataKey={props.dataKeys[index]}
          key={index}
          active={value}
          disabled={index >= props.actionCount}
          index={index}
          partition={props.partition}
          unselectable={props.unselectable}
        />
      ))}
    </Flex>
  )
}
