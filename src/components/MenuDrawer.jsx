import React, { useMemo } from 'react'
import { BarChartOutlined, BarsOutlined, BookOutlined, LineChartOutlined, LinkOutlined, RadarChartOutlined, SettingOutlined, StarFilled, SunOutlined, UnorderedListOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons'
import { Flex, Menu, Typography } from 'antd'
import { DiscordIcon } from 'icons/DiscordIcon'
import { GithubIcon } from 'icons/GithubIcon'
import { CoffeeIcon } from 'icons/CoffeeIcon'
import { AppPages } from 'lib/db'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('sidebar')
  const activeKey = window.store((s) => s.activeKey)
  const setActiveKey = window.store((s) => s.setActiveKey)

  const items = useMemo(() => [
    getItem(t('showcase.title'), 'subTools', <SunOutlined/>, [
      getItem(
        (
          <Flex>
            <StarFilled style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('showcase.title')}
          </Flex>
        ),
        AppPages.RELIC_SCORER),
    ]),
    getItem(t('optimization.title'), 'subOptimizer', <LineChartOutlined/>, [
      getItem(
        (
          <Flex>
            <BarChartOutlined style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('optimization.optimizer')}
          </Flex>
        ),
        AppPages.OPTIMIZER),
      getItem(
        (
          <Flex>
            <UserOutlined style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('optimization.characters')}
          </Flex>
        ),
        AppPages.CHARACTERS),
      getItem(
        (
          <Flex>
            <RadarChartOutlined style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('relic', { count: 2000, length: 1 })}
          </Flex>
        ),
        AppPages.RELICS),
      getItem(
        (
          <Flex>
            <UploadOutlined style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('optimization.import')}
          </Flex>
        ),
        AppPages.IMPORT),
      getItem(
        (
          <Flex onClick={() => window.store.getState().setSettingsDrawerOpen(true)}>
            <SettingOutlined style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('optimization.settings')}
          </Flex>
        ),
        'link settings',
      ),
      getItem(
        (
          <Flex>
            <BookOutlined style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('optimization.start')}
          </Flex>
        ),
        AppPages.GETTING_STARTED),
    ]),
    getItem(t('links.title'), 'subLinks', <BarsOutlined/>, [
      getItem(
        (
          <Typography.Link>
            <UnorderedListOutlined style={{ marginRight: 2, width: 16 }}/>
            {' '}
            {t('links.changelog')}
          </Typography.Link>
        ),
        AppPages.CHANGELOG),
      getItem(
        <Typography.Link href='https://discord.gg/rDmB4Un7qg' target='_blank' rel='noopener noreferrer'>
          <DiscordIcon style={{ marginRight: 5 }}/>
          {' '}
          {t('links.discord')}
        </Typography.Link>,
        'link discord',
      ),
      getItem(
        <Typography.Link href='https://github.com/fribbels/hsr-optimizer' target='_blank' rel='noopener noreferrer'>
          <GithubIcon style={{ marginRight: 5 }}/>
          {' '}
          {t('links.github')}
        </Typography.Link>,
        'link github',
      ),
      getItem(
        <Typography.Link href='https://www.patreon.com/fribbels' target='_blank' rel='noopener noreferrer'>
          <CoffeeIcon style={{ marginRight: 5 }}/>
          {' '}
          {t('links.kofi')}
        </Typography.Link>,
        'link donate',
      ),
      !window.officialOnly && getItem(
        <Typography.Link href='https://starrailoptimizer.github.io/' target='_blank' rel='noopener noreferrer'>
          <LinkOutlined style={{ marginRight: 5 }}/>
          {' '}
          {t('links.unleak')}
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
      inlineIndent={12}
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['subOptimizer', 'subTools', 'subLinks']}
      selectedKeys={activeKey}
      mode='inline'
      items={items}
    />
  )
}

export default MenuDrawer
