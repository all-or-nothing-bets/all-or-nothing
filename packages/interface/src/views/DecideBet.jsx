import React, { useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { parseBytes32String } from '@ethersproject/strings';
import { parseUnits } from '@ethersproject/units';
import { isHexString } from '@ethersproject/bytes';
import { Button, Space, Typography } from 'antd';
import { LoadingContext } from '../contexts/loadingContext';
import { BettorBalance } from '../components';
import { useCollateral, useContractAt, useEndDateTime, useWager } from '../hooks';
import WagerAbi from '../abis/Wager.json';

export default function DecideBet({ address, signer, readContracts, writeContracts }) {
  const history = useHistory();
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
  let timeLeft;
  if (utcDateTime) timeLeft = utcDateTime - now;
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let localDateTime;
  if (utcDateTime) localDateTime = utcDateTime.toLocaleDateString('en-US', options);

  const handleRedeem = () => console.log('redeem');

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
        <Button size='large' type='primary' htmlType='button' onClick={handleRedeem}>
          Redeem
        </Button>
        <Title level={5}>{question}</Title>
      </Space>
      <Title level={4}>Correct answer: YES</Title>
      <Text type='secondary'>This bet ended on {localDateTime}</Text>
    </div>
  );
}
