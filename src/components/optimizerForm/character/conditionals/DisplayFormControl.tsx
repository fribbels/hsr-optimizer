import React from 'react';
import PropTypes from 'prop-types';
import { Flex } from 'antd';
import ColorizeNumbers from 'components/common/ColorizeNumbers';

const DisplayFormControl = (props): JSX.Element => {
  const { content } = props;
  const ret = [];

  for (const key in content) {
    const Item = content[key].formItem;
    ret.push(
      <Item
        {...content[key]}
        name={key}
        title={content[key].title}
        content={ColorizeNumbers(content[key].content)}
        text={content[key].text}
        />
    );
  }
  return (<Flex vertical gap={10}>{ret}</Flex>);
};
DisplayFormControl.displayName = 'XueyiDisplayFormControl';
DisplayFormControl.propTypes = {
  content: PropTypes.object,
  eidolon: PropTypes.number,
  ultBoostMax: PropTypes.number,
};

export default DisplayFormControl;