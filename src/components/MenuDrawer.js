import React from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined, LinkOutlined, MenuOutlined, GithubOutlined } from '@ant-design/icons';
import { ConfigProvider, Menu, Typography } from 'antd';
import { DiscordIcon } from '../icons/DiscordIcon';
import { GithubIcon } from '../icons/GithubIcon';
import { CoffeeIcon } from '../icons/CoffeeIcon';

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}
const items = [
  getItem('Menu', 'sub1',  <MenuOutlined />, [
    getItem('Optimizer', 'optimizer'), 
    getItem('Characters', 'characters'),
    getItem('Relics', 'relics'),
    getItem('Import / Save', 'import'),
    getItem('Getting started', '#getting-started'),
  ]),
  getItem('Tools', 'sub2', <MenuOutlined />, [
    getItem('Relic scorer', '#scorer'),
    getItem('Coming soon', 'coming-soon'),
  ]),
  getItem('Links', 'sub4', <MenuOutlined />, [
    getItem(
      <Typography.Link href="https://discord.gg/rDmB4Un7qg" target="_blank" rel="noopener noreferrer">
        {/* Discord <DiscordIcon style={{marginLeft: 5}} /> */}
        <DiscordIcon style={{marginRight: 5}} /> Discord 
      </Typography.Link>,
      'link discord',
      // <LinkOutlined />,
    ),
    getItem(
      <Typography.Link href="https://www.patreon.com/fribbels" target="_blank" rel="noopener noreferrer">
        {/* Donate <CoffeeIcon style={{marginLeft: 5}} /> */}
        <CoffeeIcon style={{marginRight: 5}} /> Donate 
      </Typography.Link>,
      'link donate',
      // <LinkOutlined />,
    ),
    getItem(
      <Typography.Link href="https://github.com/fribbels/hsr-optimizer" target="_blank" rel="noopener noreferrer">
        {/* Github <GithubIcon style={{marginLeft: 5}} /> */}
        <GithubIcon style={{marginRight: 5}} /> Github 
      </Typography.Link>,
      'link github',
      // <LinkOutlined />,
    ),
  ]),
];

const MenuDrawer = ({hashes}) => {
  const setActiveKey = store(s => s.setActiveKey)

  const onClick = (e) => {
    if (e.key && e.key.includes('link')) return

    if (hashes.includes(e.key)) {
      history.replaceState(null, null, e.key)
    } else {
      history.replaceState(null, null, ' ');
    }

    console.log('click ', e);
    setActiveKey(e.key)
  };
  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            margin: 2
          },
        },
      }}
    >
      <Menu
        onClick={onClick}
        // inlineIndent={15} 
        style={{
          height: '100%',
          overflow: 'auto'

        }}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1', 'sub2', 'sub4']}
        mode="inline"
        items={items}
      />
    </ConfigProvider>
  );
};
export default MenuDrawer;