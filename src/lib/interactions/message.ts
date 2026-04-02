import { notifications } from '@mantine/notifications'
import type React from 'react'

export const Message = {
  success: (content: React.ReactNode, duration: number = 3): void => {
    notifications.show({
      message: content,
      color: 'green',
      autoClose: duration * 1000,
    })
  },

  error: (content: React.ReactNode, duration: number = 3): void => {
    console.warn('Error message:', content)
    notifications.show({
      message: content,
      color: 'red',
      autoClose: duration * 1000,
    })
  },

  warning: (content: React.ReactNode, duration: number = 3): void => {
    console.warn('Warning message:', content)
    notifications.show({
      message: content,
      color: 'yellow',
      autoClose: duration * 1000,
    })
  },
}
