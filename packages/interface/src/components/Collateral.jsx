import React from 'react';
import { Form, Input, Select, Space } from 'antd';

export default function Collateral() {
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
          <Option value='BNK'>BankBucks</Option>
          <Option value='DAI'>DAI</Option>
          <Option value='USDC'>USDC</Option>
          <Option value='USDT'>USDT</Option>
        </Select>
      </Form.Item>
      <Form.Item name='amount' rules={[{ required: true }]}>
        <Input placeholder='0' type='number' />
      </Form.Item>
    </Space>
  );
}
