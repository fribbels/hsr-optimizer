import React from 'react';
import PropTypes from 'prop-types';
import { Flex } from 'antd';
import ColorizeNumbers from 'components/optimizerForm/character/utils/ColorizeNumbers';

const Display = (props): JSX.Element => {
  const { content } = props;
  const ret = [];

  for (const key in content) {
    const Item = content[key].formItem;
    ret.push(
      <Item
        name={key}
        title={content[key].title}
        content={ColorizeNumbers(content[key].content)}
        text={content[key].text}
        {...content[key]}
        />
    );
  }
  return (<Flex vertical gap={10}>{ret}</Flex>);
};
Display.displayName = 'XueyiDisplay';
Display.propTypes = {
  content: PropTypes.object,
  eidolon: PropTypes.number,
  ultBoostMax: PropTypes.number,
};

export default Display;