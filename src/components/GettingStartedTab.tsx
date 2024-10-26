import { Button, Flex, Popconfirm, Typography } from 'antd'
import { Message } from 'lib/message'

import sampleSave from '../data/sample-save.json'
import DB from 'lib/db'
import { ColorizedLinkWithIcon } from 'components/common/ColorizedLink'
import { useTranslation } from 'react-i18next'
import { SaveState } from 'lib/saveState'
import { ImportOutlined } from '@ant-design/icons'
import { HsrOptimizerSaveFormat } from 'types/store'

const { Text } = Typography

export default function GettingStartedTab() {
  const { t } = useTranslation('getStartedTab')
  console.log('======================================================================= RENDER GettingStartedTab')

  function tryItOutClicked() {
    DB.setStore(JSON.parse(JSON.stringify(sampleSave)) as HsrOptimizerSaveFormat, false)
    SaveState.save()

    Message.success(t('TryOut.SuccessMessage'))// 'Successfully loaded data'
  }

  return (
    <div>
      <Text>
        <Flex vertical gap={5} style={{ marginLeft: 20, marginBottom: 50, width: 1000 }}>
          <Popconfirm
            title={t('TryOut.title')}// Try it out!
            description={t('TryOut.description')}// 'Load a sample save file?'
            onConfirm={tryItOutClicked}
            placement='bottom'
            okText={t('TryOut.okText')}// 'Yes'
            cancelText={t('TryOut.cancelText')}// 'Cancel'
          >
            <Button type='primary' icon={<ImportOutlined/>} style={{ width: 200 }}>
              {t('TryOut.ButtonText')/* Try it out! */}
            </Button>
          </Popconfirm>

          <ColorizedLinkWithIcon
            // @ts-ignore
            text={t('TryOut.DocumentationTitle')/* See full guide */}
            linkIcon={true}
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/getting-started.md'
          />
        </Flex>
      </Text>
    </div>
  )
}
