import { Card, Col, Divider, Flex, Image, Row, Space, Typography } from 'antd';
import * as React from 'react';

export default function VerticalDivider() {
  return (
    <Flex vertical>
      <Divider type="vertical" style={{flexGrow: 1, margin: '10px 10px'}}/>
    </Flex>
  );
}

