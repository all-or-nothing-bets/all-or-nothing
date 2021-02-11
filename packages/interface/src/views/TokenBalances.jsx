/* eslint-disable jsx-a11y/accessible-emoji */

import React from 'react';
import { useParams } from 'react-router-dom';
import { formatEther } from '@ethersproject/units';
import { Divider } from 'antd';
import { Address, Balance, TokenBalance, ConditionalTokenBalance } from '../components';
import WagerAbi from '../contracts/Wager.abi';

import { useContractAt, useWager } from '../hooks';

export default function TokenBalances({
  address,
  localProvider,
  mainnetProvider,
  yourLocalBalance,
  price,
  readContracts,
  signer,
}) {
  const { questionId } = useParams();
  const { BankBucks, WagerFactory } = readContracts || '';
  const wagerAddress = useWager(WagerFactory, questionId);
  const wagerInstance = useContractAt(signer, WagerAbi, wagerAddress);

  return (
    <div>
      <div style={{ border: '1px solid #cccccc', padding: 16, width: 400, margin: 'auto', marginTop: 64 }}>
        <h1>Token Balances</h1>
        <h2>You</h2>
        Address:
        <Address value={address} ensProvider={mainnetProvider} fontSize={16} />
        <br />
        ETH balance: {yourLocalBalance ? formatEther(yourLocalBalance) : '...'}
        <Balance address={address} provider={localProvider} dollarMultiplier={price} />
        <br />
        BankBucks tokens:
        <TokenBalance contracts={readContracts} name='BankBucks' address={address} provider={mainnetProvider} />
        <br />
        <Divider />
        <h2>Wager</h2>
        questionId: {questionId}
        <br></br>
        Address: {wagerAddress}
        <br />
        BankBucks tokens:
        <TokenBalance contracts={readContracts} name='BankBucks' address={wagerAddress} provider={mainnetProvider} />
        Conditional tokens:
        <ConditionalTokenBalance
          contracts={readContracts}
          collateral='BankBucks'
          conditional='ConditionalTokens'
          address={wagerAddress}
          provider={mainnetProvider}
        />
        <br />
        <Divider />
        <h2>ConditionalTokens</h2>
        Address:
        <Address
          value={readContracts ? readContracts.ConditionalTokens.address : readContracts}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <br />
        BankBucks tokens:
        <TokenBalance
          contracts={readContracts}
          name='BankBucks'
          address={readContracts ? readContracts.ConditionalTokens.address : readContracts}
          provider={mainnetProvider}
        />
      </div>
    </div>
  );
}
