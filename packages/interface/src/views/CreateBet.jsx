import React, { useState } from 'react';
import { formatBytes32String } from '@ethersproject/strings';
import { Button, DatePicker, Form, Input, Radio, Select, Space, Typography } from 'antd';
import './createBet.css';

export default function CreateBet({ tx, writeContracts }) {
  const [data, setData] = useState();
  const { Title, Text } = Typography;
  const { Option } = Select;

  const onFinish = formData => {
    const args = [
      '0x41A7C1c354949Eb3a97e4943BD1D5Dc4e12040a8', // oracle
      formatBytes32String(formData.question), // questionId
      2, // number of outcomes
    ];
    tx(writeContracts.CTVendor.createCondition(...args));
    setData(formData);
  };

  return (
    <div>
      <div style={{ border: '1px solid #cccccc', padding: 16, width: 400, margin: 'auto', marginTop: 64 }}>
        <Title>Set market question</Title>
        <Form onFinish={onFinish}>
          <div style={{ margin: 8 }}>
            <Form.Item name='question' extra={`For example, "Will it rain on Sunday?"`}>
              <Input size='large' placeholder='Will…?' />
            </Form.Item>
          </div>
          <div style={{ margin: 8 }}>
            <Title level={2}>Place your bet:</Title>
            <Form.Item name='answer'>
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
            <Form.Item label='We should know by:' name='dateTime'>
              <DatePicker showTime />
            </Form.Item>
            <Text type='secondary'>
              Please note it will take 6 days from the chosen date for the answer to be confirmed.
            </Text>
          </div>
          <div style={{ margin: 16 }}>
            <Title level={3}>How much will you wager?</Title>
            <Space style={{ margin: 8 }} direction='horizontal'>
              <Form.Item name='collateral'>
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
              <Form.Item name='amount'>
                <Input placeholder='0' type='number' />
              </Form.Item>
            </Space>
          </div>
          <Form.Item>
            <Button size='large' type='primary' htmlType='submit'>
              Make bet
            </Button>
          </Form.Item>
        </Form>
      </div>
      <pre>data: {JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
