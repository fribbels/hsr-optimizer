import { Flex, Form, Typography } from 'antd'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants'
import { HeaderText } from 'components/HeaderText'
import InputNumberStyled from 'components/optimizerTab/optimizerForm/InputNumberStyled'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

export const ComboFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  return (
    <Flex vertical gap={optimizerTabDefaultGap}>
      <HeaderText>{t('Header')/* Rotation COMBO formula */}</HeaderText>
      <Flex vertical gap={optimizerTabDefaultGap}>
        <ComboRow title={t('BASIC')} name='BASIC'/>
        <ComboRow title={t('SKILL')} name='SKILL'/>
        <ComboRow title={t('ULT')} name='ULT'/>
        <ComboRow title={t('FUA')} name='FUA'/>
        <ComboRow title={t('DOT')} name='DOT'/>
        <ComboRow title={t('BREAK')} name='BREAK'/>
      </Flex>
    </Flex>
  )
}

function ComboRow(props: { title: string; name: string }) {
  return (
    <Flex justify='space-between'>
      <Text>
        {props.title}
      </Text>
      <Form.Item name={['combo', props.name]}>
        <InputNumberStyled
          addonBefore='⨯'
          size='small'
          controls={true}
          style={{ width: 90 }}
          rootClassName='comboInputNumber'
        />
      </Form.Item>
    </Flex>
  )
}
