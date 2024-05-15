import PropTypes from 'prop-types'
import { Flex, Form } from 'antd'
import InputNumberStyled from 'components/optimizerTab/optimizerForm/InputNumberStyled.tsx'
import FormStatTextStyled from 'components/optimizerTab/optimizerForm/FormStatTextStyled.tsx'

const FilterRow = (props) => {
  return (
    <Flex justify="space-between" style={{margin: 0}}>
      <Form.Item name={`min${props.name}`} style={{margin: 0}}>
        <InputNumberStyled size="small" controls={false} style={{margin: 0}}/>
      </Form.Item>
      <FormStatTextStyled>{props.label}</FormStatTextStyled>
      <Form.Item name={`max${props.name}`} style={{marginRight: 0}}>
        <InputNumberStyled size="small" controls={false} style={{margin: 0}}/>
      </Form.Item>
    </Flex>
  )
}
FilterRow.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
}

export default FilterRow
