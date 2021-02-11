import React from 'react';
import { useHistory } from 'react-router-dom';
import { formatBytes32String } from '@ethersproject/strings';
import { Button, DatePicker, Form, Input, Space, Typography } from 'antd';
import { TokenList } from '../components';
import { parseLocalDateTime } from '../helpers/dateTime';
import './setQuestion.css';

export default function SetQuestion({ tx, writeContracts }) {
  const history = useHistory();
  const { Title, Text } = Typography;
  const { BankBucks, WagerFactory } = writeContracts || '';
  const [form] = Form.useForm();

  const handleCreateBet = async () => {
    try {
      const data = await form.validateFields();
      const { collateral, question, dateTime } = data;
      const questionId = formatBytes32String(question);
      const timestamp = parseLocalDateTime(dateTime.toDate()); // parsed UTC i.e. in milliseconds
      tx(WagerFactory.create(BankBucks.address, questionId, timestamp));
      history.push(`/bets/${questionId}`);
    } catch (error) {
      console.log('Error creating bet', error);
    }
  };

  const resetFields = () => form.resetFields();

  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 550, margin: 'auto', marginTop: 64 }}>
      <Title>Set market question</Title>
      <Form form={form}>
        <div style={{ margin: 8 }}>
          <Form.Item name='question' rules={[{ required: true }]}>
            <Input style={{ fontSize: '1.2em' }} size='large' placeholder='Will…?' autoComplete='off' />
          </Form.Item>
        </div>
        <div style={{ margin: 8 }}>
          <Form.Item size='large' label='We should know by:' name='dateTime' rules={[{ required: true }]}>
            <DatePicker showTime placeholder='Select date & time' />
          </Form.Item>
          <Text type='secondary' style={{ fontSize: '0.8em', fontStyle: 'italic' }}>
            Please note it will take 6 days from the chosen date for the winners to be confirmed.
          </Text>
        </div>
        <div style={{ margin: 16 }}>
          <Title level={4}>What ERC20 do you want to make a bet in?</Title>
          <TokenList size='large' />
        </div>
        <Space direction='horizontal'>
          <Form.Item>
            <Button size='large' type='default' htmlType='button' onClick={resetFields}>
              Reset
            </Button>
          </Form.Item>
          <Form.Item>
            <Button size='large' type='primary' htmlType='button' onClick={handleCreateBet}>
              Create bet contract
            </Button>
          </Form.Item>
        </Space>
      </Form>
    </div>
  );
}
