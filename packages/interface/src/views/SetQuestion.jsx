import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { formatBytes32String } from '@ethersproject/strings';
import { Button, Card, DatePicker, Form, Input, Space, Typography, notification } from 'antd';
import { LoadingContext } from '../contexts/loadingContext';
import { TokenList } from '../components';
import { parseLocalDateTime } from '../helpers/dateTime';
import './setQuestion.css';

export default function SetQuestion({ writeContracts }) {
  const history = useHistory();
  const { setIsLoading } = useContext(LoadingContext);
  const [phrase, setPhrase] = useState();
  const { Title, Text } = Typography;
  const { WagerFactory } = writeContracts || '';
  const [form] = Form.useForm();

  const handleChange = ({ target }) => {
    const { value } = target;
    const words = value.split(' ');
    const interrogative = words.shift();
    const subject = words.shift();
    const rest = words.toString().split(',').join(' ');
    const yes = `${interrogative} ${subject} ${rest}`;
    const no = `${interrogative} ${subject} not ${rest}`;
    if (words.length) setPhrase({ yes: yes, no: no });
    // const phrase = `${interrogative} ${subject} ${rest} OR ${interrogative} ${subject} not ${rest}?`;
    // if (words.length) setInput(phrase);
  };

  const handleCreateBet = async () => {
    setIsLoading(true);
    try {
      const data = await form.validateFields();
      const { collateral, question, dateTime } = data;
      const questionId = formatBytes32String(question);
      const timestamp = parseLocalDateTime(dateTime.toDate()); // parsed UTC i.e. in milliseconds
      console.log('timestamp', timestamp);
      await WagerFactory.create(collateral, questionId, timestamp);
      notification.info({ message: 'Setting market question', placement: 'bottomRight' });
      WagerFactory.once('error', error => {
        notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      });
      WagerFactory.once('WagerCreated', (questionId, wagerContractAddress) => {
        notification.success({ message: `Success: new question set up!`, placement: 'bottomRight' });
        console.log(`WagerCreated, questionId ${questionId} wager contrac ${wagerContractAddress}`);
        setIsLoading(false);
        history.push(`/bets/${questionId}/initial`);
      });
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
        <div style={{ margin: '8px 0' }}>
          <Form.Item name='question' rules={[{ required: true }]}>
            <Input
              style={{ fontSize: '1.2em' }}
              size='large'
              placeholder='Will…?'
              autoComplete='off'
              onChange={handleChange}
            />
          </Form.Item>
        </div>
        {phrase && (
          <Space direction='horizontal'>
            <Card size='large'>
              <Title level={5}>
                <em>{phrase.yes}</em>
              </Title>
            </Card>
            <Title level={4}>OR</Title>
            <Card size='large'>
              <Title level={5}>
                <em>{phrase.no}</em>
              </Title>
            </Card>
          </Space>
        )}
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
