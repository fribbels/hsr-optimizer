import { Flex, Tag } from 'antd'
import { Assets } from 'lib/assets'
import { Constants } from 'lib/constants'
import PropTypes from 'prop-types'
import React from 'react'

// NOTE: Be careful hot-reloading with this file, can cause DB to wipe. Unsure why yet
export function OrnamentSetTagRenderer(props) {
  const { value, closable, onClose } = props
  const onPreventMouseDown = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  if (!value) return (
    <Tag
      closable={closable}
      onClose={onClose}
    >
      <Flex>
        {(props.label || '').replace(/[^0-9+]/g, '')}
      </Flex>
    </Tag>
  )

  return (
    <Tag
      closable={closable}
      onClose={onClose}
      style={{ display: 'flex', flexDirection: 'row', paddingInline: '1px', marginInlineEnd: '4px', height: 21, alignItems: 'center', overflow: 'hidden' }}
    >
      <Flex>
        <img title={value} src={Assets.getSetImage(value, Constants.Parts.PlanarSphere)} style={{ width: 24, height: 24 }}></img>
      </Flex>
    </Tag>
  )
}

OrnamentSetTagRenderer.propTypes = {
  value: PropTypes.string,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
}
