import { Flex } from "antd";
import React from "react";
import PropTypes from "prop-types";

let shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'

let panelWidth = 203;
let defaultGap = 5;
let defaultPadding = 15

let smallWidth = panelWidth
let mediumWidth = 365//panelWidth * 2 + defaultPadding * 2 + 10

export default function FormCard(props) {
  const width = props.size == 'medium' ? mediumWidth : smallWidth;

  return (
    <Flex
      style={{
        borderRadius: 5,
        backgroundColor: '#243356',
        height: props.height || 350,
        padding: defaultPadding,
        boxShadow: shadow,
        overflow: props.style?.overflow,
        scrollbarWidth: 'none',
      }}
    >
      <Flex
        vertical
        style={{ width: width }}
        gap={defaultGap}
        justify={props.justify || undefined}
      >
        {props.children}
      </Flex>
    </Flex>
  )
}
FormCard.propTypes = {
  children: PropTypes.any,
  justify: PropTypes.string,
  style: PropTypes.object,
  height: PropTypes.number,
  size: PropTypes.string,
}
