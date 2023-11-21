import React from 'react';
import { SmileOutlined, CheckCircleTwoTone, CheckCircleFilled, CheckCircleOutlined } from '@ant-design/icons';
import { Button, notification } from 'antd';

export const Message = {
  success: (content, duration) => {
    console.log('Success message:', content)
    messageApi.open({
      type: 'success',
      content: content || '',
      duration: duration || 3,
    });
  },

  error: (content, duration) => {
    console.warn('Error message:', content)
    messageApi.open({
      type: 'error',
      content: content || '',
      duration: duration || 3,
    });
  },
  
  warning: (content, duration) => {
    console.warn('Warning message:', content)
    messageApi.open({
      type: 'warning',
      content: content || '',
      duration: duration || 3,
    });
  },
}