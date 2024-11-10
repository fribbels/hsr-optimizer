import { Flex, Form } from 'antd'
import FormStatTextStyled from 'lib/tabs/tabOptimizer/optimizerForm/components/FormStatTextStyled'
import InputNumberStyled from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'

const FilterRow = (props: { name: string; label: string }) => {
  return (
    <Flex justify='space-between' style={{ margin: 0 }}>
      <Form.Item name={`min${props.name}`} style={{ margin: 0 }}>
        <InputNumberStyled size='small' controls={false} style={{ margin: 0, width: 63 }}/>
      </Form.Item>
      <FormStatTextStyled>{props.label}</FormStatTextStyled>
      <Form.Item name={`max${props.name}`} style={{ marginRight: 0 }}>
        <InputNumberStyled size='small' controls={false} style={{ margin: 0, width: 63 }}/>
      </Form.Item>
    </Flex>
  )
}

export default FilterRow
