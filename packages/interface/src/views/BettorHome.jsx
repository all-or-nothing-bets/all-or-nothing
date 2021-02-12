import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { parseBytes32String } from '@ethersproject/strings';
import { parseUnits } from '@ethersproject/units';
import { isHexString } from '@ethersproject/bytes';
import { Button, Form, Radio, Space, Typography, notification } from 'antd';
import { LoadingContext } from '../contexts/loadingContext';
import { BetEnds, BettorBalance, CollateralSelected } from '../components';
import { useCollateral, useContractAt, useEndDateTime, useWager } from '../hooks';
import WagerAbi from '../contracts/Wager.abi';
import './betCommunity.css';

export default function BettorHome({ address, signer, readContracts, writeContracts }) {
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState();
  const { setIsLoading } = useContext(LoadingContext);
  const { Title, Text } = Typography;

  const { questionId } = useParams();
  const question = isHexString(questionId) ? parseBytes32String(questionId) : 'Not Found';

  const { BankBucks, WagerFactory } = writeContracts || '';

  const wagerAddress = useWager(WagerFactory, questionId);
  const wagerInstance = useContractAt(signer, WagerAbi, wagerAddress);
  const collateral = useCollateral(wagerInstance, wagerAddress);

  const timestampBN = useEndDateTime(wagerInstance, wagerAddress); // BigNumber timestamp
  let utcDateTime;
  if (timestampBN) utcDateTime = new Date(+timestampBN.toString());

  const now = new Date();

  const [form] = Form.useForm();

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const data = await form.validateFields();
      // need to import relevant collateral contracts and use them, not BankBucks
      await BankBucks.approve(wagerInstance.address, parseUnits(data.amount));

      notification.info({ message: 'Approving ERC20 token transfer', placement: 'bottomRight' });
      BankBucks.once('error', error => {
        notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      });
      BankBucks.once('Approval', (owner, spender, value) => {
        notification.success({ message: `Success: approved ERC20 token transfer!`, placement: 'bottomRight' });
        console.log(`Approval, owner ${owner} spender ${spender} value ${value}`);
        setIsLoading(false);
      });
      setApproved(true);
      setError(null);
    } catch (error) {
      notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      setIsLoading(false);
    }
  };

  const handleCreateBet = async () => {
    setIsLoading(true);
    try {
      const data = await form.validateFields();
      if (!approved) setError('approving wager is required');
      else {
        const { amount, answer } = data;
        const indexSet = answer === 'yes' ? 1 : 0;
        await wagerInstance.buy(parseUnits(amount), indexSet);
        notification.info({ message: 'Increasing bet', placement: 'bottomRight' });
        wagerInstance.once('error', error => {
          notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
        });
        wagerInstance.once('LogCommunityBet', (better, amount, outcomeIndex) => {
          notification.success({ message: `Success: bet increased!`, placement: 'bottomRight' });
          console.log(`LogCommunityBet, better ${better} amount ${amount} outcomeIndex ${outcomeIndex}`);
          setIsLoading(false);
          window.location.reload();
        });
      }
    } catch (error) {
      notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      setIsLoading(false);
    }
  };

  const resetFields = () => form.resetFields();

  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 500, margin: 'auto', marginTop: 32 }}>
      <Title level={2}>{question}</Title>
      <BettorBalance address={address} readContracts={readContracts} questionId={questionId} collateral={collateral} />
      <Form form={form}>
        <Title level={4}>Add to your bet:</Title>
        <div style={{ margin: 8 }}>
          <Form.Item name='answer' rules={[{ required: true }]}>
            <Radio.Group size='large'>
              <Space direction='horizontal'>
                <Radio.Button value='yes'>
                  <Text style={{ fontSize: 24 }}>
                    on <strong>Yes</strong>
                  </Text>
                </Radio.Button>
                <Radio.Button value='no'>
                  <Text style={{ fontSize: 24 }}>
                    on <strong>No</strong>
                  </Text>
                </Radio.Button>
              </Space>
            </Radio.Group>
          </Form.Item>
        </div>
        <BetEnds utcDateTime={utcDateTime} />
        <div style={{ marginTop: 32 }}>
          <Title level={4}>Increase your bet by how much?</Title>
          <CollateralSelected collateral={collateral} handleApprove={handleApprove} />
        </div>
        <Space direction='horizontal'>
          <Form.Item>
            <Button size='large' type='default' htmlType='button' onClick={resetFields}>
              Reset
            </Button>
          </Form.Item>
          <Form.Item>
            <Button size='large' type='primary' htmlType='button' onClick={handleCreateBet}>
              Increase
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
