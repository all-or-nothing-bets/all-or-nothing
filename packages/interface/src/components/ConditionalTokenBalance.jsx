import React, { useEffect, useState } from 'react';
import { formatBytes32String } from '@ethersproject/strings';
import { formatUnits } from '@ethersproject/units';

export default function ConditionalTokenBalance(props) {
  const collateral = props.contracts && props.contracts[props.collateral];
  const conditional = props.contracts && props.contracts[props.conditional];
  const { address } = props;
  const ctVendor = props.contracts && props.contracts.CTVendor;

  const [conditionId, setConditionId] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [balance, setBalance] = useState('');

  useEffect(() => {
    if (!ctVendor) return;
    const getConditionId = async () => {
      const response = await ctVendor.getConditionId();
      if (response !== '0x0000000000000000000000000000000000000000') setConditionId(response);
    };
    getConditionId();
  }, [ctVendor]);

  useEffect(() => {
    if (!conditionId) return;
    const getCollectionId = async () => {
      const response = await conditional.getCollectionId(formatBytes32String(0), conditionId, 1);
      if (response !== '0x0000000000000000000000000000000000000000') setCollectionId(response);
    };
    getCollectionId();
  }, [conditionId]);

  useEffect(() => {
    if (!collectionId) return;
    const getPositionId = async () => {
      const response = await conditional.getPositionId(collateral.address, collectionId);
      if (response !== '0x0000000000000000000000000000000000000000') setPositionId(response);
    };
    getPositionId();
  }, [collateral, collectionId]);

  useEffect(() => {
    if (!positionId) return;
    const getBalance = async () => {
      const response = await conditional.balanceOf(ctVendor.address, positionId);
      if (response !== '0x0000000000000000000000000000000000000000') setBalance(response);
    };
    getBalance();
  }, [ctVendor, positionId]);

  // const conditionId = useContractReader(props.contracts, "CTVendor", "conditionId");

  // const balance = useTokenBalance(tokenContract, props.address, 1777);

  // console.log("collateralToken", collateral);
  // console.log("conditionalToken", conditional);
  // console.log("address", address);
  // console.log("conditionId", conditionId);

  let floatBalance = parseFloat('0.00');

  // let usingBalance = balance;

  // if (typeof props.balance !== "undefined") {
  // usingBalance = props.balance;
  // }

  // if (usingBalance) {
  // const etherBalance = format(usingBalance);
  // parseFloat(etherBalance).toFixed(2);
  // floatBalance = parseFloat(etherBalance);
  // }

  // const displayBalance = floatBalance.toFixed(4);

  // if (props.dollarMultiplier && dollarMode) {
  //   displayBalance = "$" + (floatBalance * props.dollarMultiplier).toFixed(2);
  // }

  return (
    <span
      style={{
        verticalAlign: 'middle',
        fontSize: 14,
        padding: 8,
      }}
    >
      <br />
      ConditionId: {conditionId}
      <br />
      CollectionId: {collectionId}
      <br />
      PositionId: {positionId.toString()}
      <br />
      Balance: {balance ? formatUnits(balance, 18) : ''}
    </span>
  );
}
