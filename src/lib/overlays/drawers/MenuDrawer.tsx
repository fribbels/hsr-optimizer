import {
  Box,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import {
  IconBook,
  IconChartRadar,
  IconDiamond,
  IconHome,
  IconLayoutGrid,
  IconLink,
  IconList,
  IconSettings,
  IconStarFilled,
  IconTrendingUp,
  IconUpload,
  IconUser,
} from '@tabler/icons-react'
import { CoffeeIcon } from 'icons/CoffeeIcon'
import { DiscordIcon } from 'icons/DiscordIcon'
import { GithubIcon } from 'icons/GithubIcon'
import { AppPages } from 'lib/constants/appPages'
import { officialOnly } from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
  useIsOpen,
} from 'lib/hooks/useOpenClose'
import { useGlobalStore } from 'lib/stores/app/appStore'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import classes from './MenuDrawer.module.css'

// ---- Types ----

type NavItem = {
  key: string,
  label: string,
  icon: React.ReactNode,
  href?: string,
  onClick?: () => void,
}

type NavGroup = {
  label: string,
  items: NavItem[],
}

// Drawer-opening items that should hold visual focus when clicked
const DRAWER_KEYS = new Set(['link settings', 'link gettingstarted'])

// ---- Expanded sidebar ----

function SidebarNavExpanded({ groups, activeKey, onNavigate, anyDrawerOpen }: {
  groups: NavGroup[],
  activeKey: string,
  onNavigate: (item: NavItem) => void,
  anyDrawerOpen: boolean,
}) {
  const navRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const highlightedRef = useRef<HTMLElement>(null)
  const [indicatorVisible, setIndicatorVisible] = useState(false)
  // Track which drawer item is visually focused (Settings / Get Started)
  const [focusedKey, setFocusedKey] = useState<string | null>(null)

  // Clear focused key when drawer closes
  useEffect(() => {
    if (!anyDrawerOpen) {
      setFocusedKey(null)
    }
  }, [anyDrawerOpen])

  const moveIndicator = useCallback((el: HTMLElement | null) => {
    if (!el || !navRef.current || !indicatorRef.current) return
    const navRect = navRef.current.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const top = elRect.top - navRect.top
    indicatorRef.current.style.transform = `translateY(${top}px)`
    indicatorRef.current.style.height = `${elRect.height}px`
    setIndicatorVisible(true)
  }, [])

  // Snap indicator to the highlighted item (active page or focused drawer item)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      moveIndicator(highlightedRef.current)
    })
    return () => cancelAnimationFrame(frame)
  }, [activeKey, focusedKey, moveIndicator])

  // Reposition indicator when layout shifts (e.g. sidebar expand/collapse)
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const ro = new ResizeObserver(() => {
      moveIndicator(highlightedRef.current)
    })
    ro.observe(nav)
    // Also observe all nav items so position shifts from items above are caught
    nav.querySelectorAll('button, a').forEach((el) => ro.observe(el))
    return () => ro.disconnect()
  }, [moveIndicator])

  const handleClick = (item: NavItem) => {
    if (DRAWER_KEYS.has(item.key)) {
      setFocusedKey(item.key)
    } else {
      setFocusedKey(null)
    }
    onNavigate(item)
  }

  // The "highlighted" item is either the focused drawer item or the active page
  const highlightedKey = focusedKey ?? activeKey

  return (
    <div ref={navRef} className={classes.root}>
      <div
        ref={indicatorRef}
        className={classes.indicator}
        style={{ opacity: indicatorVisible ? 1 : 0 }}
      />

      {groups.map((group) => (
        <div key={group.label} className={classes.group}>
          <div className={classes.groupLabel}>{group.label}</div>
          <div className={classes.groupItems}>
            {group.items.map((item) => {
              const isHighlighted = item.key === highlightedKey
              const isActive = item.key === activeKey
              const isFocused = item.key === focusedKey
              const ref = isHighlighted ? highlightedRef : undefined
              const dataProps = {
                'className': classes.item,
                'data-active': isActive || undefined,
                'data-focused': isFocused || undefined,
              }
              const content = (
                <>
                  <div className={classes.itemIcon}>{item.icon}</div>
                  <span className={classes.itemLabel}>{item.label}</span>
                </>
              )
              return item.href
                ? (
                  <a key={item.key} ref={ref as React.Ref<HTMLAnchorElement>} {...dataProps} href={item.href} target='_blank' rel='noopener noreferrer'>
                    {content}
                  </a>
                )
                : (
                  <UnstyledButton
                    key={item.key}
                    ref={ref as React.Ref<HTMLButtonElement>}
                    {...dataProps}
                    onMouseDown={(e: React.MouseEvent) => {
                      if (e.button === 0) handleClick(item)
                    }}
                  >
                    {content}
                  </UnstyledButton>
                )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---- Collapsed sidebar (icon-only with tooltips) ----

function SidebarNavCollapsed({ groups, activeKey, onNavigate }: {
  groups: NavGroup[],
  activeKey: string,
  onNavigate: (item: NavItem) => void,
}) {
  return (
    <div className={classes.rootCollapsed}>
      {groups.map((group) => (
        <div key={group.label} className={classes.group}>
          <div className={classes.groupItems}>
            {group.items.map((item) => {
              const isActive = item.key === activeKey
              const iconContent = <Box className={classes.itemIcon}>{item.icon}</Box>
              return (
                <Tooltip key={item.key} label={item.label} position='right' withArrow openDelay={300}>
                  {item.href
                    ? (
                      <a
                        className={classes.itemCollapsed}
                        data-active={isActive || undefined}
                        href={item.href}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {iconContent}
                      </a>
                    )
                    : (
                      <UnstyledButton
                        className={classes.itemCollapsed}
                        data-active={isActive || undefined}
                        onMouseDown={(e: React.MouseEvent) => {
                          if (e.button === 0) onNavigate(item)
                        }}
                      >
                        {iconContent}
                      </UnstyledButton>
                    )}
                </Tooltip>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---- Main component ----

export function MenuDrawer({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation('sidebar')
  const { activeKey, setActiveKey } = useGlobalStore(useShallow((s) => ({
    activeKey: s.activeKey,
    setActiveKey: s.setActiveKey,
  })))

  const groups: NavGroup[] = useMemo(() => [
    {
      label: t('Tools.Title'),
      items: [
        { key: AppPages.SHOWCASE, label: t('Tools.Showcase'), icon: <IconStarFilled size={16} /> },
        { key: AppPages.BENCHMARKS, label: t('Tools.Benchmarks'), icon: <IconLayoutGrid size={16} /> },
        { key: AppPages.WARP, label: t('Tools.WarpPlanner'), icon: <IconDiamond size={16} /> },
      ],
    },
    {
      label: t('Optimization.Title'),
      items: [
        { key: AppPages.OPTIMIZER, label: t('Optimization.Optimizer'), icon: <IconTrendingUp size={16} /> },
        { key: AppPages.CHARACTERS, label: t('Optimization.Characters'), icon: <IconUser size={16} /> },
        { key: AppPages.RELICS, label: t('Optimization.Relics'), icon: <IconChartRadar size={16} /> },
        { key: AppPages.IMPORT, label: t('Optimization.Import'), icon: <IconUpload size={16} /> },
        {
          key: 'link settings',
          label: t('Optimization.Settings'),
          icon: <IconSettings size={16} />,
          onClick: () => setOpen(OpenCloseIDs.SETTINGS_DRAWER),
        },
        {
          key: 'link gettingstarted',
          label: t('Optimization.Start'),
          icon: <IconBook size={16} />,
          onClick: () => setOpen(OpenCloseIDs.GETTING_STARTED_DRAWER),
        },
      ],
    },
    {
      label: t('Links.Title'),
      items: [
        { key: AppPages.HOME, label: t('Links.Home'), icon: <IconHome size={16} /> },
        { key: AppPages.CHANGELOG, label: t('Links.Changelog'), icon: <IconList size={16} /> },
        { key: 'link donate', label: t('Links.Kofi'), icon: <CoffeeIcon />, href: 'https://ko-fi.com/fribbels' },
        { key: 'link discord', label: t('Links.Discord'), icon: <DiscordIcon />, href: 'https://discord.gg/rDmB4Un7qg' },
        { key: 'link github', label: t('Links.Github'), icon: <GithubIcon />, href: 'https://github.com/fribbels/hsr-optimizer' },
        officialOnly
          ? { key: 'link leaks', label: t('Links.Leaks'), icon: <IconLink size={16} />, href: 'https://fribbels.github.io/hsr-optimizer/' }
          : { key: 'link leaks free', label: t('Links.Unleak'), icon: <IconLink size={16} />, href: 'https://starrailoptimizer.github.io/' },
      ],
    },
  ], [t])

  const isSettingsOpen = useIsOpen(OpenCloseIDs.SETTINGS_DRAWER)
  const isGettingStartedOpen = useIsOpen(OpenCloseIDs.GETTING_STARTED_DRAWER)
  const anyDrawerOpen = isSettingsOpen || isGettingStartedOpen

  const handleNavigate = useCallback((item: NavItem) => {
    item.onClick?.()
    if (item.href || item.key.startsWith('link ')) return
    setActiveKey(item.key as AppPages)
  }, [setActiveKey])

  const nav = collapsed
    ? <SidebarNavCollapsed groups={groups} activeKey={activeKey} onNavigate={handleNavigate} />
    : <SidebarNavExpanded groups={groups} activeKey={activeKey} onNavigate={handleNavigate} anyDrawerOpen={anyDrawerOpen} />

  return (
    <div className={classes.wrapper}>
      {nav}
    </div>
  )
}
