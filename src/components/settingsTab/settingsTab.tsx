import React from 'react'
import { theme, Typography } from 'antd'

const { useToken } = theme
const { Text } = Typography

export default function SettingsTab(): React.JSX.Element {
  const { token } = useToken()

  return (
    <div></div>
  )
}
