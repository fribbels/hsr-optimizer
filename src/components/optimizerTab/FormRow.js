import {Flex, Typography} from "antd";
import React from "react";

const { Text } = Typography;

let shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'
export default function FormRow(props) {
  return (
    <Flex gap={0} vertical style={{
    }}>
      <Flex // Top bar
        style={{
          height: 40,
          backgroundColor: '#243356',
          paddingLeft: 20,
        }}
        // justify='space-around'
        align='center'
      >
        <Text
          style={{
            fontSize: 20,
          }}
        >
          Character stats
        </Text>
      </Flex>

      <Flex
        style={{
          paddingTop: 10,
          paddingLeft: 10,
          paddingRight: 10,
          paddingBottom: 10,
        }}
        gap={10}
      >
        {props.children}
      </Flex>
    </Flex>
  )
}