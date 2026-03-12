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
import { useShallow } from 'zustand/react/shallow'
import classes from './MenuDrawer.module.css'

type MenuItemProperties = {
  label: string | ReactElement
  key: string
  icon?: ReactElement
  children?: MenuItemProperties[]
  href?: string
}

function MenuLabel(props: { icon: ReactElement; label: string; onClick?: () => void }) {
  return (
    <Flex onClick={props.onClick} className={props.onClick ? classes.fullWidth : undefined}>
      {props.icon} {props.label}
    </Flex>
  )
}

const MenuDrawer = () => {
  const { t } = useTranslation('sidebar')
  const { activeKey, setActiveKey } = useGlobalStore(useShallow((s) => ({ activeKey: s.activeKey, setActiveKey: s.setActiveKey })))

  const items: MenuItemProperties[] = useMemo(() => [
    {
      label: t('Tools.Title') /* Tools */,
      key: 'subTools',
      icon: <IconSun />,
      children: [
        { label: <MenuLabel icon={<IconStarFilled className={classes.menuIcon} />} label={t('Tools.Showcase')} />, key: AppPages.SHOWCASE },
        { label: <MenuLabel icon={<IconLayoutGrid className={classes.menuIcon} />} label={t('Tools.Benchmarks')} />, key: AppPages.BENCHMARKS },
        { label: <MenuLabel icon={<IconDiamond className={classes.menuIcon} />} label={t('Tools.WarpPlanner')} />, key: AppPages.WARP },
      ],
    },
    {
      label: t('Optimization.Title') /* Optimization */,
      key: 'subOptimizer',
      icon: <IconChartLine />,
      children: [
        { label: <MenuLabel icon={<IconChartBar className={classes.menuIcon} />} label={t('Optimization.Optimizer')} />, key: AppPages.OPTIMIZER },
        { label: <MenuLabel icon={<IconUser className={classes.menuIcon} />} label={t('Optimization.Characters')} />, key: AppPages.CHARACTERS },
        { label: <MenuLabel icon={<IconChartRadar className={classes.menuIcon} />} label={t('Optimization.Relics')} />, key: AppPages.RELICS },
        { label: <MenuLabel icon={<IconUpload className={classes.menuIcon} />} label={t('Optimization.Import')} />, key: AppPages.IMPORT },
        {
          label: <MenuLabel icon={<IconSettings className={classes.menuIcon} />} label={t('Optimization.Settings')} onClick={() => setOpen(OpenCloseIDs.SETTINGS_DRAWER)} />,
          key: 'link settings',
        },
        {
          label: <MenuLabel icon={<IconBook className={classes.menuIcon} />} label={t('Optimization.Start')} onClick={() => setOpen(OpenCloseIDs.GETTING_STARTED_DRAWER)} />,
          key: 'link gettingstarted',
        },
      ],
    },
    {
      label: t('Links.Title') /* Links */,
      key: 'subLinks',
      icon: <IconMenu2 />,
      children: [
        { label: <MenuLabel icon={<IconHome className={classes.menuIconNarrow} />} label={t('Links.Home')} />, key: AppPages.HOME },
        { label: <MenuLabel icon={<IconList className={classes.menuIconNarrow} />} label={t('Links.Changelog')} />, key: AppPages.CHANGELOG },
        { label: <MenuLabel icon={<CoffeeIcon className={classes.menuIconLink} />} label={t('Links.Kofi')} />, key: 'link donate', href: 'https://ko-fi.com/fribbels' },
        { label: <MenuLabel icon={<DiscordIcon className={classes.menuIconLink} />} label={t('Links.Discord')} />, key: 'link discord', href: 'https://discord.gg/rDmB4Un7qg' },
        { label: <MenuLabel icon={<GithubIcon className={classes.menuIconLink} />} label={t('Links.Github')} />, key: 'link github', href: 'https://github.com/fribbels/hsr-optimizer' },
        officialOnly
          ? { label: <MenuLabel icon={<IconLink className={classes.menuIconLink} />} label={t('Links.Leaks')} />, key: 'link leaks', href: 'https://fribbels.github.io/hsr-optimizer/' }
          : { label: <MenuLabel icon={<IconLink className={classes.menuIconLink} />} label={t('Links.Unleak')} />, key: 'link leaks free', href: 'https://starrailoptimizer.github.io/' },
      ],
    },
  ], [t])

  const onClick = (child: MenuItemProperties) => {
    if (child.href || child.key.startsWith('link ')) return
    setActiveKey(child.key as AppPages)
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
              onClick={() => onClick(child)}
              {...(child.href ? { component: 'a' as const, href: child.href, target: '_blank', rel: 'noopener noreferrer' } : {})}
            />
          ))}
        </NavLink>
      ))}
    </Flex>
  )
}

export default MenuDrawer
