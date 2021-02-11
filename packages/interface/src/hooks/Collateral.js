import { useState, useEffect } from 'react';
import usePoller from './Poller';

export default function useWager(wager, wagerAddress) {
  let pollTime = 1777;

  const [collateral, setCollateral] = useState();

  usePoller(
    async () => {
      if (!wager || wagerAddress === '0x0000000000000000000000000000000000000000') return;
      const getCollateral = async () => {
        const result = await wager.getCollateral();
        setCollateral(result);
      };
      getCollateral();
    },
    pollTime,
    wager && wagerAddress,
  );

  return collateral;
}
