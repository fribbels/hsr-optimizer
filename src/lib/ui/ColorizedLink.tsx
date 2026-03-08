import {
  IconExternalLink,
  IconInfoCircle,
  IconLink,
} from '@tabler/icons-react'
import { Flex } from 'antd'

export function ColorizedLinkWithIcon(props: {
  text?: string,
  url?: string,
  externalIcon?: boolean,
  noUnderline?: boolean,
  linkIcon?: boolean,
  onClick?: () => void,
}) {
  return (
    <a href={props.url} target='_blank' onClick={props.onClick} rel='noreferrer'>
      <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', textDecoration: props.noUnderline ? '' : 'underline', color: '#91bfff' }}>
        {props.text}
        {props.linkIcon && <IconLink />}
        {props.externalIcon && <IconExternalLink />}
      </span>
    </a>
  )
}

export function ColorizedTitleWithInfo(props: {
  text?: string,
  url?: string,
  externalIcon?: boolean,
  noUnderline?: boolean,
  linkIcon?: boolean,
  onClick?: () => void,
}) {
  return (
    <a href={props.url} target='_blank' onClick={props.onClick} rel='noreferrer'>
      <Flex style={{ textDecoration: props.noUnderline ? '' : 'underline', color: '#91bfff', margin: 15 }} align='center' gap={10}>
        <pre style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          {props.text}
        </pre>
        <IconInfoCircle style={{ fontSize: 22 }} />
      </Flex>
    </a>
  )
}
