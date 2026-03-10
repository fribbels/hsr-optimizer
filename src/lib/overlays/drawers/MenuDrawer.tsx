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
import { Flex, NavLink } from '@mantine/core'
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
  href?: string,
}

function getItem(label: string | ReactElement, key: string, icon?: ReactElement, children?: MenuItemProperties[], href?: string): MenuItemProperties {
  return {
    label,
    key,
    icon,
    children,
    href,
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
          <Flex>
            <IconHome style={{ marginRight: 2, width: 16 }} /> {t('Links.Home') /* Home */}
          </Flex>
        ),
        AppPages.HOME,
      ),
      getItem(
        (
          <Flex>
            <IconList style={{ marginRight: 2, width: 16 }} /> {t('Links.Changelog') /* Changelog */}
          </Flex>
        ),
        AppPages.CHANGELOG,
      ),
      getItem(
        <Flex>
          <CoffeeIcon style={{ marginRight: 5 }} /> {t('Links.Kofi') /* Ko-fi */}
        </Flex>,
        'link donate',
        undefined,
        undefined,
        'https://ko-fi.com/fribbels',
      ),
      getItem(
        <Flex>
          <DiscordIcon style={{ marginRight: 5 }} /> {t('Links.Discord') /* Discord */}
        </Flex>,
        'link discord',
        undefined,
        undefined,
        'https://discord.gg/rDmB4Un7qg',
      ),
      getItem(
        <Flex>
          <GithubIcon style={{ marginRight: 5 }} /> {t('Links.Github') /* GitHub */}
        </Flex>,
        'link github',
        undefined,
        undefined,
        'https://github.com/fribbels/hsr-optimizer',
      ),
      officialOnly
        ? getItem(
          <Flex>
            <IconLink style={{ marginRight: 5 }} /> {t('Links.Leaks') /* Beta content */}
          </Flex>,
          'link leaks',
          undefined,
          undefined,
          'https://fribbels.github.io/hsr-optimizer/',
        )
        : getItem(
          <Flex>
            <IconLink style={{ marginRight: 5 }} /> {t('Links.Unleak') /* No leaks */}
          </Flex>,
          'link leaks free',
          undefined,
          undefined,
          'https://starrailoptimizer.github.io/',
        ),
    ]),
  ], [t])

  const onClick = (key: string) => {
    if (key?.includes('link')) return

    setActiveKey(key as AppPages)
  }

  return (
    <Flex direction="column" className='no-highlight'>
      {items.map((group) => (
        <NavLink
          key={group.key}
          label={group.label}
          leftSection={group.icon}
          defaultOpened
          childrenOffset={12}
        >
          {group.children?.map((child) => (
            <NavLink
              key={child.key}
              label={child.label}
              active={activeKey === child.key}
              onClick={() => onClick(child.key)}
              {...(child.href ? { component: 'a' as const, href: child.href, target: '_blank', rel: 'noopener noreferrer' } : {})}
            />
          ))}
        </NavLink>
      ))}
    </Flex>
  )
}

export default MenuDrawer
