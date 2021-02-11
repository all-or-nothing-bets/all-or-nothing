import { useState } from 'react';
import usePoller from './Poller';

export default function useWager(factory, questionId) {
  let pollTime = 1777;

  const [wager, setWager] = useState();

  usePoller(
    async () => {
      if (!factory || !questionId) return;
      const getWager = async () => {
        const result = await factory.getWager(questionId);
        setWager(result);
      };
      getWager();
    },
    pollTime,
    factory && questionId,
  );

  return wager;
}
