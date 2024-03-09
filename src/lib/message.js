import { Utils } from 'lib/utils'

export const Message = {
  success: (content, duration) => {
    const key = Utils.randomId()
    console.log('Success message:', content)
    window.messageApi.open({
      key: key,
      type: 'success',
      content: content || '',
      duration: duration || 3,
      onClick: () => window.messageApi.destroy(key),
    })
  },

  error: (content, duration) => {
    const key = Utils.randomId()
    console.warn('Error message:', content)
    window.messageApi.open({
      key: key,
      type: 'error',
      content: content || '',
      duration: duration || 3,
      onClick: () => window.messageApi.destroy(key),
    })
  },

  warning: (content, duration) => {
    const key = Utils.randomId()
    console.warn('Warning message:', content)
    window.messageApi.open({
      key: key,
      type: 'warning',
      content: content || '',
      duration: duration || 3,
      onClick: () => window.messageApi.destroy(key),
    })
  },
}
