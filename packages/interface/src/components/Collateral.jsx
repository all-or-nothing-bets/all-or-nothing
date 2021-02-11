import React from 'react';
import { Button, Form, Input, Select, Space } from 'antd';
import TokenList from './TokenList';

export default function Collateral({ handleApprove }) {
  return (
    <Space style={{ margin: 8 }} direction='horizontal'>
      <TokenList />
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
