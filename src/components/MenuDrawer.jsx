import React, { Profiler } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { Menu, Typography } from 'antd';
import { DiscordIcon } from '../icons/DiscordIcon';
import { GithubIcon } from '../icons/GithubIcon';
import { CoffeeIcon } from '../icons/CoffeeIcon';
import PropTypes from "prop-types";

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
  getItem('Menu', 'sub1', <MenuOutlined />, [
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
        <DiscordIcon style={{ marginRight: 5 }} /> Discord
      </Typography.Link>,
      'link discord',
    ),
    getItem(
      <Typography.Link href="https://www.patreon.com/fribbels" target="_blank" rel="noopener noreferrer">
        <CoffeeIcon style={{ marginRight: 5 }} /> Donate
      </Typography.Link>,
      'link donate',
    ),
    getItem(
      <Typography.Link href="https://github.com/fribbels/hsr-optimizer" target="_blank" rel="noopener noreferrer">
        <GithubIcon style={{ marginRight: 5 }} /> Github
      </Typography.Link>,
      'link github',
    ),
  ]),
];

const MenuDrawer = (props) => {
  const { hashes } = props

  const activeKey = window.store(s => s.activeKey)
  const setActiveKey = window.store(s => s.setActiveKey)

  const onClick = (e) => {
    if (e.key && e.key.includes('link')) return

    if (hashes.includes(e.key)) {
      history.replaceState(null, null, e.key)
    } else {
      history.replaceState(null, null, ' ');
    }
    setActiveKey(e.key)
  };

  return (
    <Profiler id="MenuDrawer">
      <Menu
        onClick={onClick}
        // inlineIndent={15}
        style={{
          height: '100%',
          overflow: 'auto'

        }}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1', 'sub2', 'sub4']}
        selectedKeys={activeKey}
        mode="inline"
        items={items}
      />
    </Profiler>
  );
};
MenuDrawer.propTypes = {
  hashes: PropTypes.array,
}

export default MenuDrawer;