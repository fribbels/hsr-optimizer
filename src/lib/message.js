export const Message = {
  success: (content, duration) => {
    console.log('Success message:', content)
    global.messageApi.open({
      type: 'success',
      content: content || '',
      duration: duration || 3,
    });
  },

  error: (content, duration) => {
    console.warn('Error message:', content)
    global.messageApi.open({
      type: 'error',
      content: content || '',
      duration: duration || 3,
    });
  },
  
  warning: (content, duration) => {
    console.warn('Warning message:', content)
    global.messageApi.open({
      type: 'warning',
      content: content || '',
      duration: duration || 3,
    });
  },
}