import {Flex} from "antd";
import React from "react";

let shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'

let panelWidth = 200;
let defaultGap = 5;

export default function FilterContainer(props) {
  return (
    <Flex
      vertical
      gap={20}
      style={{
        // outline: '2px solid #243356',
        overflow: 'hidden',
        borderRadius: '10px',
        boxShadow: shadow,
        width: 'fit-content'
      }}
    >
      {props.children}
    </Flex>
  )
}