import React, { useState } from 'react';
import { UploadOutlined, DownloadOutlined, AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Popconfirm, message, Flex, Upload, Radio, Tabs, Typography, Steps, theme } from 'antd';
import { OcrParser } from '../lib/ocrParser';
import { Message } from '../lib/message';

import sampleSave from '../data/sample-save.json';

const { Text } = Typography;

const spinnerMs = 500

export default function GuideTab({style}) {

  function tryItOutClicked() {
    DB.setState(JSON.parse(JSON.stringify(sampleSave)))
    SaveState.save()
  }
  return (
    <div style={style}>
      <Flex vertical gap={5} style={{margin: 20}}>
        <Text>
          If you would like to give the optimizer a try before doing any relic importing, use this to load a sample save file and check out the features.
        </Text>
        
        <Popconfirm
          title="Load sample save"
          description="Replace your current data with a sample save file?"
          onConfirm={tryItOutClicked}
          placement="bottom"
          okText="Yes"
          cancelText="Cancel"
        >
          <Button type="primary" style={{width: 200}}>
            Try it out!
          </Button>
        </Popconfirm>
      </Flex>
    </div>
  );
}
