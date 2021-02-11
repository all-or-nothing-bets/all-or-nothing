import { useState, useEffect } from 'react';

export default function useWager(wager, wagerAddress) {
  const [collateral, setCollateral] = useState();
  useEffect(() => {
    if (!wager || wagerAddress === '0x0000000000000000000000000000000000000000') return;
    const getCollateral = async () => {
      const result = await wager.getCollateral();
      setCollateral(result);
    };
    getCollateral();
  }, [wager, wagerAddress]);

  return collateral;
}
