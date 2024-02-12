import React from 'react'
import { Flex, Typography } from 'antd'
import PropTypes from 'prop-types'

const { Text } = Typography

export default function ComingSoonTab() {
  return (
    <div>
      <Flex style={{ margin: 20 }}>
        <Text>
          More Star Rail tools coming soon! Drop by the
          {' '}
          <Typography.Link target="_blank" href="https://discord.gg/rDmB4Un7qg">Discord server</Typography.Link>
          {' '}
          for updates, to share ideas, or just hang out.
        </Text>
      </Flex>
    </div>
  )
}
ComingSoonTab.propTypes = {
  active: PropTypes.bool,
}
