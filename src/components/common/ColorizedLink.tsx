import { Typography } from 'antd'

export function ColorizedLink(props: { text: string; url?: string }) {
  return (
    <Typography.Link target='_blank' style={{ color: '#91bfff' }} href={props.url}>{props.text}</Typography.Link>
  )
}
