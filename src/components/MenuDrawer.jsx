import React, { useMemo } from 'react'
import {
  BarChartOutlined,
  BarsOutlined,
  BookOutlined,
  LineChartOutlined,
  LinkOutlined,
  RadarChartOutlined,
  StarFilled,
  ToolOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'
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

const MenuDrawer = () => {
  const activeKey = window.store((s) => s.activeKey)
  const setActiveKey = window.store((s) => s.setActiveKey)

  const items = useMemo(() => [
    getItem('Menu', 'subOptimizer', <LineChartOutlined />, [
      getItem(
        (
          <Flex>
            <BarChartOutlined style={{ marginRight: 5, width: 16 }} />
            {' '}
            Optimizer
          </Flex>
        ),
        AppPages.OPTIMIZER),
      getItem(
        (
          <Flex>
            <UserOutlined style={{ marginRight: 5, width: 16 }} />
            {' '}
            Characters
          </Flex>
        ),
        AppPages.CHARACTERS),
      getItem(
        (
          <Flex>
            <RadarChartOutlined style={{ marginRight: 5, width: 16 }} />
            {' '}
            Relics
          </Flex>
        ),
        AppPages.RELICS),
      getItem(
        (
          <Flex>
            <UploadOutlined style={{ marginRight: 5, width: 16 }} />
            {' '}
            Import / Save
          </Flex>
        ),
        AppPages.IMPORT),
      getItem(
        (
          <Flex>
            <BookOutlined style={{ marginRight: 5, width: 16 }} />
            {' '}
            Get Started
          </Flex>
        ),
        AppPages.GETTING_STARTED),
    ]),
    getItem('Tools', 'subTools', <ToolOutlined />, [
      getItem(
        (
          <Flex>
            <StarFilled style={{ marginRight: 5, width: 16 }} />
            {' '}
            Relic Scorer
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
    getItem('Links', 'subLinks', <BarsOutlined />, [
      getItem(
        <Typography.Link href="https://discord.gg/rDmB4Un7qg" target="_blank" rel="noopener noreferrer">
          <DiscordIcon style={{ marginRight: 5 }} />
          {' '}
          Discord
        </Typography.Link>,
        'link discord',
      ),
      getItem(
        <Typography.Link href="https://github.com/fribbels/hsr-optimizer" target="_blank" rel="noopener noreferrer">
          <GithubIcon style={{ marginRight: 5 }} />
          {' '}
          Github
        </Typography.Link>,
        'link github',
      ),
      getItem(
        <Typography.Link href="https://www.patreon.com/fribbels" target="_blank" rel="noopener noreferrer">
          <CoffeeIcon style={{ marginRight: 5 }} />
          {' '}
          Patreon
        </Typography.Link>,
        'link donate',
      ),
      !window.officialOnly && getItem(
        <Typography.Link href="https://starrailoptimizer.github.io/" target="_blank" rel="noopener noreferrer">
          <LinkOutlined style={{ marginRight: 5 }} />
          {' '}
          No leaks
        </Typography.Link>,
        'link leaks free',
      ),
    ]),
  ], [])

  const onClick = (e) => {
    if (e.key && e.key.includes('link')) return

    setActiveKey(e.key)
  }

  return (
    <Menu
      onClick={onClick}
      // inlineIndent={15}
      style={{
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
