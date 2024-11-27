import { Flex, Tag } from 'antd'
import { Constants } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import React, { ReactNode } from 'react'
import { ReactElement } from 'types/components'

// NOTE: Be careful hot-reloading with this file, can cause Db to wipe. Unsure why yet
export function OrnamentSetTagRenderer(props: {
  value: string
  label: ReactNode
  closable: boolean
  onClose: () => void
}): ReactElement {
  const { value, label, closable, onClose } = props

  const processedLabel = typeof label === 'string' ? label.replace(/[^0-9+]/g, '') : null

  if (!value) return (
    <Tag
      closable={closable}
      onClose={onClose}
    >
      <Flex>
        {processedLabel}
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
