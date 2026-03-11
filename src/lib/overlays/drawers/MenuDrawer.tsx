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
import { useGlobalStore } from 'lib/stores/appStore'
import { AppPages } from 'lib/constants/appPages'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'
import classes from './MenuDrawer.module.css'

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
  const activeKey = useGlobalStore((s) => s.activeKey)
  const setActiveKey = useGlobalStore((s) => s.setActiveKey)

  const items = useMemo(() => [
    getItem(t('Tools.Title'), /* Tools */ 'subTools', <IconSun />, [
      getItem(
        (
          <Flex>
            <IconStarFilled className={classes.menuIcon} /> {t('Tools.Showcase') /* Showcase */}
          </Flex>
        ),
        AppPages.SHOWCASE,
      ),
      getItem(
        (
          <Flex>
            <IconLayoutGrid className={classes.menuIcon} /> {t('Tools.Benchmarks') /*Benchmarks*/}
          </Flex>
        ),
        AppPages.BENCHMARKS,
      ),
      getItem(
        (
          <Flex>
            <IconDiamond className={classes.menuIcon} /> {t('Tools.WarpPlanner') /* Warp Planner */}
          </Flex>
        ),
        AppPages.WARP,
      ),
    ]),
    getItem(t('Optimization.Title'), /* Optimization */ 'subOptimizer', <IconChartLine />, [
      getItem(
        (
          <Flex>
            <IconChartBar className={classes.menuIcon} /> {t('Optimization.Optimizer') /* Optimizer */}
          </Flex>
        ),
        AppPages.OPTIMIZER,
      ),
      getItem(
        (
          <Flex>
            <IconUser className={classes.menuIcon} /> {t('Optimization.Characters') /* Characters */}
          </Flex>
        ),
        AppPages.CHARACTERS,
      ),
      getItem(
        (
          <Flex>
            <IconChartRadar className={classes.menuIcon} /> {t('Optimization.Relics') /* Relics */}
          </Flex>
        ),
        AppPages.RELICS,
      ),
      getItem(
        (
          <Flex>
            <IconUpload className={classes.menuIcon} /> {t('Optimization.Import') /* Import / Save */}
          </Flex>
        ),
        AppPages.IMPORT,
      ),
      getItem(
        (
          <Flex onClick={() => setOpen(OpenCloseIDs.SETTINGS_DRAWER)} className={classes.fullWidth}>
            <IconSettings className={classes.menuIcon} /> {t('Optimization.Settings') /* Settings */}
          </Flex>
        ),
        'link settings',
      ),
      getItem(
        (
          <Flex onClick={() => setOpen(OpenCloseIDs.GETTING_STARTED_DRAWER)} className={classes.fullWidth}>
            <IconBook className={classes.menuIcon} /> {t('Optimization.Start') /* Get Started */}
          </Flex>
        ),
        'link gettingstarted',
      ),
    ]),
    getItem(t('Links.Title'), /* Links */ 'subLinks', <IconMenu2 />, [
      getItem(
        (
          <Flex>
            <IconHome className={classes.menuIconNarrow} /> {t('Links.Home') /* Home */}
          </Flex>
        ),
        AppPages.HOME,
      ),
      getItem(
        (
          <Flex>
            <IconList className={classes.menuIconNarrow} /> {t('Links.Changelog') /* Changelog */}
          </Flex>
        ),
        AppPages.CHANGELOG,
      ),
      getItem(
        <Flex>
          <CoffeeIcon className={classes.menuIconLink} /> {t('Links.Kofi') /* Ko-fi */}
        </Flex>,
        'link donate',
        undefined,
        undefined,
        'https://ko-fi.com/fribbels',
      ),
      getItem(
        <Flex>
          <DiscordIcon className={classes.menuIconLink} /> {t('Links.Discord') /* Discord */}
        </Flex>,
        'link discord',
        undefined,
        undefined,
        'https://discord.gg/rDmB4Un7qg',
      ),
      getItem(
        <Flex>
          <GithubIcon className={classes.menuIconLink} /> {t('Links.Github') /* GitHub */}
        </Flex>,
        'link github',
        undefined,
        undefined,
        'https://github.com/fribbels/hsr-optimizer',
      ),
      officialOnly
        ? getItem(
          <Flex>
            <IconLink className={classes.menuIconLink} /> {t('Links.Leaks') /* Beta content */}
          </Flex>,
          'link leaks',
          undefined,
          undefined,
          'https://fribbels.github.io/hsr-optimizer/',
        )
        : getItem(
          <Flex>
            <IconLink className={classes.menuIconLink} /> {t('Links.Unleak') /* No leaks */}
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
