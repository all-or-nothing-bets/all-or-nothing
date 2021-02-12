import React, { useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { parseBytes32String } from '@ethersproject/strings';
import { isHexString } from '@ethersproject/bytes';
import { Button, Space, Typography, notification } from 'antd';
import { LoadingContext } from '../contexts/loadingContext';
import { useContractAt, useWager } from '../hooks';
import WagerAbi from '../abis/Wager.json';

export default function Oracle({ address, signer, readContracts, writeContracts }) {
  const { setIsLoading } = useContext(LoadingContext);
  const { Title } = Typography;

  const { questionId } = useParams();
  const question = isHexString(questionId) ? parseBytes32String(questionId) : 'Not Found';

  const { Oracle, WagerFactory } = writeContracts || '';

  console.log('Oracle', Oracle);

  const wagerAddress = useWager(WagerFactory, questionId);
  const wagerInstance = useContractAt(signer, WagerAbi, wagerAddress);

  console.log('wagerAddress', wagerAddress);
  if (Oracle) console.log('oracleAddress', Oracle.address);

  const decideYes = async () => {
    console.log('yes');
    const payouts = [0, 1];
    await Oracle.reportPayout(questionId, payouts);
  };

  const decideNo = async () => {
    console.log('no');
    setIsLoading(true);
    const payouts = [1, 0];
    try {
      await Oracle.reportPayout(questionId, payouts);
      notification.info({ message: 'Reporting payout', placement: 'bottomRight' });
      Oracle.once('error', error => {
        notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      });
      Oracle.once('LogReportPayout', (questionId, payouts) => {
        notification.success({ message: `Success: payout reported!`, placement: 'bottomRight' });
        console.log(`LogReportPayout, questionId ${questionId} payouts ${payouts}`);
        setIsLoading(false);
      });
    } catch (error) {
      notification.error({ message: `Error ${error.data?.message || error.message}`, placement: 'bottomRight' });
      setIsLoading(false);
    }
  };

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
