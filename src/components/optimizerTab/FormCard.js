import {Flex} from "antd";
import React from "react";

let shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'

let panelWidth = 200;
let defaultGap = 5;
let defaultPadding = 15

let smallWidth = panelWidth
let mediumWidth = panelWidth * 2 + defaultPadding * 2 + 10

export default function FormCard(props) {
  return (
    <div style={{borderRadius: 5, backgroundColor: '#243356', padding: defaultPadding, boxShadow: shadow}}>
      <Flex
        vertical
        style={{ width: props.medium ? mediumWidth : smallWidth }}
        gap={defaultGap}
      >
        {props.children}
      </Flex>
    </div>
  )
}