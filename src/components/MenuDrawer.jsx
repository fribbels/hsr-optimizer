import React from 'react'
import { MenuOutlined, StarFilled, UnorderedListOutlined } from '@ant-design/icons'
import { Flex, Menu, Typography } from 'antd'
import { DiscordIcon } from 'icons/DiscordIcon'
import { GithubIcon } from 'icons/GithubIcon'
import { CoffeeIcon } from 'icons/CoffeeIcon'
import { AppPages } from 'lib/db'

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  }
}
const items = [
  getItem('Menu', 'subOptimizer', <MenuOutlined />, [
    getItem('Optimizer', AppPages.OPTIMIZER),
    getItem('Characters', AppPages.CHARACTERS),
    getItem('Relics', AppPages.RELICS),
    getItem('Import / Save', AppPages.IMPORT),
    getItem('Getting started', AppPages.GETTING_STARTED),
  ]),
  getItem('Tools', 'subTools', <MenuOutlined />, [
    getItem(
      (
        <Flex>
          <StarFilled style={{ marginRight: 5, width: 16 }} />
          {' '}
          Relic scorer
        </Flex>
      ),
      AppPages.RELIC_SCORER),
    getItem(
      (
        <Typography.Link>
          <UnorderedListOutlined style={{ marginRight: 2, width: 16 }} />
          {' '}
          Changelog
        </Typography.Link>
      ),
      AppPages.CHANGELOG),
  ]),
  getItem('Links', 'subLinks', <MenuOutlined />, [
    getItem(
      <Typography.Link href="https://discord.gg/rDmB4Un7qg" target="_blank" rel="noopener noreferrer">
        <DiscordIcon style={{ marginRight: 5 }} />
        {' '}
        Discord
      </Typography.Link>,
      'link discord',
    ),
    getItem(
      <Typography.Link href="https://www.patreon.com/fribbels" target="_blank" rel="noopener noreferrer">
        <CoffeeIcon style={{ marginRight: 5 }} />
        {' '}
        Patreon
      </Typography.Link>,
      'link donate',
    ),
    getItem(
      <Typography.Link href="https://github.com/fribbels/hsr-optimizer" target="_blank" rel="noopener noreferrer">
        <GithubIcon style={{ marginRight: 5 }} />
        {' '}
        Github
      </Typography.Link>,
      'link github',
    ),
  ]),
]

const MenuDrawer = () => {
  const activeKey = window.store((s) => s.activeKey)
  const setActiveKey = window.store((s) => s.setActiveKey)

  const onClick = (e) => {
    if (e.key && e.key.includes('link')) return

    setActiveKey(e.key)
  }

  return (
    <Menu
      onClick={onClick}
      // inlineIndent={15}
      style={{
        height: '100%',
        overflow: 'auto',

      }}
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['subOptimizer', 'subTools', 'subLinks']}
      selectedKeys={activeKey}
      mode="inline"
      items={items}
    />
  )
}

export default MenuDrawer
