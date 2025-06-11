import { Flex } from 'antd'

import { Assets } from 'lib/rendering/assets'
import { ReactElement } from 'react'

const ShowcaseRarity = ({
  rarity = 0,
}) => {
  const children: ReactElement[] = []
  for (let i = 0; i < rarity; i++) {
    children.push(
      <img src={Assets.getStar()} key={i} style={{ width: 20, height: 20 }} />,
    )
  }
  return (
    <Flex gap={0} align='center'>
      {children}
    </Flex>
  )
}

export default ShowcaseRarity
