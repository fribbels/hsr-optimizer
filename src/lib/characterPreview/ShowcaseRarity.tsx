import { Flex } from '@mantine/core'

import { Assets } from 'lib/rendering/assets'
import iconClasses from 'style/icons.module.css'
import { ReactElement } from 'react'

const ShowcaseRarity = ({
  rarity = 0,
}) => {
  const children: ReactElement[] = []
  for (let i = 0; i < rarity; i++) {
    children.push(
      <img src={Assets.getStar()} key={i} className={iconClasses.icon20} />,
    )
  }
  return (
    <Flex gap={0} align='center'>
      {children}
    </Flex>
  )
}

export default ShowcaseRarity
