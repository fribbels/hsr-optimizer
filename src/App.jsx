import React, { useState } from 'react'
import { CloseOutlined, MenuOutlined } from '@ant-design/icons'
import { Button, ConfigProvider, Flex, Layout, message, theme, Typography } from 'antd'
import MenuDrawer from 'components/MenuDrawer'
import Tabs from 'components/Tabs'
import { Assets } from 'lib/assets'

const { Header, Sider, Content } = Layout

const App = () => {
  const [messageApi, messageContextHolder] = message.useMessage()
  const [collapsed, setCollapsed] = useState(false)
  window.messageApi = messageApi

  return (
    <ConfigProvider
      theme={{
        token: {
          motionUnit: 0.1,
          colorBgBase: '#182239',
          opacityLoading: 0.15, // FormSetConditionals.js
        },
        components: {
          // OptimizerForm.js
          Cascader: {
            dropdownHeight: 660,
            controlItemWidth: 100,
            controlWidth: 100,
          },

          Collapse: {
            contentPadding: '0px 0px',
          },

          // MenuDrawer.js
          Menu: {
            margin: 2,
          },

          Slider: {
            handleColor: '#1668DC',
            handleActiveColor: '#1668DC',
            trackBg: '#1668DC',
            trackHoverBg: '#1668DC',
            dotBorderColor: '#1668DC',
            railHoverBg: '#ffffff80',
            railBg: '#ffffff12',
            handleLineWidth: 0,
            handleLineWidthHover: 0,
            handleSizeHover: 10,
          },
          InputNumber: {
            paddingInlineSM: 4,
          },
        },
        algorithm: theme.darkAlgorithm,
      }}
    >
      {messageContextHolder}
      <Layout hasSider style={{ minHeight: '100%' }}>
        <Sider
          width={170}
          style={{
            background: '#243356',
          }}
          collapsible
          collapsedWidth={0}
          collapsed={collapsed}
          trigger={null}
        >
          <div
            style={{
              position: 'sticky',
              top: 0,
              backgroundColor: '#243356',
            }}
          >
            <MenuDrawer />
          </div>
        </Sider>
        <Layout
          style={{
          }}
        >

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
                  icon={collapsed ? <MenuOutlined /> : <CloseOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    fontSize: '16px',
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
          <Content
            style={{
              padding: 10,
              margin: 0,
              minHeight: 280,
              minWidth: 1300,
              marginLeft: 'auto',
              marginRight: 'auto',
              overflow: 'initial',
            }}
          >
            <Tabs />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
