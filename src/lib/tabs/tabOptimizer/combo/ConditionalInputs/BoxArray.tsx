import React from 'react'

const flexRow: React.CSSProperties = { display: 'flex' }

export const BoxComponent = React.memo(function BoxComponent({ active, index, disabled, dataKey, partition, unselectable }: {
  active: boolean,
  index: number,
  disabled: boolean,
  dataKey: string,
  partition: boolean,
  unselectable?: boolean,
}) {
  let classnames: string
  if (disabled) {
    classnames = 'disabledSelect'
  } else {
    if (unselectable) {
      classnames = active ? 'unselectable selected defaultShaded' : 'unselectable defaultShaded'
    } else {
      classnames = active ? 'selectable selected' : 'selectable'
    }
    if (index === 0) {
      classnames += ' defaultShaded'
    }
    if (partition && active) {
      classnames += ' partitionShaded'
    }
  }

  return (
    <div
      className={classnames}
      data-key={dataKey}
      style={{ width: 90 - 1, marginLeft: -1, marginTop: -1 }}
    />
  )
})

export function BoxArray({ activations, actionCount, dataKeys, partition, unselectable }: {
  activations: boolean[],
  actionCount: number,
  dataKeys: string[],
  partition: boolean,
  unselectable?: boolean,
}) {
  return (
    <div style={flexRow}>
      {activations.map((value, index) => (
        <BoxComponent
          dataKey={dataKeys[index]}
          key={index}
          active={value}
          disabled={index >= actionCount}
          index={index}
          partition={partition}
          unselectable={unselectable}
        />
      ))}
    </div>
  )
}
