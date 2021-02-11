import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { parseBytes32String } from '@ethersproject/strings';
import { formatUnits, parseUnits } from '@ethersproject/units';
import { isHexString } from '@ethersproject/bytes';
import { Button, Form, Radio, Space, Typography, notification } from 'antd';
import { LoadingContext } from '../contexts/loadingContext';
import { CollateralAmountSelected } from '../components';
import { useCollateral, useContractAt, useInitBets, useWager } from '../hooks';
import WagerAbi from '../contracts/Wager.abi';
import './bet.css';

export default function BetSecond({ signer, tx, readContracts, writeContracts }) {
  const history = useHistory();
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
  const initBets = useInitBets(wagerInstance, wagerAddress);
  // console.log('initBets', initBets);

  const [form] = Form.useForm();

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const data = await form.validateFields();
      // need to import relevant collateral contracts and use them, not BankBucks
      await BankBucks.approve(wagerInstance.address, parseUnits(firstBet));

      notification.info({ message: 'Approving ERC20 token transfer', placement: 'bottomRight' });
      BankBucks.once('error', error => {
        notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      });
      BankBucks.once('Approval', (owner, spender, value) => {
        notification.success({ message: `Success: approved ERC20token transfer!`, placement: 'bottomRight' });
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

  const handleMatchBet = async () => {
    setIsLoading(true);
    try {
      const data = await form.validateFields();
      if (!approved) setError('approving wager is required');
      else {
        const { answer } = data;
        const indexSet = answer === 'yes' ? 1 : 0;
        console.log(`answer ${answer} indexSet ${indexSet} firstBet ${firstBet}`);

        await wagerInstance.bet(parseUnits(firstBet), indexSet);

        notification.info({ message: 'Placing bet', placement: 'bottomRight' });
        wagerInstance.once('error', error => {
          notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
        });
        wagerInstance.once('LogMatchedBet', (better, amount, outcomeIndex) => {
          notification.success({ message: `Success: bet matched!`, placement: 'bottomRight' });
          console.log(`LogMatchedBet, better ${better} amount ${amount} outcomeIndex ${outcomeIndex}`);
          setIsLoading(false);
          // history.push(`/bets/${questionId}/confirmed`);
        });
      }
    } catch (error) {
      notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      setIsLoading(false);
    }
  };

  const resetFields = () => form.resetFields();

  let firstBetOutcomes;
  let firstBet;
  let answer;
  if (initBets) {
    firstBetOutcomes = initBets[1]; // either 1 yes or 0
    firstBet = formatUnits(initBets[2]); // ERC20 token amount, BigNumber
  }
  if (firstBetOutcomes) {
    answer = firstBetOutcomes[0].toString() === '1' ? 'No' : 'Yes';
  }
  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 450, margin: 'auto', marginTop: 64 }}>
      <Title level={2}>{question}</Title>
      <Form form={form}>
        <Title level={4}>Place your bet:</Title>
        <div style={{ margin: 8 }}>
          <Form.Item name='answer' rules={[{ required: true }]}>
            <Radio.Group size='large'>
              <Space direction='horizontal'>
                <Radio.Button value={answer ? answer.toLowerCase() : ''}>
                  <Text style={{ fontSize: 24, fontWeight: 600 }}>{answer}</Text>
                </Radio.Button>
              </Space>
            </Radio.Group>
          </Form.Item>
        </div>
        <div style={{ margin: 16 }}>
          <CollateralAmountSelected collateral={collateral} amount={firstBet} handleApprove={handleApprove} />
        </div>
        <Space direction='horizontal'>
          <Form.Item>
            <Button size='large' type='primary' htmlType='button' onClick={handleMatchBet}>
              Match the bet
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
