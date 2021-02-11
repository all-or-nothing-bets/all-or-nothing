import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { parseBytes32String } from '@ethersproject/strings';
import { parseUnits } from '@ethersproject/units';
import { isHexString } from '@ethersproject/bytes';
import { Button, Form, Radio, Space, Typography } from 'antd';
import { LoadingContext } from '../contexts/loadingContext';
import { CollateralSelected } from '../components';
import { useCollateral, useContractAt, useContractReader, useContractLoader, useEndDateTime, useWager } from '../hooks';
import WagerAbi from '../contracts/Wager.abi';
import './bet.css';

export default function Bet({ signer, tx, readContracts, writeContracts }) {
  const history = useHistory();
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState();
  const { setIsLoading } = useContext(LoadingContext);
  const { Title, Text } = Typography;
  const { questionId } = useParams();
  const question = isHexString(questionId) ? parseBytes32String(questionId) : 'Not Found';

  const { BankBucks, WagerFactory } = writeContracts || '';

  // const collateral = useContractReader(readContracts, 'Wage', 'oracle');
  // console.log('oracle', oracle);

  const wagerAddress = useWager(WagerFactory, questionId);
  console.log('wagerAddress', wagerAddress);

  // console.log('WagerAbi', WagerAbi);
  const wagerInstance = useContractAt(signer, WagerAbi, wagerAddress);
  // console.log('readContracts', readContracts);
  // console.log('wagerInstance', wagerInstance);

  const collateral = useCollateral(wagerInstance, wagerAddress);
  console.log('collateral', collateral);

  const [form] = Form.useForm();

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      const data = await form.validateFields();
      // need to import relevant collateral contracts and use them, not BankBucks
      tx(BankBucks.approve(wagerInstance.address, parseUnits(data.amount)));
      // need to wait for transaction approval
      setApproved(true);
      setError(null);
    } catch (error) {
      console.log('Error approving', error);
    }
    setIsLoading(false);
  };

  const handleCreateBet = async () => {
    try {
      setIsLoading(true);
      const data = await form.validateFields();
      if (!approved) setError('approving wager is required');
      else {
        const { amount, answer } = data;
        const indexSet = answer === 'yes' ? 1 : 0;
        tx(wagerInstance.innitialBet(parseUnits(amount), indexSet));
        history.push(`/bets/${questionId}/confirmed`);
      }
    } catch (error) {
      console.log('Error creating bet', error);
    }
    setIsLoading(false);
  };

  const resetFields = () => form.resetFields();

  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 450, margin: 'auto', marginTop: 64 }}>
      <Title level={2}>{question}</Title>
      <Form form={form} initialValues={{ answer: 'no' }}>
        <Title level={4}>Place your bet:</Title>
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
          <CollateralSelected collateral={collateral} handleApprove={handleApprove} />
        </div>
        <Space direction='horizontal'>
          {/* <Form.Item>
            <Button size='large' type='default' htmlType='button' onClick={resetFields}>
              Cancel
            </Button>
          </Form.Item> */}
          <Form.Item>
            <Button size='large' type='primary' htmlType='button' onClick={handleCreateBet}>
              Place initial bet
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
