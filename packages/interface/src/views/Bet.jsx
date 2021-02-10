import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { formatBytes32String, parseBytes32String } from '@ethersproject/strings';
import { parseUnits } from '@ethersproject/units';
import { isHexString } from '@ethersproject/bytes';
import { Button, Form, Radio, Space, Typography } from 'antd';
import { Collateral } from '../components';
import { useWager, useContractAt, useContractReader, useContractLoader } from '../hooks';
import './bet.css';

export default function Bet({ signer, tx, readContracts, writeContracts }) {
  const history = useHistory();
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState();
  const { Title, Text } = Typography;
  const { questionId } = useParams();
  const question = isHexString(questionId) ? parseBytes32String(questionId) : 'Not Found';

  const { BankBucks, CTVendor, Wager, WagerFactory } = writeContracts || '';

  const oracle = useContractReader(readContracts, 'WagerFactory', 'oracle');
  console.log('oracle', oracle);

  console.log('readContracts', readContracts);
  const wagerAddress = useWager(WagerFactory, questionId);
  console.log('wager', wagerAddress);

  const wager = useContractAt(signer, Wager, wagerAddress);
  console.log('wager', wager);
  // const wager = useContractLoader('Wager', signer);
  // console.log('wager contract', wager);

  const [form] = Form.useForm();

  const handleApprove = async () => {
    try {
      const data = await form.validateFields();
      // need to import relevant collateral contracts and use them, not BankBucks
      tx(BankBucks.approve(CTVendor.address, parseUnits(data.amount)));
      // need to wait for transaction approval
      setApproved(true);
      setError(null);
    } catch (error) {
      console.log('Error approving', error);
    }
  };

  const handleCreateBet = async () => {
    try {
      const data = await form.validateFields();
      if (!approved) setError('approving wager is required');
      else {
        const { question, amount, answer } = data;
        const questionId = formatBytes32String(question);
        const indexSet = answer === 'yes' ? 1 : 2;
        const args = [
          '0x41A7C1c354949Eb3a97e4943BD1D5Dc4e12040a8', // oracle
          questionId,
          2, // number of outcomes,
          parseUnits(amount),
          indexSet,
        ];
        tx(CTVendor.setupConditionAndCollateral(...args));
        history.push(`/bets/${questionId}/confirmed`);
      }
    } catch (error) {
      console.log('Error creating bet', error);
    }
  };

  const resetFields = () => form.resetFields();

  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 450, margin: 'auto', marginTop: 64 }}>
      <Title>{question}</Title>
      <Form form={form}>
        <div style={{ margin: 8 }}>
          <Form.Item name='answer' rules={[{ required: true }]}>
            <Radio.Group size='large'>
              <Space direction='horizontal'>
                <Radio.Button value='yes'>
                  <Text style={{ fontSize: 24, fontWeight: 600 }}>Yes</Text>
                </Radio.Button>
                <Radio.Button value='no'>
                  <Text style={{ fontSize: 24, fontWeight: 600 }}>No</Text>
                </Radio.Button>
              </Space>
            </Radio.Group>
          </Form.Item>
        </div>
        <div style={{ margin: 16 }}>
          <Title level={3}>Place your bet:</Title>
          <Collateral />
        </div>
        <Space direction='horizontal'>
          <Form.Item>
            <Button size='large' type='default' htmlType='button' onClick={resetFields}>
              Cancel
            </Button>
          </Form.Item>
          <Form.Item>
            <Button size='large' type='primary' htmlType='button' onClick={handleCreateBet}>
              Create my bet
            </Button>
          </Form.Item>
        </Space>
        <div className='ant-form-item-explain ant-form-item-explain-error'>
          <div role='alert'>{error}</div>
        </div>
      </Form>
    </div>
  );
}
