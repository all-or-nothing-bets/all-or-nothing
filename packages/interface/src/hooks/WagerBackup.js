import { useState, useEffect } from 'react';

export default function useWager(factory, questionId) {
  const [wager, setWager] = useState();
  useEffect(() => {
    if (!factory || !questionId) return;
    const getWager = async () => {
      const result = await factory.getWager(questionId);
      setWager(result);
    };
    getWager();
  }, [questionId, factory]);

  return wager;
}
