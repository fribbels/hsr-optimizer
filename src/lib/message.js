export const Message = {
  success: (content, duration) => {
    console.log('Success message:', content)
    window.messageApi.open({
      type: 'success',
      content: content || '',
      duration: duration || 3,
    });
  },

  error: (content, duration) => {
    console.warn('Error message:', content)
    window.messageApi.open({
      type: 'error',
      content: content || '',
      duration: duration || 3,
    });
  },
  
  warning: (content, duration) => {
    console.warn('Warning message:', content)
    window.messageApi.open({
      type: 'warning',
      content: content || '',
      duration: duration || 3,
    });
  },
}