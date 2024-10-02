import { Button, Flex, Form, Radio, Typography } from 'antd'
import { optimizerTabDefaultGap } from 'components/optimizerTab/optimizerTabConstants'
import { HeaderText } from 'components/HeaderText'
import InputNumberStyled from 'components/optimizerTab/optimizerForm/InputNumberStyled'
import { useTranslation } from 'react-i18next'
import { SettingOutlined } from '@ant-design/icons'
import { ComboDrawer } from 'components/optimizerTab/rotation/ComboDrawer'

const { Text } = Typography

export const ComboFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const setComboDrawerOpen = window.store((s) => s.setComboDrawerOpen)

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


      <Flex vertical>
        {/* <Segmented */}
        {/*  vertical */}
        {/*  style={{ width: 40 }} */}
        {/*  options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} */}
        {/* /> */}

        <Flex gap={0}>
          <div style={{ width: 30 }}>
            #1
          </div>
          <Radio.Group
            defaultValue='a'
            size='small'
          >
            <Radio.Button value='a'>Basic</Radio.Button>
            <Radio.Button value='b'>Skill</Radio.Button>
            <Radio.Button value='c'>Ult</Radio.Button>
            <Radio.Button value='d'>Fua</Radio.Button>
          </Radio.Group>
        </Flex>
        <Flex gap={0}>
          <div style={{ width: 30 }}>
            #2
          </div>
          <Radio.Group
            defaultValue='a'
            size='small'
          >
            <Radio.Button value='a'>Basic</Radio.Button>
            <Radio.Button value='b'>Skill</Radio.Button>
            <Radio.Button value='c'>Ult</Radio.Button>
            <Radio.Button value='d'>Fua</Radio.Button>
          </Radio.Group>
        </Flex>
        <Flex gap={0}>
          <div style={{ width: 30 }}>
            #3
          </div>
          <Radio.Group
            defaultValue='a'
            size='small'
          >
            <Radio.Button value='a'>Basic</Radio.Button>
            <Radio.Button value='b'>Skill</Radio.Button>
            <Radio.Button value='c'>Ult</Radio.Button>
            <Radio.Button value='d'>Fua</Radio.Button>
          </Radio.Group>
        </Flex>
        <Flex gap={0}>
          <div style={{ width: 30 }}>
            #4
          </div>
          <Radio.Group
            defaultValue='a'
            size='small'
          >
            <Radio.Button value='a'>Basic</Radio.Button>
            <Radio.Button value='b'>Skill</Radio.Button>
            <Radio.Button value='c'>Ult</Radio.Button>
            <Radio.Button value='d'>Fua</Radio.Button>
          </Radio.Group>
        </Flex>
        <Button size='small' variant='outlined' style={{ marginLeft: 30, width: 156 }}>
          +
        </Button>
        <Button
          style={{ width: 200, marginTop: 20 }}
          onClick={() => setComboDrawerOpen(true)}
          icon={<SettingOutlined/>}
        >
          Custom COMBO rotation
        </Button>
        <ComboDrawer/>
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
