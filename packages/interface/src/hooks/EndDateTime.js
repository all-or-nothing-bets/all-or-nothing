import { useState, useEffect } from 'react';

export default function useWager(wager) {
  const [endDateTime, setEndDateTime] = useState();
  useEffect(() => {
    if (!wager) return;
    const getEndDateTime = async () => {
      const result = await wager.getEndDateTime();
      setEndDateTime(result);
    };
    getEndDateTime();
  }, [wager]);

  return endDateTime;
}
