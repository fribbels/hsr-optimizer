import {
  BarChartOutlined,
  BarsOutlined,
  BookOutlined,
  HomeOutlined,
  LineChartOutlined,
  LinkOutlined,
  ProjectOutlined,
  RadarChartOutlined,
  SettingOutlined,
  SketchOutlined,
  StarFilled,
  SunOutlined,
  UnorderedListOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Flex,
  Menu,
  Typography,
} from 'antd'
import { CoffeeIcon } from 'icons/CoffeeIcon'
import { DiscordIcon } from 'icons/DiscordIcon'
import { GithubIcon } from 'icons/GithubIcon'
import { officialOnly } from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import {
  AppPage,
  AppPages,
} from 'lib/state/db'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'

type MenuItemProperties = {
  label: string | ReactElement,
  key: string,
  icon?: ReactElement,
  children?: MenuItemProperties[],
}

function getItem(label: string | ReactElement, key: string, icon?: ReactElement, children?: MenuItemProperties[]): MenuItemProperties {
  return {
    label,
    key,
    icon,
    children,
  }
}

const MenuDrawer = () => {
  const { t } = useTranslation('sidebar')
  const activeKey = window.store((s) => s.activeKey)
  const setActiveKey = window.store((s) => s.setActiveKey)

  const items = useMemo(() => [
    getItem(t('Tools.Title'), /* Tools */ 'subTools', <SunOutlined />, [
      getItem(
        (
          <Flex>
            <StarFilled style={{ marginRight: 5, width: 16 }} /> {t('Tools.Showcase') /* Showcase */}
          </Flex>
        ),
        AppPages.SHOWCASE,
      ),
      getItem(
        (
          <Flex>
            <ProjectOutlined style={{ marginRight: 5, width: 16 }} /> {t('Tools.Benchmarks') /*Benchmarks*/}
          </Flex>
        ),
        AppPages.BENCHMARKS,
      ),
      getItem(
        (
          <Flex>
            <SketchOutlined style={{ marginRight: 5, width: 16 }} /> {t('Tools.WarpPlanner') /* Warp Planner */}
          </Flex>
        ),
        AppPages.WARP,
      ),
    ]),
    getItem(t('Optimization.Title'), /* Optimization */ 'subOptimizer', <LineChartOutlined />, [
      getItem(
        (
          <Flex>
            <BarChartOutlined style={{ marginRight: 5, width: 16 }} /> {t('Optimization.Optimizer') /* Optimizer */}
          </Flex>
        ),
        AppPages.OPTIMIZER,
      ),
      getItem(
        (
          <Flex>
            <UserOutlined style={{ marginRight: 5, width: 16 }} /> {t('Optimization.Characters') /* Characters */}
          </Flex>
        ),
        AppPages.CHARACTERS,
      ),
      getItem(
        (
          <Flex>
            <RadarChartOutlined style={{ marginRight: 5, width: 16 }} /> {t('Optimization.Relics') /* Relics */}
          </Flex>
        ),
        AppPages.RELICS,
      ),
      getItem(
        (
          <Flex>
            <UploadOutlined style={{ marginRight: 5, width: 16 }} /> {t('Optimization.Import') /* Import / Save */}
          </Flex>
        ),
        AppPages.IMPORT,
      ),
      getItem(
        (
          <Flex onClick={() => setOpen(OpenCloseIDs.SETTINGS_DRAWER)} style={{ width: '100%' }}>
            <SettingOutlined style={{ marginRight: 5, width: 16 }} /> {t('Optimization.Settings') /* Settings */}
          </Flex>
        ),
        'link settings',
      ),
      getItem(
        (
          <Flex onClick={() => setOpen(OpenCloseIDs.GETTING_STARTED_DRAWER)} style={{ width: '100%' }}>
            <BookOutlined style={{ marginRight: 5, width: 16 }} /> {t('Optimization.Start') /* Get Started */}
          </Flex>
        ),
        'link gettingstarted',
      ),
    ]),
    getItem(t('Links.Title'), /* Links */ 'subLinks', <BarsOutlined />, [
      getItem(
        (
          <Typography.Link>
            <HomeOutlined style={{ marginRight: 2, width: 16 }} /> {t('Links.Home') /* Home */}
          </Typography.Link>
        ),
        AppPages.HOME,
      ),
      getItem(
        (
          <Typography.Link>
            <UnorderedListOutlined style={{ marginRight: 2, width: 16 }} /> {t('Links.Changelog') /* Changelog */}
          </Typography.Link>
        ),
        AppPages.CHANGELOG,
      ),
      getItem(
        <Typography.Link href='https://ko-fi.com/fribbels' target='_blank' rel='noopener noreferrer'>
          <CoffeeIcon style={{ marginRight: 5 }} /> {t('Links.Kofi') /* Ko-fi */}
        </Typography.Link>,
        'link donate',
      ),
      getItem(
        <Typography.Link href='https://discord.gg/rDmB4Un7qg' target='_blank' rel='noopener noreferrer'>
          <DiscordIcon style={{ marginRight: 5 }} /> {t('Links.Discord') /* Discord */}
        </Typography.Link>,
        'link discord',
      ),
      getItem(
        <Typography.Link href='https://github.com/fribbels/hsr-optimizer' target='_blank' rel='noopener noreferrer'>
          <GithubIcon style={{ marginRight: 5 }} /> {t('Links.Github') /* GitHub */}
        </Typography.Link>,
        'link github',
      ),
      officialOnly
        ? getItem(
          <Typography.Link href='https://fribbels.github.io/hsr-optimizer/' target='_blank' rel='noopener noreferrer'>
            <LinkOutlined style={{ marginRight: 5 }} /> {t('Links.Leaks') /* Beta content */}
          </Typography.Link>,
          'link leaks',
        )
        : getItem(
          <Typography.Link href='https://starrailoptimizer.github.io/' target='_blank' rel='noopener noreferrer'>
            <LinkOutlined style={{ marginRight: 5 }} /> {t('Links.Unleak') /* No leaks */}
          </Typography.Link>,
          'link leaks free',
        ),
    ]),
  ], [t])

  const onClick = (e: {
    key: string,
  }) => {
    if (e.key?.includes('link')) return

    setActiveKey(e.key as AppPage)
  }

  return (
    <Menu
      onClick={onClick}
      inlineIndent={12}
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['subOptimizer', 'subTools', 'subLinks']}
      selectedKeys={[activeKey]}
      mode='inline'
      items={items}
      className='no-highlight'
    />
  )
}

export default MenuDrawer
