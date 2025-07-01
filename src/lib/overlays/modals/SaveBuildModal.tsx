import {
  Button,
  Form,
  Input,
  Modal,
} from 'antd'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { useTranslation } from 'react-i18next'

type CharacterForm = {
  name: string,
}

export function SaveBuildModal() {
  const [characterForm] = Form.useForm()

  const { isOpen, close } = useOpenClose(OpenCloseIDs.SAVE_BUILDS_MODAL)

  const { t } = useTranslation('modals', { keyPrefix: 'SaveBuild' })
  const { t: tCommon } = useTranslation('common')

  function onModalOk() {
    const formValues = characterForm.getFieldsValue() as CharacterForm
    CharacterTabController.confirmSaveBuild(formValues.name)
  }

  const handleCancel = () => {
    close()
  }

  const panelWidth = 300

  return (
    <Modal
      open={isOpen}
      width={350}
      destroyOnClose
      centered
      onOk={onModalOk}
      onCancel={handleCancel}
      footer={[
        <Button key='back' onClick={handleCancel}>
          {tCommon('Cancel') /* Cancel */}
        </Button>,
        <Button key='submit' type='primary' onClick={onModalOk}>
          {tCommon('Save') /* Save */}
        </Button>,
      ]}
    >
      <Form form={characterForm} preserve={false} layout='vertical'>
        <Form.Item
          name='name'
          label={t('Label') /* Build name */}
          rules={[{ required: true, message: t('Rule') /* Please input a name */ }]}
          style={{ width: panelWidth }}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
}
