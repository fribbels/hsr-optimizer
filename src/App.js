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
import { Breadcrumb, Layout, Menu, theme, notification, message } from 'antd';
import MenuDrawer from './components/MenuDrawer'
import Tabs from './components/Tabs'
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
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
          // any theme overirdes
          colorBgBase: '#182239'
        },
        // this line sets it to dark mode
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
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            Fribbels Star Rail Optimizer
          </Typography>
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




      {/* <Toolbar
        sx={{
          pr: '24px', // keep right padding when drawer closed
        }}
      >
        <Typography
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
          sx={{ flexGrow: 1 }}
        >
          Fribbels Star Rail Jingliu Optimizer
        </Typography>
      </Toolbar>
      <Stack
        direction="row"
        spacing={2}>
        <MenuDrawer setActiveKey={setActiveKey}/>
        <ContentTabs activeKey={activeKey}/>
      </Stack> */}