import React from 'react';
import { useParams } from 'react-router-dom';
import { formatBytes32String, parseBytes32String } from '@ethersproject/strings';
import { formatUnits } from '@ethersproject/units';
import { isHexString } from '@ethersproject/bytes';
import { Button, Card, Form, Radio, Space, Typography } from 'antd';
import { Collateral } from '../components';
import { useConditionId, useCollectionId, usePositionId, useCTBalance } from '../hooks';

export default function BetOld({ address, readContracts }) {
  const { Title, Text } = Typography;
  const { questionId } = useParams();
  const question = isHexString(questionId) ? parseBytes32String(questionId) : 'Not Found';
  const [form] = Form.useForm();

  const { BankBucks, ConditionalTokens, CTVendor } = readContracts || '';
  const oracle = '0x41A7C1c354949Eb3a97e4943BD1D5Dc4e12040a8'; // oracle
  const outcomes = 2;
  const conditionId = useConditionId(ConditionalTokens, oracle, questionId, outcomes);

  const collectionId1 = useCollectionId(ConditionalTokens, formatBytes32String(0), conditionId, 1);
  const collectionId2 = useCollectionId(ConditionalTokens, formatBytes32String(0), conditionId, 2);

  const positionId1 = usePositionId(ConditionalTokens, BankBucks, collectionId1);
  const positionId2 = usePositionId(ConditionalTokens, BankBucks, collectionId2);

  const myBalance1 = useCTBalance(ConditionalTokens, address, positionId1);
  const myBalance2 = useCTBalance(ConditionalTokens, address, positionId2);

  const ctVendorBalance1 = useCTBalance(ConditionalTokens, CTVendor?.address, positionId1);
  const ctVendorBalance2 = useCTBalance(ConditionalTokens, CTVendor?.address, positionId2);

  const handleApprove = async () => console.log('approve');
  const handleIncreasebet = async () => console.log('increase bet');
  const resetFields = () => form.resetFields();

  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 450, margin: 'auto', marginTop: 32 }}>
      <Title>{question}</Title>
      <Title level={3}>You've bet</Title>
      <Card size='large'>
        <Title level={2}>100 DAI on Yes</Title>
      </Card>
      <Space direction='vertical'>
        <Text type='secondary'>This bet will close on. DATE&TIME</Text>
        <Text type='secondary'>
          Please note it will take 6 days from the chosen date for the answer to be confirmed.
        </Text>
      </Space>
      <div style={{ marginTop: 16 }}>
        <Title level={3}>Want to bet again?</Title>
        <Title level={4} style={{ marginTop: 0 }}>
          <Text type='secondary'>{question}</Text>
        </Title>
        <Form form={form}>
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
          <div style={{ margin: 16 }}>
            <Title level={3}>How much will you add to your wager?</Title>
            <Collateral />
            <Button type='default' htmlType='button' onClick={handleApprove}>
              Approve
            </Button>
          </div>
          <Space direction='horizontal'>
            <Form.Item>
              <Button size='large' type='default' htmlType='button' onClick={resetFields}>
                Cancel bet
              </Button>
            </Form.Item>
            <Form.Item>
              <Button size='large' type='primary' htmlType='button' onClick={handleIncreasebet}>
                Increase bet
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </div>
      <br />
      <pre>
        ConditionId: {conditionId}
        <br />
        CollectionId 1: {collectionId1}
        <br />
        CollectionId 2: {collectionId2}
        <Title level={2}>BankBucks bets</Title>
        <Title level={3}>Yes</Title>
        PositionId: {positionId1 ? positionId1.toString() : ''} <br />
        My CT Balance: {myBalance1 ? formatUnits(myBalance1) : ''}
        <br />
        CTVendor CT Balance: {ctVendorBalance1 ? formatUnits(ctVendorBalance1) : ''}
        <Title level={3}>No</Title>
        PositionId: {positionId2 ? positionId2.toString() : ''}
        <br />
        My CT Balance: {myBalance2 ? formatUnits(myBalance2) : ''}
        <br />
        CTVendor CT Balance: {ctVendorBalance2 ? formatUnits(ctVendorBalance2) : ''}
      </pre>
    </div>
  );
}
