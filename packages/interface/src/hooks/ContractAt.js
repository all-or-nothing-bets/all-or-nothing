import { useEffect, useState } from 'react';
import { Contract } from '@ethersproject/contracts';

export default function useContractAt(signer, contract, address) {
  const [instance, setInstance] = useState(null);
  useEffect(() => {
    if (!contract || !address) return;
    const newInstance = new Contract(address, contract.abi, signer);
    setInstance(newInstance);
  }, [signer, contract, address]);

  return instance;
}
