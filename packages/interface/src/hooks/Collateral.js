import { useState } from 'react';
import usePoller from './Poller';

export default function useWager(wager, wagerAddress) {
  let pollTime = 1777;

  const [collateral, setCollateral] = useState();

  usePoller(
    async () => {
      if (wager && wagerAddress && wagerAddress !== '0x0000000000000000000000000000000000000000') {
        try {
          const result = await wager.getCollateral();
          setCollateral(result);
        } catch (error) {
          console.log(error);
        }
      }
    },
    pollTime,
    wager && wagerAddress,
  );

  return collateral;
}
