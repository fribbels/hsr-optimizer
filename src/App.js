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
import { Breadcrumb, Layout, Menu, theme, notification, Typography, message } from 'antd';
import MenuDrawer from './components/MenuDrawer'
import Tabs from './components/Tabs'
import { SmileOutlined } from '@ant-design/icons';

import {
  ConfigProvider,
} from 'antd';

const { Header, Sider, Content, Footer } = Layout;

const items = [
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  BarChartOutlined,
  CloudOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ShopOutlined,
].map((icon, index) => ({
  key: String(index + 1),
  icon: React.createElement(icon),
  label: `nav ${index + 1}`,
}));

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
            height: 50
          }}
        >
          <a href="/">
            <Typography
              style={{fontWeight: 600, fontSize: 22}}
              color="inherit"
            >
              Fribbels Star Rail Optimizer
            </Typography>
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
                padding: 18,
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