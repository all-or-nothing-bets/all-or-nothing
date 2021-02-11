import React from 'react';
import { Button, Form, Input, Select, Space } from 'antd';
import BANKBUCKS_ADDRESS from '../contracts/BankBucks.address';
import { DAI_ADDRESS } from '../constants.js';
import './collateralSelected.css';

export default function CollateralSelected({ handleApprove, collateral }) {
  const { Option } = Select;
  let symbol;
  switch (collateral) {
    case BANKBUCKS_ADDRESS:
      symbol = 'BNK';
      break;
    case DAI_ADDRESS:
      symbol = 'DAI';
      break;
    default:
      symbol = '';
  }
  return (
    <Space style={{ margin: 8 }} direction='horizontal'>
      <div className='collateral'>{symbol}</div>
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
