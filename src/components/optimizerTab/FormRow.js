import {Flex, Typography} from "antd";
import React from "react";

const { Text } = Typography;

let shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'
export default function FormRow(props) {
  return (
    <Flex gap={0} vertical style={{
      paddingTop: 5
    }}>
      <Flex // Top bar
        style={{
          height: 20,
          paddingLeft: 15,
        }}
        // justify='space-around'
        align='center'
      >
        <Text
          style={{
            fontSize: 20,
          }}
        >
          {props.title}
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