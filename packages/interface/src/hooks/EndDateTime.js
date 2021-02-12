import { useState, useEffect } from 'react';

export default function useWager(wager, wagerAddress) {
  const [endDateTime, setEndDateTime] = useState();
  useEffect(() => {
    if (wager && wagerAddress && wagerAddress !== '0x0000000000000000000000000000000000000000') {
      try {
        const getEndDateTime = async () => {
          const result = await wager.getEndDateTime();
          setEndDateTime(result);
        };
        getEndDateTime();
      } catch (error) {
        console.log(error);
      }
    }
  }, [wager]);

  return endDateTime;
}
