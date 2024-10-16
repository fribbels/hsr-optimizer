import React, { useMemo } from 'react'
import { BarChartOutlined, BarsOutlined, BookOutlined, LineChartOutlined, LinkOutlined, RadarChartOutlined, SettingOutlined, StarFilled, SunOutlined, UnorderedListOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons'
import { Flex, Menu, Typography } from 'antd'
import { DiscordIcon } from 'icons/DiscordIcon'
import { GithubIcon } from 'icons/GithubIcon'
import { CoffeeIcon } from 'icons/CoffeeIcon'
import { AppPages } from 'lib/db'
import { useTranslation } from 'react-i18next'
import { officialOnly } from 'lib/constants'

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
    getItem(t('Showcase.Title')/* Showcase */, 'subTools', <SunOutlined/>, [
      getItem(
        (
          <Flex>
            <StarFilled style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('Showcase.Scorer')/* Relic Scorer */}
          </Flex>
        ),
        AppPages.RELIC_SCORER),
    ]),
    getItem(t('Optimization.Title')/* Optimization */, 'subOptimizer', <LineChartOutlined/>, [
      getItem(
        (
          <Flex>
            <BarChartOutlined style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('Optimization.Optimizer')/* Optimizer */}
          </Flex>
        ),
        AppPages.OPTIMIZER),
      getItem(
        (
          <Flex>
            <UserOutlined style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('Optimization.Characters')/* Characters */}
          </Flex>
        ),
        AppPages.CHARACTERS),
      getItem(
        (
          <Flex>
            <RadarChartOutlined style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('Optimization.Relics')/* Relics */}
          </Flex>
        ),
        AppPages.RELICS),
      getItem(
        (
          <Flex>
            <UploadOutlined style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('Optimization.Import')/* Import / Save */}
          </Flex>
        ),
        AppPages.IMPORT),
      getItem(
        (
          <Flex onClick={() => window.store.getState().setSettingsDrawerOpen(true)} style={{ width: '100%' }}>
            <SettingOutlined style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('Optimization.Settings')/* Settings */}
          </Flex>
        ),
        'link settings',
      ),
      getItem(
        (
          <Flex>
            <BookOutlined style={{ marginRight: 5, width: 16 }}/>
            {' '}
            {t('Optimization.Start')/* Get Started */}
          </Flex>
        ),
        AppPages.GETTING_STARTED),
    ]),
    getItem(t('Links.Title')/* Links */, 'subLinks', <BarsOutlined/>, [
      getItem(
        (
          <Typography.Link>
            <UnorderedListOutlined style={{ marginRight: 2, width: 16 }}/>
            {' '}
            {t('Links.Changelog')/* Changelog */}
          </Typography.Link>
        ),
        AppPages.CHANGELOG),
      getItem(
        <Typography.Link href='https://ko-fi.com/fribbels' target='_blank' rel='noopener noreferrer'>
          <CoffeeIcon style={{ marginRight: 5 }}/>
          {' '}
          {t('Links.Kofi')/* Ko-fi */}
        </Typography.Link>,
        'link donate',
      ),
      getItem(
        <Typography.Link href='https://discord.gg/rDmB4Un7qg' target='_blank' rel='noopener noreferrer'>
          <DiscordIcon style={{ marginRight: 5 }}/>
          {' '}
          {t('Links.Discord')/* Discord */}
        </Typography.Link>,
        'link discord',
      ),
      getItem(
        <Typography.Link href='https://github.com/fribbels/hsr-optimizer' target='_blank' rel='noopener noreferrer'>
          <GithubIcon style={{ marginRight: 5 }}/>
          {' '}
          {t('Links.Github')/* GitHub */}
        </Typography.Link>,
        'link github',
      ),
      !officialOnly && getItem(
        <Typography.Link href='https://starrailoptimizer.github.io/' target='_blank' rel='noopener noreferrer'>
          <LinkOutlined style={{ marginRight: 5 }}/>
          {' '}
          {t('Links.Unleak')/* No leaks */}
        </Typography.Link>,
        'link leaks free',
      ),
    ]),
  ], [t])

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
