import { ImportOutlined } from '@ant-design/icons'
import { Button, Flex, Popconfirm, Typography } from 'antd'

import sampleSave from 'data/sample-save.json'
import { Message } from 'lib/interactions/message'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { useTranslation } from 'react-i18next'
import { HsrOptimizerSaveFormat } from 'types/store'

const { Text } = Typography

export default function GettingStartedTab() {
  const { t } = useTranslation(['getStartedTab', 'common'])
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
            title={t('common:Confirm')}// Confirm!
            description={t('TryOut.description')}// 'Load a sample save file?'
            onConfirm={tryItOutClicked}
            placement='bottom'
            okText={t('common:Yes')}// 'Yes'
            cancelText={t('common:Cancel')}// 'Cancel'
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
