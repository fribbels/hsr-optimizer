import { TsUtils } from 'lib/utils/TsUtils'
import React from 'react'

export const Message = {
  success: (content: NonNullable<React.ReactNode>, duration: number = 3) => {
    const key = TsUtils.uuid()
    console.log('Success message:', content)
    void window.messageApi.open({
      key: key,
      type: 'success',
      content: content || '',
      duration: duration,
      onClick: () => window.messageApi.destroy(key),
    })
  },

  error: (content: NonNullable<React.ReactNode>, duration: number = 3) => {
    const key = TsUtils.uuid()
    console.warn('Error message:', content)
    void window.messageApi.open({
      key: key,
      type: 'error',
      content: content || '',
      duration: duration,
      onClick: () => window.messageApi.destroy(key),
    })
  },

  warning: (content: NonNullable<React.ReactNode>, duration: number = 3) => {
    const key = TsUtils.uuid()
    console.warn('Warning message:', content)
    void window.messageApi.open({
      key: key,
      type: 'warning',
      content: content || '',
      duration: duration,
      onClick: () => window.messageApi.destroy(key),
    })
  },
}
