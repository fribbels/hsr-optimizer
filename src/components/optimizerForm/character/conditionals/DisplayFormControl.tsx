import React from 'react';
import PropTypes from 'prop-types';
import { Flex } from 'antd';
import ColorizeNumbers from 'components/common/ColorizeNumbers';

const DisplayFormControl = ({ content }): JSX.Element => {
  const ret = [];

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
        />
    );    
  });

  return (<Flex vertical gap={10}>{ret}</Flex>);
};
DisplayFormControl.displayName = 'DisplayFormControl';
DisplayFormControl.propTypes = {
  content: PropTypes.array,
  eidolon: PropTypes.number,
  ultBoostMax: PropTypes.number,
};

export default DisplayFormControl;