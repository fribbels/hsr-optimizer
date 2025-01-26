import { CloseOutlined, MenuOutlined } from '@ant-design/icons'
import { Button, Flex, Layout, theme, Typography } from 'antd'
import { LanguageSelector } from 'lib/i18n/LanguageSelector'
import { Assets } from 'lib/rendering/assets'
import { BASE_PATH } from 'lib/state/db'

const { useToken } = theme
const { Header } = Layout

export function LayoutHeader() {
  const menuSidebarOpen = window.store((s) => s.menuSidebarOpen)
  const setMenuSidebarOpen = window.store((s) => s.setMenuSidebarOpen)
  const { token } = useToken()

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '30px',
        paddingRight: '0px',
        height: 48,
        width: '100%',
        backgroundColor: token.colorBgLayout,
        backgroundImage: 'linear-gradient(rgb(0 0 0/60%) 0 0)',
      }}
    >
      <Flex align='center' justify='space-between' style={{ width: '100%' }}>
        <Flex>
          <Button
            type='text'
            icon={menuSidebarOpen ? <CloseOutlined/> : <MenuOutlined/>}
            onClick={() => setMenuSidebarOpen(!menuSidebarOpen)}
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
              <Typography
                style={{ fontWeight: 600, fontSize: 22 }}
                color='inherit'
              >
                Fribbels Honkai Star Rail Optimizer
              </Typography>
            </Flex>
          </a>
        </Flex>
        <Flex>
          <LanguageSelector/>
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
    </Header>
  )
}
