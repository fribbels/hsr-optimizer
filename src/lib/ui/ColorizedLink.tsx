import { ExportOutlined, LinkOutlined } from '@ant-design/icons'
import React from 'react'

export function ColorizedLinkWithIcon(props: {
  text?: string
  url?: string
  externalIcon?: boolean
  noUnderline?: boolean
  linkIcon?: boolean
  onClick?: () => void
}) {
  return (
    <a href={props.url} target='_blank' onClick={props.onClick} rel='noreferrer'>
      <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', textDecoration: props.noUnderline ? '' : 'underline', color: '#91bfff' }}>
        {props.text}
        {props.linkIcon && <LinkOutlined/>}
        {props.externalIcon && <ExportOutlined/>}
      </span>
    </a>
  )
}
