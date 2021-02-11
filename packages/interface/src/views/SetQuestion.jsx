import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { formatBytes32String } from '@ethersproject/strings';
import { Button, DatePicker, Form, Input, Space, Typography, notification } from 'antd';
import Notify from 'bnc-notify';
import { LoadingContext } from '../contexts/loadingContext';
// import { useEventListener } from '../hooks';
import { TokenList } from '../components';
import { parseLocalDateTime } from '../helpers/dateTime';
import './setQuestion.css';

export default function SetQuestion({ localProvider, tx, readContracts, writeContracts }) {
  const history = useHistory();
  const { setIsLoading } = useContext(LoadingContext);
  const { Title, Text } = Typography;
  const { BankBucks, WagerFactory } = writeContracts || '';
  const [form] = Form.useForm();
  // const wagerFactoryEvents = useEventListener(readContracts, 'WagerFactory', 'WagerCreated', localProvider, 1);
  // console.log('wagerFactoryEvents:', wagerFactoryEvents);

  const handleCreateBet = async () => {
    setIsLoading(true);
    try {
      const data = await form.validateFields();
      const { collateral, question, dateTime } = data;
      const questionId = formatBytes32String(question);
      const timestamp = parseLocalDateTime(dateTime.toDate()); // parsed UTC i.e. in milliseconds
      await WagerFactory.create(BankBucks.address, questionId, timestamp);
      notification.info({ message: 'Setting market question', placement: 'bottomRight' });
      WagerFactory.once('error', error => {
        notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      });
      WagerFactory.once('WagerCreated', (questionId, wagerContractAddress) => {
        notification.success({ message: `Success: new question set up!`, placement: 'bottomRight' });
        console.log(`WagerCreated, questionId ${questionId} wager contrac ${wagerContractAddress}`);
        setIsLoading(false);
        history.push(`/bets/${questionId}`);
      });
      // tx(WagerFactory.create(BankBucks.address, questionId, timestamp));
    } catch (error) {
      notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      setIsLoading(false);
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
