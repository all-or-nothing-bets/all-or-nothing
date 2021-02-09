import { useEffect, useState } from 'react';

export default function usePositionId(conditional, collateral, collectionId) {
  const [positionId, setPositionId] = useState();

  useEffect(() => {
    if (!conditional || !collateral || !collectionId) return;
    const getPositionId = async () => {
      const result = await conditional.getPositionId(collateral.address, collectionId);
      setPositionId(result);
    };
    getPositionId();
  }, [conditional, collateral, collectionId]);

  return positionId;
}
