import logo from './logo.svg';

import React, {useEffect} from "react"
import {
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  ShopOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

import { LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, notification, Typography, message, Flex } from 'antd';
import MenuDrawer from './components/MenuDrawer'
import Tabs from './components/Tabs'
import { SmileOutlined } from '@ant-design/icons';

import {
  ConfigProvider,
} from 'antd';

const { Header, Sider, Content, Footer } = Layout;

const App = () => {
  const [notificationApi, notificationContextHolder] = notification.useNotification();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [activeKey, setActiveKey] = React.useState("1");

  window.notificationApi = notificationApi
  window.messageApi = messageApi

  useEffect(() => {
  }, [])

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgBase: '#182239'
        },
        algorithm: theme.darkAlgorithm,
      }}
    >      
      {notificationContextHolder}
      {messageContextHolder}
      <Layout style={{'minHeight': '100%'}}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 30px',
            height: 50
          }}
        >
          <a href="/">
            <Flex align='center'>
              <img src={Assets.getLogo()} style={{width: 30, height: 30, marginRight: 20}}></img>
              <Typography
                style={{fontWeight: 600, fontSize: 22}}
                color="inherit"
              >
                Fribbels Honkai Star Rail Optimizer
              </Typography>
            </Flex>
          </a>
        </Header>
        <Layout>
          <Sider
            width={200}
          >
            <MenuDrawer setActiveKey={setActiveKey}/>
          </Sider>
          <Layout
            style={{
            }}
          >
            <Content
              style={{
                padding: 10,
                margin: 0,
                minHeight: 280,
              }}
            >
              <Tabs activeKey={activeKey}/>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};
export default App;