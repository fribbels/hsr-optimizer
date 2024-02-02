import React from 'react';
import PropTypes from 'prop-types';
import { Flex } from 'antd';
import ColorizeNumbers from 'components/common/ColorizeNumbers';

const DisplayFormControl = ({ content }): JSX.Element => {
  const ret = [];
  let i = 0;

  // for (const key in content) {
  content.forEach(passive => {
    const Item = passive.formItem;
    ret.push(
      <Item
        {...passive}
        name={passive.id}
        title={passive.title}
        content={ColorizeNumbers(passive.content)}
        text={passive.text}
        key={i}
        />
    );
    i++;
  });

  return (<Flex vertical gap={10}>{ret}</Flex>);
};
DisplayFormControl.propTypes = {
  content: PropTypes.array,
  eidolon: PropTypes.number,
  ultBoostMax: PropTypes.number,
};

export default DisplayFormControl;