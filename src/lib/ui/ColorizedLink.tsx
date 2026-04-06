import {
  IconExternalLink,
  IconInfoCircle,
  IconLink,
} from '@tabler/icons-react'
import { Flex } from '@mantine/core'

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
      <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', textDecoration: props.noUnderline ? '' : 'underline', color: 'var(--color-link)' }}>
        {props.text}
        {props.linkIcon && <IconLink size={14} />}
        {props.externalIcon && <IconExternalLink size={14} />}
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
  fontSize?: number,
}) {
  return (
    <a href={props.url} target='_blank' onClick={props.onClick} rel='noreferrer'>
      <Flex style={{ textDecoration: props.noUnderline ? '' : 'underline', color: 'var(--color-link)', margin: 15, fontSize: props.fontSize ?? 28, fontWeight: 600 }} align='center' gap={10}>
        <span>{props.text}</span>
        <IconInfoCircle size='1em' style={{ flexShrink: 0 }} />
      </Flex>
    </a>
  )
}
