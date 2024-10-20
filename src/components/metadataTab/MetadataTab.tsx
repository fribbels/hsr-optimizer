import React from 'react'
import { Flex } from 'antd'
import { AppPages } from 'lib/db.js'

export default function MetadataTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)

  if (activeKey != AppPages.METADATA_TEST) {
    // Don't load unless tab active
    return (<></>)
  }

  return (
    <MetadataDasbboard/>
  )
}

function MetadataDasbboard() {

  return (
    <Flex vertical style={{ width: 1200, minHeight: 2000 }}>
      a
    </Flex>
  )
}
