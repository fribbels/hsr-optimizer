import * as React from "react";
import { Button, Flex, Form, FormInstance, Modal, Input } from "antd";
import { HeaderText } from "./HeaderText";

interface NameBuildProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOk: (x: FormInstance) => void;
}

const NameBuild: React.FC<NameBuildProps> = ({ open, setOpen, onOk }) => {
  const [characterForm] = Form.useForm();
  window["characterForm"] = characterForm;

  function onModalOk() {
    const formValues = characterForm.getFieldsValue();
    onOk(formValues.name);
  }

  const handleCancel = () => {
    setOpen(false);
  };

  const panelWidth = 203;

  return (
    <Modal
      open={open}
      width={250}
      destroyOnClose
      centered
      onOk={onModalOk}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onModalOk}>
          Save
        </Button>,
      ]}
    >
      <Flex justify="space-between" align="center">
        <HeaderText>Name your build</HeaderText>
      </Flex>
      <Form form={characterForm} preserve={false} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please input a name" }]}
          style={{ width: panelWidth }}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NameBuild;
