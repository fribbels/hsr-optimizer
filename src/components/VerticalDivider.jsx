import { Divider, Flex } from 'antd';

export default function VerticalDivider() {
  return (
    <Flex vertical>
      <Divider type="vertical" style={{flexGrow: 1, margin: '10px 10px'}}/>
    </Flex>
  );
}

