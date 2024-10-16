import { Flex } from 'antd'
import { ExportOutlined, LinkOutlined } from '@ant-design/icons'
import React from 'react'

export function ColorizedLinkWithIcon(props: {
  text: string;
  url?: string;
  externalIcon?: boolean;
  linkIcon?: boolean;
  onClick?: () => void
}) {
  return (
    <a href={props.url} target='_blank' style={{ display: 'inline-block' }} onClick={props.onClick}>
      <Flex gap={4} style={{ color: '#91bfff', textDecoration: 'underline' }}>
        {props.text}
        {props.linkIcon && <LinkOutlined/>}
        {props.externalIcon && <ExportOutlined/>}
      </Flex>
    </a>
  )
}