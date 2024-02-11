import { Flex, Typography } from "antd";
import React from "react";
import PropTypes from "prop-types";

const { Text } = Typography;

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
FormRow.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
}
