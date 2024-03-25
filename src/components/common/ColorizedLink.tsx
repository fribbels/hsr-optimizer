import { Typography } from 'antd'

export function ColorizedLink(props: { text: string; url?: string }) {
  return (
    <Typography.Link target="_blank" style={{ color: '#3f8eff' }} href={props.url}>{props.text}</Typography.Link>
  )
}
