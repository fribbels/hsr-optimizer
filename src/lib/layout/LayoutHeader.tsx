import {
  IconMenu2,
  IconX,
} from '@tabler/icons-react'
import { Button, Flex, Text, useMantineTheme } from '@mantine/core'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { LanguageSelector } from 'lib/i18n/LanguageSelector'
import { Assets } from 'lib/rendering/assets'
import { BASE_PATH } from 'lib/state/db'

export const HEADER_HEIGHT = 48

export function LayoutHeader() {
  const { isOpen: isOpenMenuSidebar, toggle: toggleMenuSidebar } = useOpenClose(OpenCloseIDs.MENU_SIDEBAR)
  const theme = useMantineTheme()

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '30px',
        paddingRight: '0px',
        height: HEADER_HEIGHT,
        width: '100%',
        backgroundColor: theme.colors.dark[8],
        backgroundImage: 'linear-gradient(rgb(0 0 0/60%) 0 0)',
      }}
    >
      <Flex align='center' justify='space-between' style={{ width: '100%' }}>
        <Flex>
          <Button
            variant='transparent'
            leftSection={isOpenMenuSidebar ? <IconX size={16} /> : <IconMenu2 size={16} />}
            onClick={toggleMenuSidebar}
            style={{
              fontSize: '16px',
              position: 'relative',
              left: '-20px',
            }}
          />
          <a href={BASE_PATH}>
            <Flex
              align='center'
              style={{
                position: 'relative',
                left: '-10px',
              }}
            >
              <img src={Assets.getLogo()} style={{ width: 30, height: 30, marginRight: 15 }}></img>
              <Text
                style={{ fontWeight: 600, fontSize: 22 }}
              >
                Fribbels Honkai Star Rail Optimizer
              </Text>
            </Flex>
          </a>
        </Flex>
        <Flex>
          <LanguageSelector />
          <a href='https://ko-fi.com/fribbels' target='_blank' rel='noreferrer'>
            <Flex>
              <img src={Assets.getKofi()} style={{ height: 36, marginRight: 6, borderRadius: 5 }}></img>
            </Flex>
          </a>
          <a href='https://github.com/fribbels/hsr-optimizer' target='_blank' rel='noreferrer'>
            <Flex>
              <img src={Assets.getGithub()} style={{ height: 36, marginRight: 6, borderRadius: 5 }}></img>
            </Flex>
          </a>
          <a href='https://discord.gg/rDmB4Un7qg' target='_blank' rel='noreferrer'>
            <Flex>
              <img src={Assets.getDiscord()} style={{ height: 36, marginRight: 8, borderRadius: 5 }}></img>
            </Flex>
          </a>
        </Flex>
      </Flex>
    </header>
  )
}
