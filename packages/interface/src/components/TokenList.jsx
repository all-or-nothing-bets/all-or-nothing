import React from 'react';
import { Form, Select } from 'antd';

export default function TokenList({ size }) {
  const { Option } = Select;
  return (
    <Form.Item name='collateral' rules={[{ required: true }]}>
      <Select
        showSearch
        style={{ width: 100 }}
        size={size}
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
  );
}
