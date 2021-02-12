import React from 'react';
import { formatBytes32String } from '@ethersproject/strings';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { Card, Typography } from 'antd';
import { useConditionId, useCollectionId, usePositionId, useCTBalance } from '../hooks';
import BANKBUCKS_ADDRESS from '../contracts/BankBucks.address';
import { DAI_ADDRESS } from '../constants.js';

export default function BettorBalance({ address, readContracts, questionId, collateral }) {
  const { Title } = Typography;

  const { BankBucks, ConditionalTokens } = readContracts || '';
  const oracle = '0x41A7C1c354949Eb3a97e4943BD1D5Dc4e12040a8'; // oracle
  const outcomes = 2;
  const conditionId = useConditionId(ConditionalTokens, oracle, questionId, outcomes);

  const collectionId1 = useCollectionId(ConditionalTokens, formatBytes32String(0), conditionId, 1);
  const collectionId2 = useCollectionId(ConditionalTokens, formatBytes32String(0), conditionId, 2);

  const positionId1 = usePositionId(ConditionalTokens, BankBucks, collectionId1);
  const positionId2 = usePositionId(ConditionalTokens, BankBucks, collectionId2);

  const myBalance1 = useCTBalance(ConditionalTokens, address, positionId1);
  const myBalance2 = useCTBalance(ConditionalTokens, address, positionId2);

  let bal1BN, bal2BN, netBN, net;
  if (myBalance1) bal1BN = BigNumber.from(myBalance1);
  if (myBalance2) bal2BN = BigNumber.from(myBalance2);
  if (myBalance1 && myBalance2) {
    netBN = bal1BN.sub(bal2BN);
    net = formatUnits(netBN);
  }

  let symbol;
  switch (collateral) {
    case BANKBUCKS_ADDRESS:
      symbol = 'BKB';
      break;
    case DAI_ADDRESS:
      symbol = 'DAI';
      break;
    default:
      symbol = '';
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {net && (
        <Card size='large'>
          You've bet
          <Title level={4}>
            {Math.abs(net)} {symbol} <strong>{net < 0 ? 'on Yes' : net > 0 ? 'on No' : ''}</strong>
          </Title>
        </Card>
      )}
    </div>
  );
}
