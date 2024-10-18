import { Button, Flex, Layout, theme, Typography } from 'antd'
import { CloseOutlined, MenuOutlined } from '@ant-design/icons'
import { Assets } from 'lib/assets.js'
import { BASE_PATH } from '../lib/db'

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
            <Flex align='center'>
              <img src={Assets.getLogo()} style={{ width: 30, height: 30, marginRight: 35 }}></img>
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
          {/* Disabling temporarily until translations are done */}
          {/*<LanguageSelector style={{ width: 60, marginRight: 6, height: 36 }} dropdownStyle={{ width: 210 }} flagOnly placement='bottomRight'/>*/}
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
