import React from 'react';
import { Form, Select } from 'antd';
import BANKBUCKS_ADDRESS from '../contracts/BankBucks.address';
import { DAI_ADDRESS } from '../constants.js';

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
        <Option value={BANKBUCKS_ADDRESS}>BNK</Option>
        <Option value={DAI_ADDRESS}>DAI</Option>
      </Select>
    </Form.Item>
  );
}
