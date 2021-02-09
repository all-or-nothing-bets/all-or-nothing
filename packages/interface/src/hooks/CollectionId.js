import { useEffect, useState } from 'react';

export default function useCollectionId(conditional, parentCollectionId, conditionId, indexSet) {
  const [collectionId, setCollectionId] = useState();

  useEffect(() => {
    // careful if we want to check indexSet = 0 this will return
    if (!conditional || !parentCollectionId || !conditionId || !indexSet) return;
    const getCollectionId = async () => {
      const result = await conditional.getCollectionId(parentCollectionId, conditionId, indexSet);
      setCollectionId(result);
    };
    getCollectionId();
  }, [conditional, parentCollectionId, conditionId, indexSet]);

  return collectionId;
}
