import React from 'react';
import { useParams } from 'react-router-dom';
import { formatBytes32String, parseBytes32String } from '@ethersproject/strings';
import { formatUnits } from '@ethersproject/units';
import { isHexString } from '@ethersproject/bytes';
import { Typography } from 'antd';
import { useConditionId, useCollectionId, usePositionId, useCTBalance } from '../hooks';

export default function Bets({ address, tx, readContracts, writeContracts }) {
  const { Title } = Typography;

  const { questionId } = useParams();
  const question = isHexString(questionId) ? parseBytes32String(questionId) : 'Not Found';

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

  return (
    <div style={{ border: '1px solid #cccccc', padding: 16, width: 450, margin: 'auto', marginTop: 64 }}>
      <Title>{question}</Title>
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
    </div>
  );
}
