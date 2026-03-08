import {
  IconBook,
  IconChartBar,
  IconChartLine,
  IconChartRadar,
  IconDiamond,
  IconHome,
  IconLayoutGrid,
  IconLink,
  IconList,
  IconMenu2,
  IconSettings,
  IconStarFilled,
  IconSun,
  IconUpload,
  IconUser,
} from '@tabler/icons-react'
import {
  Menu,
} from 'antd'
import { Anchor, Flex } from '@mantine/core'
import { CoffeeIcon } from 'icons/CoffeeIcon'
import { DiscordIcon } from 'icons/DiscordIcon'
import { GithubIcon } from 'icons/GithubIcon'
import { officialOnly } from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import {
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
    getItem(t('Tools.Title'), /* Tools */ 'subTools', <IconSun />, [
      getItem(
        (
          <Flex>
            <IconStarFilled style={{ marginRight: 5, width: 16 }} /> {t('Tools.Showcase') /* Showcase */}
          </Flex>
        ),
        AppPages.SHOWCASE,
      ),
      getItem(
        (
          <Flex>
            <IconLayoutGrid style={{ marginRight: 5, width: 16 }} /> {t('Tools.Benchmarks') /*Benchmarks*/}
          </Flex>
        ),
        AppPages.BENCHMARKS,
      ),
      getItem(
        (
          <Flex>
            <IconDiamond style={{ marginRight: 5, width: 16 }} /> {t('Tools.WarpPlanner') /* Warp Planner */}
          </Flex>
        ),
        AppPages.WARP,
      ),
    ]),
    getItem(t('Optimization.Title'), /* Optimization */ 'subOptimizer', <IconChartLine />, [
      getItem(
        (
          <Flex>
            <IconChartBar style={{ marginRight: 5, width: 16 }} /> {t('Optimization.Optimizer') /* Optimizer */}
          </Flex>
        ),
        AppPages.OPTIMIZER,
      ),
      getItem(
        (
          <Flex>
            <IconUser style={{ marginRight: 5, width: 16 }} /> {t('Optimization.Characters') /* Characters */}
          </Flex>
        ),
        AppPages.CHARACTERS,
      ),
      getItem(
        (
          <Flex>
            <IconChartRadar style={{ marginRight: 5, width: 16 }} /> {t('Optimization.Relics') /* Relics */}
          </Flex>
        ),
        AppPages.RELICS,
      ),
      getItem(
        (
          <Flex>
            <IconUpload style={{ marginRight: 5, width: 16 }} /> {t('Optimization.Import') /* Import / Save */}
          </Flex>
        ),
        AppPages.IMPORT,
      ),
      getItem(
        (
          <Flex onClick={() => setOpen(OpenCloseIDs.SETTINGS_DRAWER)} style={{ width: '100%' }}>
            <IconSettings style={{ marginRight: 5, width: 16 }} /> {t('Optimization.Settings') /* Settings */}
          </Flex>
        ),
        'link settings',
      ),
      getItem(
        (
          <Flex onClick={() => setOpen(OpenCloseIDs.GETTING_STARTED_DRAWER)} style={{ width: '100%' }}>
            <IconBook style={{ marginRight: 5, width: 16 }} /> {t('Optimization.Start') /* Get Started */}
          </Flex>
        ),
        'link gettingstarted',
      ),
    ]),
    getItem(t('Links.Title'), /* Links */ 'subLinks', <IconMenu2 />, [
      getItem(
        (
          <Anchor>
            <IconHome style={{ marginRight: 2, width: 16 }} /> {t('Links.Home') /* Home */}
          </Anchor>
        ),
        AppPages.HOME,
      ),
      getItem(
        (
          <Anchor>
            <IconList style={{ marginRight: 2, width: 16 }} /> {t('Links.Changelog') /* Changelog */}
          </Anchor>
        ),
        AppPages.CHANGELOG,
      ),
      getItem(
        <Anchor href='https://ko-fi.com/fribbels' target='_blank' rel='noopener noreferrer'>
          <CoffeeIcon style={{ marginRight: 5 }} /> {t('Links.Kofi') /* Ko-fi */}
        </Anchor>,
        'link donate',
      ),
      getItem(
        <Anchor href='https://discord.gg/rDmB4Un7qg' target='_blank' rel='noopener noreferrer'>
          <DiscordIcon style={{ marginRight: 5 }} /> {t('Links.Discord') /* Discord */}
        </Anchor>,
        'link discord',
      ),
      getItem(
        <Anchor href='https://github.com/fribbels/hsr-optimizer' target='_blank' rel='noopener noreferrer'>
          <GithubIcon style={{ marginRight: 5 }} /> {t('Links.Github') /* GitHub */}
        </Anchor>,
        'link github',
      ),
      officialOnly
        ? getItem(
          <Anchor href='https://fribbels.github.io/hsr-optimizer/' target='_blank' rel='noopener noreferrer'>
            <IconLink style={{ marginRight: 5 }} /> {t('Links.Leaks') /* Beta content */}
          </Anchor>,
          'link leaks',
        )
        : getItem(
          <Anchor href='https://starrailoptimizer.github.io/' target='_blank' rel='noopener noreferrer'>
            <IconLink style={{ marginRight: 5 }} /> {t('Links.Unleak') /* No leaks */}
          </Anchor>,
          'link leaks free',
        ),
    ]),
  ], [t])

  const onClick = (e: {
    key: string,
  }) => {
    if (e.key?.includes('link')) return

    setActiveKey(e.key as AppPages)
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
