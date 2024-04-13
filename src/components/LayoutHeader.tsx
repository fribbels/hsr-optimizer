import { Button, Flex, Layout, Typography } from 'antd'
import { CloseOutlined, MenuOutlined } from '@ant-design/icons'
import { Assets } from 'lib/assets.js'

const { Header } = Layout

export function LayoutHeader() {
  const menuSidebarOpen = window.store((s) => s.menuSidebarOpen)
  const setMenuSidebarOpen = window.store((s) => s.setMenuSidebarOpen)

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '30px',
        paddingRight: '0px',
        height: 48,
        width: '100%',
      }}
    >
      <Flex align="center" justify="space-between" style={{ width: '100%' }}>
        <Flex>
          <Button
            type="text"
            icon={menuSidebarOpen ? <CloseOutlined /> : <MenuOutlined />}
            onClick={() => setMenuSidebarOpen(!menuSidebarOpen)}
            style={{
              fontSize: '15.5px',
              position: 'relative',
              left: '-20px',
            }}
          />
          <a href="/hsr-optimizer">
            <Flex align="center">
              <img src={Assets.getLogo()} style={{ width: 30, height: 30, marginRight: 25 }}></img>
              <Typography
                style={{ fontWeight: 600, fontSize: 22 }}
                color="inherit"
              >
                Fribbels Honkai Star Rail Optimizer
              </Typography>
            </Flex>
          </a>
        </Flex>
        <Flex>
          <a href="https://github.com/fribbels/hsr-optimizer" target="_blank" rel="noreferrer">
            <Flex>
              <img src={Assets.getGithub()} style={{ height: 36, marginRight: 7, borderRadius: 5 }}></img>
            </Flex>
          </a>

          <a href="https://discord.gg/rDmB4Un7qg" target="_blank" rel="noreferrer">
            <Flex>
              <img src={Assets.getDiscord()} style={{ height: 36, marginRight: 7, borderRadius: 5 }}></img>
            </Flex>
          </a>
        </Flex>
      </Flex>
    </Header>
  )
}
