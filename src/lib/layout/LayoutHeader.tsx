import {
  IconMenu2,
  IconX,
} from '@tabler/icons-react'
import { Button, Flex, Text } from '@mantine/core'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { LanguageSelector } from 'lib/i18n/LanguageSelector'
import { Assets } from 'lib/rendering/assets'
import { BASE_PATH } from 'lib/constants/appPages'
import classes from 'lib/layout/layout.module.css'

export const HEADER_HEIGHT = 48

function SocialLink(props: { href: string; src: string; mr: number }) {
  return (
    <a href={props.href} target='_blank' rel='noreferrer'>
      <img src={props.src} className={classes.socialIcon} style={{ marginRight: props.mr }} />
    </a>
  )
}

export function LayoutHeader() {
  const { isOpen: isOpenMenuSidebar, toggle: toggleMenuSidebar } = useOpenClose(OpenCloseIDs.MENU_SIDEBAR)

  return (
    <header className={classes.header} style={{ height: HEADER_HEIGHT }}>
      <Flex align='center' justify='space-between' className={classes.headerInner}>
        <Flex>
          <Button
            variant='transparent'
            leftSection={isOpenMenuSidebar ? <IconX size={16} /> : <IconMenu2 size={16} />}
            onClick={toggleMenuSidebar}
            className={classes.menuButton}
          />
          <a href={BASE_PATH}>
            <Flex align='center' className={classes.logoLink}>
              <img src={Assets.getLogo()} className={classes.logo} />
              <Text className={classes.title}>
                Fribbels Honkai Star Rail Optimizer
              </Text>
            </Flex>
          </a>
        </Flex>
        <Flex>
          <LanguageSelector />
          <SocialLink href='https://ko-fi.com/fribbels' src={Assets.getKofi()} mr={6} />
          <SocialLink href='https://github.com/fribbels/hsr-optimizer' src={Assets.getGithub()} mr={6} />
          <SocialLink href='https://discord.gg/rDmB4Un7qg' src={Assets.getDiscord()} mr={8} />
        </Flex>
      </Flex>
    </header>
  )
}
