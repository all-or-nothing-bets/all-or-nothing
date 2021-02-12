import { useState } from 'react';
import usePoller from './Poller';

export default function useInitBets(wager, wagerAddress) {
  let pollTime = 1777;

  const [initBets, setInitBets] = useState();

  usePoller(
    async () => {
      if (wager && wagerAddress && wagerAddress !== '0x0000000000000000000000000000000000000000') {
        try {
          const result = await wager.getInitBets();
          setInitBets(result);
        } catch (error) {
          console.log(error);
        }
      }
    },
    pollTime,
    wager && wagerAddress,
  );

  return initBets;
}
