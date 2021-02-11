import React from 'react';
import { Button, Form, Input, Select, Space } from 'antd';
import BANKBUCKS_ADDRESS from '../contracts/BankBucks.address';
import { DAI_ADDRESS } from '../constants.js';

export default function Collateral({ handleApprove }) {
  const { Option } = Select;
  return (
    <Space style={{ margin: 8 }} direction='horizontal'>
      <Form.Item name='collateral' rules={[{ required: true }]}>
        <Select
          showSearch
          style={{ width: 100 }}
          placeholder='token'
          optionFilterProp='children'
          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          <Option value={BANKBUCKS_ADDRESS}>BNK</Option>
          <Option value={DAI_ADDRESS}>DAI</Option>
        </Select>
      </Form.Item>
      <Form.Item name='amount' rules={[{ required: true }]}>
        <Input placeholder='0' type='number' />
      </Form.Item>
      <Form.Item>
        <Button type='default' htmlType='button' onClick={handleApprove}>
          Approve
        </Button>
      </Form.Item>
    </Space>
  );
}
