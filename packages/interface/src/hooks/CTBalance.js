import { useEffect, useState } from 'react';

export default function useCTBalance(conditional, address, positionId) {
  const [balance, setBalance] = useState();

  useEffect(() => {
    if (!conditional || !address || !positionId) return;
    const getCTBalance = async () => {
      const result = await conditional.balanceOf(address, positionId);
      setBalance(result);
    };
    getCTBalance();
  }, [conditional, address, positionId]);

  return balance;
}
