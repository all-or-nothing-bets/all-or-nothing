import { useEffect, useState } from 'react';
import { Contract } from '@ethersproject/contracts';

export default function useContractAt(signer, abi, address) {
  const [instance, setInstance] = useState(null);
  useEffect(() => {
    if (!address) return;
    const newInstance = new Contract(address, abi, signer);
    setInstance(newInstance);
  }, [signer, address]);
  return instance;
}
