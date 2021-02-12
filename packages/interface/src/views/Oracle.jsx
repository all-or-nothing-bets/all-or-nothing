import React, { useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { parseBytes32String } from '@ethersproject/strings';
import { isHexString } from '@ethersproject/bytes';
import { Button, Space, Typography } from 'antd';
import { LoadingContext } from '../contexts/loadingContext';
import { useCollateral, useContractAt, useEndDateTime, useWager } from '../hooks';
import WagerAbi from '../abis/Wager.json';

export default function Oracle({ address, signer, readContracts, writeContracts }) {
  const history = useHistory();
  const { setIsLoading } = useContext(LoadingContext);
  const { Title, Text } = Typography;

  const { questionId } = useParams();
  const question = isHexString(questionId) ? parseBytes32String(questionId) : 'Not Found';

  const { BankBucks, WagerFactory } = writeContracts || '';

  const wagerAddress = useWager(WagerFactory, questionId);
  const wagerInstance = useContractAt(signer, WagerAbi, wagerAddress);

  console.log('wagerAddress', wagerAddress);

  const decideYes = () => console.log('yes');
  const decideNo = () => console.log('no');

  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 500, margin: 'auto', marginTop: 32 }}>
      <Title>Oracle</Title>
      <Title level={5}>{question}</Title>
      <Space style={{ margin: 32 }} size='large' direction='horizontal'>
        <Button size='large' type='primary' htmlType='button' onClick={decideYes}>
          Decide Yes
        </Button>
        <Button size='large' type='primary' htmlType='button' onClick={decideNo}>
          Decide No
        </Button>
      </Space>
    </div>
  );
}
