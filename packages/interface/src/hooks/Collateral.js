import { useState, useEffect } from 'react';

export default function useWager(wager) {
  const [collateral, setCollateral] = useState();
  useEffect(() => {
    if (!wager) return;
    const getCollateral = async () => {
      const result = await wager.getCollateral();
      setCollateral(result);
    };
    getCollateral();
  }, [wager]);

  return collateral;
}
