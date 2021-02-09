import { useEffect, useState } from 'react';

export default function useConditionId(conditional, oracle, questionId, outcomes) {
  const [conditionId, setConditionId] = useState();

  useEffect(() => {
    if (!conditional || !oracle || !questionId || !outcomes) return;
    const getConditionId = async () => {
      const result = await conditional.getConditionId(oracle, questionId, outcomes);
      setConditionId(result);
    };
    getConditionId();
  }, [conditional, oracle, questionId, outcomes]);

  return conditionId;
}
