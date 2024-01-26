import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Form } from 'antd';
import InputNumberStyled from './InputNumberStyled';
import FormStatTextStyled from './FormStatTextStyled';

const FilterRow = (props) => {
  return (
    <Flex justify='space-between'>
      <Form.Item name={`min${props.name}`}>
        <InputNumberStyled size="small" controls={false} />
      </Form.Item>
      <FormStatTextStyled>{props.label}</FormStatTextStyled>
      <Form.Item name={`max${props.name}`}>
        <InputNumberStyled size="small" controls={false} />
      </Form.Item>
    </Flex>
  )
}
FilterRow.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
}

export default FilterRow;