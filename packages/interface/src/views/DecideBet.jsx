import React, { useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { parseBytes32String } from '@ethersproject/strings';
import { isHexString } from '@ethersproject/bytes';
import { Button, Space, Typography, notification } from 'antd';
import { LoadingContext } from '../contexts/loadingContext';
import { BettorBalance, TokenBalance } from '../components';
import { useCollateral, useContractAt, useEndDateTime, useWager } from '../hooks';
import WagerAbi from '../abis/Wager.json';

export default function DecideBet({ address, signer, readContracts, writeContracts, provider }) {
  const { setIsLoading } = useContext(LoadingContext);
  const { Title, Text } = Typography;

  const { questionId } = useParams();
  const question = isHexString(questionId) ? parseBytes32String(questionId) : 'Not Found';

  const { ConditionalTokens, WagerFactory } = writeContracts || '';

  const wagerAddress = useWager(WagerFactory, questionId);
  const wagerInstance = useContractAt(signer, WagerAbi, wagerAddress);
  const collateral = useCollateral(wagerInstance, wagerAddress);

  const timestampBN = useEndDateTime(wagerInstance, wagerAddress); // BigNumber timestamp
  let utcDateTime;
  if (timestampBN) utcDateTime = new Date(+timestampBN.toString());

  const now = new Date();
  let timeLeft;
  if (utcDateTime) timeLeft = utcDateTime - now;
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let localDateTime;
  if (utcDateTime) localDateTime = utcDateTime.toLocaleDateString('en-US', options);

  const resolvedWith = 0;
  const outcomes = [1, 2];

  const handleResolve = async () => {
    setIsLoading(true);
    try {
      // need to import relevant collateral contracts and use them, not BankBucks
      await wagerInstance.resolve(resolvedWith, outcomes);
      notification.info({ message: 'Resolving wager', placement: 'bottomRight' });
      wagerInstance.once('error', error => {
        notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      });
      wagerInstance.once('LogResolve', (resolvedWith, outcomes) => {
        notification.success({ message: `Bet is resolved`, placement: 'bottomRight' });
        console.log(`LogResolve, resolvedWith ${resolvedWith} outcomes ${outcomes}`);
        setIsLoading(false);
      });
    } catch (error) {
      notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      // need to import relevant collateral contracts and use them, not BankBucks
      await ConditionalTokens.setApprovalForAll(wagerInstance.address, true);
      notification.info({ message: 'Approving withdrawels', placement: 'bottomRight' });
      ConditionalTokens.once('error', error => {
        notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      });
      ConditionalTokens.once('ApprovalForAll', (account, operator, approved) => {
        notification.success({ message: `Withdrawels are approved`, placement: 'bottomRight' });
        console.log(`LogResolve, account ${account} operator ${operator} approved ${approved}`);
        setIsLoading(false);
      });
    } catch (error) {
      notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    try {
      // need to import relevant collateral contracts and use them, not BankBucks
      await wagerInstance.withdraw();
      notification.info({ message: 'Withdrawing winnings', placement: 'bottomRight' });
      wagerInstance.once('error', error => {
        notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      });
      wagerInstance.once('LogWithdraw', (better, amount) => {
        notification.success({ message: `Success: tokens withdrawn!`, placement: 'bottomRight' });
        console.log(`LogWithdraw, better ${better} amount ${amount}`);
        setIsLoading(false);
      });
    } catch (error) {
      notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      setIsLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 500, margin: 'auto', marginTop: 32 }}>
      <Title level={2}>Congratulations</Title>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🤑</div>
      <Title level={4}>You've won</Title>
      <div style={{ margin: '30px 5px 30px 5px' }}>
        <BettorBalance
          address={address}
          readContracts={readContracts}
          questionId={questionId}
          collateral={collateral}
        />
      </div>
      <Space size='large' direction='vertical'>
        <Button size='large' type='primary' htmlType='button' onClick={handleResolve}>
          Resolve wager
        </Button>
        <Button size='large' type='primary' htmlType='button' onClick={handleApprove}>
          Approve withdrawels
        </Button>
        <Button size='large' type='primary' htmlType='button' onClick={handleWithdraw}>
          Withdraw tokens
        </Button>
        <Title level={5}>{question}</Title>
      </Space>
      <Title level={4}>Correct answer: NO</Title>
      <Text type='secondary'>This bet ended on {localDateTime}</Text>

      <Title level={5}>Your ERC20 wallet token balance:</Title>
      <TokenBalance contracts={readContracts} name='BankBucks' address={address} provider={provider} />
    </div>
  );
}
