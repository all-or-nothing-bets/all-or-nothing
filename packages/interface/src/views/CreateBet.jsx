import React, { useState } from 'react';
import { formatBytes32String } from '@ethersproject/strings';
import { parseUnits } from '@ethersproject/units';
import { Button, DatePicker, Form, Input, Radio, Select, Space, Typography } from 'antd';
import './createBet.css';

export default function CreateBet({ tx, writeContracts }) {
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState();
  const { Title, Text } = Typography;
  const { Option } = Select;
  const { BankBucks, CTVendor } = writeContracts || '';
  const [form] = Form.useForm();

  const handleApprove = async () => {
    try {
      const data = await form.validateFields();
      console.log('data', data);
      // need to import relevant collateral contracts and use them, not BankBucks
      tx(BankBucks.approve(CTVendor.address, parseUnits(data.amount)));
      // need to wait for transaction approval
      setApproved(true);
      setError(null);
    } catch (error) {
      console.log('Error approving', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = await form.validateFields();
      if (!approved) setError('approving wager is required');
      else {
        console.log('creating condition, data:', data);
        const args = [
          '0x41A7C1c354949Eb3a97e4943BD1D5Dc4e12040a8', // oracle
          formatBytes32String(data.question), // questionId
          2, // number of outcomes
        ];
        tx(CTVendor.createCondition(...args));
      }
    } catch (error) {
      console.log('Error submitting', error);
    }
  };

  return (
    <div>
      <div style={{ border: '1px solid #cccccc', padding: 16, width: 450, margin: 'auto', marginTop: 64 }}>
        <Title>Set market question</Title>
        <Form form={form}>
          <div style={{ margin: 8 }}>
            <Form.Item name='question' extra={`For example, "Will it rain on Sunday?"`} rules={[{ required: true }]}>
              <Input size='large' placeholder='Will…?' />
            </Form.Item>
          </div>
          <div style={{ margin: 8 }}>
            <Title level={2}>Place your bet:</Title>
            <Form.Item name='answer' rules={[{ required: true }]}>
              <Radio.Group size='large'>
                <Space direction='horizontal'>
                  <Radio.Button value='yes'>
                    <strong>Yes</strong>, I think so
                  </Radio.Button>
                  <Radio.Button value='no'>
                    <strong>No</strong>, I don't think so
                  </Radio.Button>
                </Space>
              </Radio.Group>
            </Form.Item>
          </div>
          <div style={{ margin: 8 }}>
            <Form.Item label='We should know by:' name='dateTime' rules={[{ required: true }]}>
              <DatePicker showTime />
            </Form.Item>
            <Text type='secondary'>
              Please note it will take 6 days from the chosen date for the answer to be confirmed.
            </Text>
          </div>
          <div style={{ margin: 16 }}>
            <Title level={3}>How much will you wager?</Title>
            <Space style={{ margin: 8 }} direction='horizontal'>
              <Form.Item name='collateral' rules={[{ required: true }]}>
                <Select
                  showSearch
                  style={{ width: 100 }}
                  placeholder='token'
                  optionFilterProp='children'
                  filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  <Option value='DAI'>DAI</Option>
                  <Option value='USDC'>USDC</Option>
                  <Option value='USDT'>USDT</Option>
                </Select>
              </Form.Item>
              <Form.Item name='amount' rules={[{ required: true }]}>
                <Input placeholder='0' type='number' />
              </Form.Item>
            </Space>
            <Button type='default' htmlType='button' onClick={handleApprove}>
              Approve
            </Button>
          </div>
          <Form.Item>
            <Button size='large' type='primary' htmlType='button' onClick={handleSubmit}>
              Make bet
            </Button>
          </Form.Item>
          <div className='ant-form-item-explain ant-form-item-explain-error'>
            <div role='alert'>{error}</div>
          </div>
        </Form>
      </div>
    </div>
  );
}
