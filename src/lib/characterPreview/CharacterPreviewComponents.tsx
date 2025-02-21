import { Flex, Typography } from 'antd'
import React, { CSSProperties } from 'react'

const { Text } = Typography

export enum ShowcaseSource {
  CHARACTER_TAB,
  SHOWCASE_TAB,
  BUILDS_MODAL,
}

function isMobileOrSafari() {
  const userAgent = navigator.userAgent

  // Detect mobile devices
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|BlackBerry/i.test(userAgent)

  // Detect Safari (excluding Chrome on iOS)
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent)

  return isMobile || isSafari
}

// Mobile/Safari shadows don't render correctly on the Y axis
export const showcaseShadow = isMobileOrSafari() ? 'rgb(0, 0, 0) 1px 0px 6px' : 'rgb(0, 0, 0) 1px 1px 7px'
export const showcaseShadowInsetAddition = ', inset rgb(255 255 255 / 25%) 0px 0px 2px'
export const showcaseOutlineLight = 'rgba(255, 255, 255, 0.20) solid 1px'
export const showcaseOutline = 'rgba(255, 255, 255, 0.40) solid 1px'
export const showcaseBackdropFilter = 'blur(3px)'
export const showcaseButtonStyle: CSSProperties = {
  flex: 'auto',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  visibility: 'hidden',
}

export function OverlayText(props: {
  text: string
  top: number
}) {
  const top = props.top
  return (
    <Flex
      vertical
      style={{
        position: 'relative',
        height: 0,
        top: top,
      }}
      align='center'
    >
      <Text
        style={{
          position: 'absolute',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: '2px 14px',
          borderRadius: 4,
          fontSize: 12,
          whiteSpace: 'nowrap',
          textShadow: '0px 0px 10px black',
          outline: showcaseOutline,
          lineHeight: '12px',
        }}
      >
        {props.text}
      </Text>
    </Flex>
  )
}
